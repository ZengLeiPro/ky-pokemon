# 设计方案：在线状态系统 + 对战掉线判负

## 目标

1. 只有双方都在线时才能发起对战
2. 对战中一方掉线超过 60 秒，自动判掉线方输
3. 双方都掉线，先掉线的输
4. 好友列表显示每个好友的在线/离线状态

---

## 一、总体架构

采用**心跳轮询**方案：前端每 15 秒发一次心跳请求，服务端更新 `lastSeenAt` 时间戳。
判定规则：`lastSeenAt` 超过 30 秒未更新即视为离线。

### 关键常量

| 常量 | 值 | 说明 |
|------|------|------|
| `HEARTBEAT_INTERVAL` | 15 秒 | 前端心跳发送间隔 |
| `ONLINE_THRESHOLD` | 30 秒 | 超过此时间未心跳视为离线 |
| `BATTLE_DISCONNECT_TIMEOUT` | 60 秒 | 对战中掉线超过此时间判负 |

---

## 二、数据库变更

### 2.1 修改 `User` 模型

**文件**: `server/prisma/schema.prisma`

在 `User` 模型中添加一个字段：

```prisma
model User {
  id           String    @id @default(uuid())
  username     String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  lastSeenAt   DateTime?                        // +++ 新增：最后活跃时间

  // ... 其余关系不变
}
```

### 2.2 修改 `Battle` 模型

在 `Battle` 模型中添加掉线追踪字段：

```prisma
model Battle {
  // ... 现有字段不变

  challengerLastSeen  DateTime?   // +++ 新增：挑战者在对战中最后活跃时间
  opponentLastSeen    DateTime?   // +++ 新增：对手在对战中最后活跃时间
  finishReason        String?     // +++ 新增：结束原因 'normal' | 'surrender' | 'disconnect'

  // ... 其余不变
}
```

### 2.3 生成迁移

```bash
cd server
npx prisma migrate dev --name add_online_presence
```

---

## 三、后端变更

### 3.1 新增心跳路由

**新文件**: `server/src/routes/presence.ts`

```typescript
import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const presence = new Hono<{ Variables: { user: { userId: string } } }>();
presence.use('/*', authMiddleware);

// 心跳端点 - 前端每 15 秒调用一次
presence.post('/heartbeat', async (c) => {
  const user = c.get('user');

  await db.user.update({
    where: { id: user.userId },
    data: { lastSeenAt: new Date() }
  });

  return c.json({ success: true });
});

export default presence;
```

**注册路由**（`server/src/index.ts`）：

```typescript
import presence from './routes/presence.js';
// ...
app.route('/api/presence', presence);
```

### 3.2 新增在线判断工具函数

**新文件**: `server/src/lib/online-utils.ts`

```typescript
const ONLINE_THRESHOLD_MS = 30 * 1000; // 30 秒

export function isUserOnline(lastSeenAt: Date | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - lastSeenAt.getTime() < ONLINE_THRESHOLD_MS;
}
```

### 3.3 修改好友列表接口 —— 返回在线状态

**文件**: `server/src/routes/friend.ts`

修改 `GET /list` 端点，在查询 friendship 时同时 include `user.lastSeenAt` 和 `friend.lastSeenAt`，返回时增加 `isOnline` 字段。

**变更内容**：

```typescript
// 修改 GET /list 中的 include
include: {
  user: { select: { id: true, username: true, lastSeenAt: true } },   // +++ 加 lastSeenAt
  friend: { select: { id: true, username: true, lastSeenAt: true } }  // +++ 加 lastSeenAt
}

// 修改 map 返回值
const friends = friendships.map(f => {
  const friendUser = f.userId === user.userId ? f.friend : f.user;
  return {
    id: f.id,
    odId: friendUser.id,
    username: friendUser.username,
    status: f.status,
    isOnline: isUserOnline(friendUser.lastSeenAt),  // +++ 新增
    createdAt: f.createdAt.toISOString()
  };
});
```

### 3.4 修改发起对战接口 —— 检查对方在线

**文件**: `server/src/routes/battle.ts`

修改 `POST /challenge` 端点，在现有验证之后、创建对战之前增加在线检查：

```typescript
// 在 "获取挑战者队伍" 之前增加：
const opponent = await db.user.findUnique({
  where: { id: opponentId },
  select: { lastSeenAt: true }
});

if (!isUserOnline(opponent?.lastSeenAt ?? null)) {
  return c.json({ success: false, error: '对方当前不在线，无法发起对战' }, 400);
}
```

### 3.5 修改对战状态接口 —— 心跳 + 掉线检测

**文件**: `server/src/routes/battle.ts`

修改 `GET /:id/state` 端点。这是前端在对战中每 1 秒轮询的端点，正好复用为"对战内心跳"：

**关键逻辑**：

```typescript
battle.get('/:id/state', async (c) => {
  const user = c.get('user');
  const battleId = c.req.param('id');
  const now = new Date();

  const battleRecord = await db.battle.findFirst({
    where: {
      id: battleId,
      OR: [
        { challengerId: user.userId },
        { opponentId: user.userId }
      ]
    },
    include: {
      challenger: { select: { username: true, lastSeenAt: true } },  // +++ 加 lastSeenAt
      opponent: { select: { username: true, lastSeenAt: true } },    // +++ 加 lastSeenAt
      turnLogs: { orderBy: { turn: 'desc' }, take: 1 }
    }
  });

  if (!battleRecord) {
    return c.json({ success: false, error: '对战不存在' }, 404);
  }

  // +++ 更新当前用户在对战中的最后活跃时间
  const isChallenger = battleRecord.challengerId === user.userId;
  await db.battle.update({
    where: { id: battleId },
    data: isChallenger
      ? { challengerLastSeen: now }
      : { opponentLastSeen: now }
  });

  // +++ 同时更新用户全局 lastSeenAt（复用轮询作为心跳）
  await db.user.update({
    where: { id: user.userId },
    data: { lastSeenAt: now }
  });

  // +++ 掉线检测（仅当对战 active 时检查）
  if (battleRecord.status === 'active') {
    const DISCONNECT_TIMEOUT_MS = 60 * 1000;  // 60 秒

    const challengerLastSeen = isChallenger ? now : battleRecord.challengerLastSeen;
    const opponentLastSeen = isChallenger ? battleRecord.opponentLastSeen : now;

    const challengerOffline = !challengerLastSeen ||
      (now.getTime() - challengerLastSeen.getTime() > DISCONNECT_TIMEOUT_MS);
    const opponentOffline = !opponentLastSeen ||
      (now.getTime() - opponentLastSeen.getTime() > DISCONNECT_TIMEOUT_MS);

    if (challengerOffline || opponentOffline) {
      let winnerId: string | null = null;
      let finishReason = 'disconnect';

      if (challengerOffline && opponentOffline) {
        // 双方都掉线 -> 看谁先掉的（lastSeen 更早的输）
        const cTime = challengerLastSeen?.getTime() ?? 0;
        const oTime = opponentLastSeen?.getTime() ?? 0;
        winnerId = cTime >= oTime ? battleRecord.challengerId : battleRecord.opponentId;
      } else if (challengerOffline) {
        winnerId = battleRecord.opponentId;
      } else {
        winnerId = battleRecord.challengerId;
      }

      await db.battle.update({
        where: { id: battleId },
        data: {
          status: 'finished',
          winnerId,
          finishReason
        }
      });

      // 重新读取更新后的记录
      const updatedRecord = await db.battle.findUnique({
        where: { id: battleId },
        include: {
          challenger: { select: { username: true } },
          opponent: { select: { username: true } },
          turnLogs: { orderBy: { turn: 'desc' }, take: 1 }
        }
      });

      // 返回已结束的对战状态（下面正常返回即可）
      // 注意：这里 battleRecord 已过时，需要用 updatedRecord
      return c.json({
        success: true,
        data: {
          id: updatedRecord!.id,
          challengerId: updatedRecord!.challengerId,
          challengerUsername: updatedRecord!.challenger.username,
          opponentId: updatedRecord!.opponentId,
          opponentUsername: updatedRecord!.opponent.username,
          status: 'finished',
          challengerTeam: JSON.parse(updatedRecord!.challengerTeam),
          opponentTeam: updatedRecord!.opponentTeam ? JSON.parse(updatedRecord!.opponentTeam) : null,
          currentState: updatedRecord!.currentState ? JSON.parse(updatedRecord!.currentState) : null,
          currentTurn: updatedRecord!.currentTurn,
          myActionSubmitted: false,
          opponentActionSubmitted: false,
          winnerId: updatedRecord!.winnerId,
          isChallenger,
          lastTurnLog: updatedRecord!.turnLogs[0]
            ? JSON.parse(updatedRecord!.turnLogs[0].log)
            : null,
          finishReason: 'disconnect'  // +++ 新增字段
        }
      });
    }
  }

  // 原有的 pending / active 检查和正常返回逻辑保持不变...
  // 在返回 data 时增加 finishReason 字段：
  // finishReason: battleRecord.finishReason ?? null
});
```

### 3.6 修改投降接口 —— 记录结束原因

**文件**: `server/src/routes/battle.ts`

修改 `POST /:id/surrender`，增加 `finishReason: 'surrender'`：

```typescript
await db.battle.update({
  where: { id: battleId },
  data: {
    status: 'finished',
    winnerId,
    finishReason: 'surrender'    // +++ 新增
  }
});
```

### 3.7 修改回合处理 —— 记录结束原因

**文件**: `server/src/routes/battle.ts`

在 `POST /:id/action` 的回合处理逻辑中，当 `winnerId` 存在时，增加 `finishReason: 'normal'`：

```typescript
data: {
  // ... 现有字段
  status: winnerId ? 'finished' : 'active',
  winnerId: winnerId === 'challenger' ? updatedBattle.challengerId
    : winnerId === 'opponent' ? updatedBattle.opponentId
    : null,
  finishReason: winnerId ? 'normal' : undefined    // +++ 新增
}
```

同时，在提交 action 时也更新当前用户的 `lastSeenAt` 和 `challengerLastSeen/opponentLastSeen`：

```typescript
// 在保存行动的同时更新活跃时间
const now = new Date();
await db.battle.update({
  where: { id: battleId },
  data: {
    ...(isChallenger
      ? { challengerAction: actionJson, challengerLastSeen: now }
      : { opponentAction: actionJson, opponentLastSeen: now })
  }
});
await db.user.update({
  where: { id: user.userId },
  data: { lastSeenAt: now }
});
```

### 3.8 修改接受对战接口 —— 初始化对战活跃时间

**文件**: `server/src/routes/battle.ts`

修改 `POST /:id/accept`，在更新 battle 数据时同时设置双方的 `challengerLastSeen` 和 `opponentLastSeen`：

```typescript
await tx.battle.update({
  where: { id: battleId },
  data: {
    status: 'active',
    opponentTeam: JSON.stringify(opponentTeam),
    currentState: JSON.stringify(initialState),
    currentTurn: 1,
    challengerLastSeen: new Date(),   // +++ 新增
    opponentLastSeen: new Date()      // +++ 新增
  }
});
```

---

## 四、共享类型变更

### 4.1 修改 Friend 类型

**文件**: `shared/types/social.ts`

```typescript
export interface Friend {
  id: string;
  odId: string;
  username: string;
  status: FriendshipStatus;
  isOnline: boolean;          // +++ 新增
  createdAt: string;
}
```

### 4.2 修改 BattleData 类型

```typescript
export interface BattleData {
  // ... 现有字段不变
  finishReason?: string | null;  // +++ 新增：'normal' | 'surrender' | 'disconnect'
}
```

---

## 五、前端变更

### 5.1 添加全局心跳机制

**文件**: `src/stores/socialStore.ts`

新增心跳相关的 state 和 actions：

```typescript
// State 新增
heartbeatInterval: number | null;

// Actions 新增
startHeartbeat: () => void;
stopHeartbeat: () => void;
```

实现：

```typescript
startHeartbeat: () => {
  const { heartbeatInterval } = get();
  if (heartbeatInterval) return;

  const beat = async () => {
    try {
      await fetch(`${API_URL}/presence/heartbeat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    } catch (e) {
      console.error('心跳失败', e);
    }
  };

  // 立即发一次
  beat();
  const interval = window.setInterval(beat, 15000); // 15秒
  set({ heartbeatInterval: interval });
},

stopHeartbeat: () => {
  const { heartbeatInterval } = get();
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    set({ heartbeatInterval: null });
  }
},
```

### 5.2 在登录后启动心跳

**文件**: `src/stores/authStore.ts`

在 `login()` 和 `checkAuth()` 成功后调用 `useSocialStore.getState().startHeartbeat()`。

在 `logout()` 中调用 `useSocialStore.getState().stopHeartbeat()`。

也可以改为在 `App.tsx` 中监听登录状态：

```typescript
// App.tsx 中
useEffect(() => {
  if (isLoggedIn) {
    useSocialStore.getState().startHeartbeat();
  } else {
    useSocialStore.getState().stopHeartbeat();
  }
  return () => useSocialStore.getState().stopHeartbeat();
}, [isLoggedIn]);
```

### 5.3 修改好友列表 —— 显示在线状态

**文件**: `src/components/social/FriendsView.tsx`

在好友名称旁边添加在线状态指示：

```tsx
// 在 friend.username 前面加一个状态点
<span className="font-medium flex items-center gap-2">
  <span className={`w-2 h-2 rounded-full ${
    friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
  }`} />
  {friend.username}
  {!friend.isOnline && (
    <span className="text-xs text-gray-400">离线</span>
  )}
</span>
```

好友列表排序优化（在线的排前面）：

```typescript
// 在渲染好友列表时排序
const sortedFriends = [...friends].sort((a, b) => {
  if (a.isOnline && !b.isOnline) return -1;
  if (!a.isOnline && b.isOnline) return 1;
  return 0;
});
```

定期刷新好友列表获取最新在线状态（每 15 秒）：

```typescript
useEffect(() => {
  loadFriends();
  const interval = setInterval(loadFriends, 15000);
  return () => clearInterval(interval);
}, []);
```

### 5.4 修改对战按钮 —— 离线时禁用

**文件**: `src/components/social/FriendsView.tsx`

```tsx
<button
  onClick={() => {
    localStorage.setItem('battleFriendId', friend.odId);
    setShowBattleModal(true);
  }}
  disabled={!friend.isOnline}                                    // +++ 新增
  className={`px-3 py-1 text-white text-sm rounded ${
    friend.isOnline
      ? 'bg-red-500 hover:bg-red-600'
      : 'bg-gray-400 cursor-not-allowed'                         // +++ 修改
  }`}
  title={!friend.isOnline ? '对方不在线' : ''}                   // +++ 新增
>
  对战
</button>
```

### 5.5 修改 BattleChallengeModal —— 显示在线状态

**文件**: `src/components/social/BattleChallengeModal.tsx`

在好友选择列表中显示在线状态，并禁止选择离线好友：

```tsx
friends.map(friendItem => (
  <button
    key={friendItem.id}
    onClick={() => friendItem.isOnline && setSelectedFriendId(friendItem.odId)}
    disabled={!friendItem.isOnline}                              // +++ 新增
    className={`w-full p-3 rounded flex items-center justify-between ${
      !friendItem.isOnline
        ? 'bg-gray-800 opacity-50 cursor-not-allowed'            // +++ 新增
        : selectedFriendId === friendItem.odId
          ? 'bg-blue-900 border border-blue-500'
          : 'bg-gray-800 hover:bg-gray-700'
    }`}
  >
    <span className="text-white flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${                  // +++ 新增
        friendItem.isOnline ? 'bg-green-500' : 'bg-gray-500'
      }`} />
      {friendItem.username}
      {!friendItem.isOnline && (                                  // +++ 新增
        <span className="text-xs text-gray-400">离线</span>
      )}
    </span>
    {selectedFriendId === friendItem.odId && (
      <span className="text-blue-400">✓</span>
    )}
  </button>
))
```

### 5.6 修改对战视图 —— 显示掉线结束信息

**文件**: `src/components/social/PvPBattleView.tsx`

在对战结束显示区域，根据 `finishReason` 显示不同的结束原因：

```tsx
// 在顶部导航的结果显示处
{activeBattle.status === 'finished' && (
  <div className="flex items-center gap-2">
    <span className="px-2 py-1 bg-yellow-500 text-black text-sm rounded font-bold">
      {activeBattle.winnerId === myId ? '胜利！' : '失败'}
    </span>
    {activeBattle.finishReason === 'disconnect' && (
      <span className="text-xs text-gray-400">
        {activeBattle.winnerId === myId ? '对方掉线' : '你已掉线'}
      </span>
    )}
    {activeBattle.finishReason === 'surrender' && (
      <span className="text-xs text-gray-400">投降</span>
    )}
  </div>
)}
```

在对战结束后的底部区域也显示详细说明：

```tsx
{activeBattle.status === 'finished' ? (
  <div className="p-4 flex flex-col items-center gap-2">
    {activeBattle.finishReason === 'disconnect' && (
      <p className="text-sm text-gray-400">
        {activeBattle.winnerId === myId
          ? '对手因掉线超时被判定失败'
          : '你因掉线超时被判定失败'}
      </p>
    )}
    <button
      onClick={() => { setActiveBattle(null); setView('ROAM'); }}
      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      返回游戏
    </button>
  </div>
) : /* ... 现有逻辑 ... */}
```

### 5.7 对战中的掉线提示（可选优化）

在对战轮询中，服务端可以额外返回对手的在线状态。前端在等待对手操作时，如果检测到对手离线，可以显示一个倒计时提示：

```tsx
// 在 "等待对手行动..." 的位置扩展
{!isMyTurn ? (
  <div>
    <span className="text-yellow-400">等待对手行动...</span>
    {/* 如果对手离线，显示倒计时提示 */}
    {/* 这个可以通过比较 opponentLastSeen 与当前时间实现 */}
    {/* 但鉴于前端不直接知道 opponentLastSeen，此功能为可选优化 */}
  </div>
) : (
  <span className="text-green-400">选择你的行动！</span>
)}
```

> 如果需要这个功能，需在 `GET /:id/state` 的返回值中增加 `opponentOnline: boolean` 字段。

---

## 六、完整文件修改清单

### 后端文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `server/prisma/schema.prisma` | 修改 | User 加 `lastSeenAt`；Battle 加 `challengerLastSeen`, `opponentLastSeen`, `finishReason` |
| `server/src/routes/presence.ts` | **新增** | 心跳端点 `POST /heartbeat` |
| `server/src/lib/online-utils.ts` | **新增** | `isUserOnline()` 工具函数 |
| `server/src/index.ts` | 修改 | 注册 `/api/presence` 路由 |
| `server/src/routes/friend.ts` | 修改 | `GET /list` 返回 `isOnline` 字段 |
| `server/src/routes/battle.ts` | 修改 | 多处修改（见 3.4~3.8） |

### 共享类型文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `shared/types/social.ts` | 修改 | `Friend` 加 `isOnline`；`BattleData` 加 `finishReason` |

### 前端文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/stores/socialStore.ts` | 修改 | 新增心跳机制 (`startHeartbeat`/`stopHeartbeat`) |
| `src/stores/authStore.ts` 或 `src/App.tsx` | 修改 | 登录后启动心跳，登出后停止 |
| `src/components/social/FriendsView.tsx` | 修改 | 显示在线状态、禁用离线好友对战按钮、定期刷新 |
| `src/components/social/BattleChallengeModal.tsx` | 修改 | 显示在线状态、禁止选择离线好友 |
| `src/components/social/PvPBattleView.tsx` | 修改 | 显示掉线判负信息 |

---

## 七、实现顺序

按以下顺序实施，确保每一步都能编译通过：

1. **Prisma Schema + 迁移**（数据库层）
2. **`online-utils.ts`**（工具函数）
3. **`presence.ts` + `index.ts`**（心跳端点）
4. **`shared/types/social.ts`**（类型定义）
5. **`friend.ts`**（好友列表返回在线状态）
6. **`battle.ts`**（发起对战检查 + 对战中掉线检测 + 接受对战初始化活跃时间）
7. **`socialStore.ts`**（前端心跳机制）
8. **`App.tsx` 或 `authStore.ts`**（登录后启动心跳）
9. **`FriendsView.tsx`**（显示在线状态 + 禁用按钮）
10. **`BattleChallengeModal.tsx`**（显示在线状态 + 禁选离线）
11. **`PvPBattleView.tsx`**（掉线判负信息显示）

---

## 八、掉线检测时序图

```
玩家A（在线）           服务器               玩家B（掉线）
  |                      |                      |
  |---GET /state-------->|                      |
  |  (更新 A 的 lastSeen)|                      |
  |                      |--检查 B 的 lastSeen---|
  |                      |  距今 > 60 秒?        |
  |                      |                      |
  |                      |  YES → 判 B 输        |
  |                      |  更新 Battle:          |
  |                      |    status=finished    |
  |                      |    winnerId=A         |
  |                      |    finishReason=      |
  |                      |      disconnect       |
  |                      |                      |
  |<--返回 finished------|                      |
  |  A 看到"对方掉线"     |                      |
  |  B 如果回来看到"你掉线"|                     |
```

```
双方都掉线的情况：

玩家A                   服务器               玩家B
  |                      |                      |
  | (A 掉线, lastSeen=T1)|                      |
  |                      |  (B 掉线, lastSeen=T2)|
  |                      |                      |
  |  ...60 秒后 A 回来... |                      |
  |---GET /state-------->|                      |
  |                      |--检查双方 lastSeen-----|
  |                      |  A: T1 (>60s ago)    |
  |                      |  B: T2 (>60s ago)    |
  |                      |  T1 < T2 → A 先掉线   |
  |                      |  → A 输              |
  |<--返回 finished------|                      |
```

---

## 九、边界情况处理

### 9.1 对战中页面刷新
- 页面刷新后，心跳和对战轮询都会重新启动
- 只要在 60 秒内恢复轮询，不会被判负
- 现有的 `PvPBattleView` 已有 `prepareSeq` 重试机制，兼容此场景

### 9.2 网络短暂波动
- 60 秒的宽容窗口可以容忍大多数短暂波动
- 心跳每 15 秒一次 + 对战轮询每 1 秒一次，有足够的频率保持活跃

### 9.3 服务端无法主动推送
- 因为使用 HTTP 轮询而非 WebSocket，掉线检测只在"有人轮询时"触发
- 如果双方都掉线且都不回来，对战永远处于 active 状态
- **建议**：可选增加一个定时清理任务（cron job 或定期调用 `/api/internal/cleanup-stale-battles`），清理超过 24 小时无活动的对战

### 9.4 首次登录 lastSeenAt 为 null
- 新用户 `lastSeenAt` 为 null，`isUserOnline()` 返回 false，这是正确行为
- 用户登录后心跳立即发送第一次，后续即为在线

### 9.5 并发安全
- 对战状态轮询可能出现并发写入（双方同时请求 `/state`）
- 掉线判定逻辑是幂等的：多次判定结果相同
- Prisma 的 update 是原子操作，不会出现数据不一致

---

## 十、性能考量

| 操作 | 频率 | 负载 |
|------|------|------|
| 心跳 `POST /presence/heartbeat` | 每用户每 15 秒 | 轻量 UPDATE 1 行 |
| 好友列表 `GET /friend/list` | 每 15 秒（FriendsView 可见时） | SELECT + JOIN，已有索引 |
| 对战轮询 `GET /battle/:id/state` | 对战中每 1 秒 | SELECT + UPDATE 2 行 |

对于当前规模（小型社交游戏），这些负载完全可以接受。
对战轮询中同时更新 `lastSeenAt` 和 `challengerLastSeen/opponentLastSeen` 避免了额外请求。
