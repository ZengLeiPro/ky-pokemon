# P0 & P1 实施规划

## 项目背景

### 项目名称
关都传说：掌上对决 (Kanto Legends) - 一个基于 React 19 + Zustand 的宝可梦 RPG 网页游戏。

### 当前架构状态

```
ky-pokemon/
├── shared/                    # 前后端共享代码 [已完成]
│   ├── types/                 # TypeScript 类型定义
│   ├── schemas/               # Zod 运行时验证
│   ├── constants/             # 静态数据 (招式、种族、属性表)
│   └── utils/                 # 纯函数工具 (伤害计算、升级等)
│
├── server/                    # 后端服务 [已完成基础]
│   ├── src/
│   │   ├── index.ts           # Hono 入口
│   │   ├── routes/
│   │   │   ├── auth.ts        # 认证 API (注册/登录/me)
│   │   │   └── game.ts        # 存档 API (GET/POST/DELETE /save)
│   │   ├── middleware/auth.ts # JWT 验证中间件
│   │   └── lib/               # db.ts, jwt.ts
│   └── prisma/schema.prisma   # User, GameSave 模型
│
├── src/                       # 前端代码
│   ├── stores/
│   │   ├── authStore.ts       # 用户认证 [已对接后端]
│   │   └── gameStore.ts       # 游戏状态 [仍用 IndexedDB，待迁移]
│   ├── components/            # React 组件
│   └── lib/storage.ts         # IndexedDB 封装 (将废弃)
│
└── docs/                      # 文档
```

### 已完成功能

| 模块 | 状态 | 说明 |
|------|------|------|
| Shared Layer | ✅ | types, schemas, constants, utils 完整 |
| 后端框架 | ✅ | Hono + PostgreSQL + Prisma |
| 用户认证后端 | ✅ | /register, /login, /me |
| 用户认证前端 | ✅ | authStore 对接 API，Token 验证 |
| 存档 API 后端 | ✅ | GET/POST/DELETE /api/game/save |
| 存档前端对接 | ❌ | gameStore 仍用 IndexedDB |
| 用户资料修改 | ❌ | updateUsername/Password 未实现 |

---

## P0 任务清单

### 任务 1: 前端对接存档 API

**目标**: 将 `gameStore` 从 IndexedDB 迁移到后端 API，实现真正的云存档。

**当前状态分析**:

`src/stores/gameStore.ts` 当前使用:
- `loadGame(userId)` - 从 IndexedDB 加载
- `saveGame(userId)` - 保存到 IndexedDB
- `resetGame()` - 清空状态

**需要修改的文件**:
1. `src/stores/gameStore.ts` - 核心修改
2. `src/lib/storage.ts` - 可保留作为离线备份，或标记废弃

**实现步骤**:

#### 步骤 1.1: 添加 API 配置

在 `src/stores/gameStore.ts` 顶部添加:

```typescript
const API_URL = 'http://localhost:3001/api/game';

// 获取当前 token
const getToken = () => localStorage.getItem('token');
```

#### 步骤 1.2: 修改 loadGame 函数

**当前实现** (IndexedDB):
```typescript
loadGame: async (userId: string) => {
  set({ isGameLoading: true });
  const saved = await loadGameData(userId);
  if (saved) {
    set({ ...saved, isGameLoading: false });
  } else {
    set({ isGameLoading: false });
  }
}
```

**目标实现** (API):
```typescript
loadGame: async (userId: string) => {
  set({ isGameLoading: true });
  
  const token = getToken();
  if (!token) {
    set({ isGameLoading: false });
    return;
  }

  try {
    const response = await fetch(`${API_URL}/save`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (result.success && result.data) {
      const save = result.data;
      set({
        team: save.team || [],
        pcBox: save.pcBox || [],
        playerLocationId: save.currentLocation || 'pallet-town',
        badges: save.badges || [],
        pokedex: save.pokedex || {},
        inventory: save.inventory || get().inventory, // 保留默认背包
        money: save.money ?? 3000,
        hasSelectedStarter: (save.team?.length > 0),
        isGameLoading: false
      });
    } else {
      // 没有存档，使用默认状态
      set({ isGameLoading: false });
    }
  } catch (error) {
    console.error('Failed to load game:', error);
    set({ isGameLoading: false });
  }
}
```

#### 步骤 1.3: 修改 saveGame 函数

**当前实现**:
```typescript
saveGame: async (userId: string) => {
  const state = get();
  await saveGameData(userId, {
    team: state.team,
    pcBox: state.pcBox,
    // ...
  });
}
```

**目标实现**:
```typescript
saveGame: async (userId: string) => {
  const token = getToken();
  if (!token) return;

  const state = get();
  
  try {
    const response = await fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        team: state.team,
        pcBox: state.pcBox,
        currentLocationId: state.playerLocationId,
        badges: state.badges,
        pokedex: state.pokedex
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('Save failed:', result.error);
    }
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}
```

#### 步骤 1.4: 更新 SaveGameRequestSchema (如需要)

检查 `shared/schemas/api.schema.ts` 中的 `SaveGameRequestSchema` 是否包含所有需要的字段:

```typescript
export const SaveGameRequestSchema = z.object({
  team: z.array(PokemonSchema).max(6),
  pcBox: z.array(PokemonSchema),
  currentLocationId: z.string(),
  badges: z.array(z.string()),
  pokedex: z.record(z.string(), z.enum(['CAUGHT', 'SEEN', 'UNKNOWN'])),
});
```

#### 步骤 1.5: 更新后端 game.ts 返回完整数据

确保 `server/src/routes/game.ts` 的 `GET /save` 返回所有需要的字段。

**验证清单**:
- [ ] 新用户登录后，无存档时正常显示初始状态
- [ ] 选择御三家后，存档正确保存到数据库
- [ ] 刷新页面后，存档正确加载
- [ ] 退出登录后重新登录，存档仍在
- [ ] 多个浏览器/设备登录同一账号，存档同步

---

### 任务 2: 实现 updateUsername API

**后端实现** - 在 `server/src/routes/auth.ts` 添加:

```typescript
import { z } from 'zod';

const UpdateUsernameSchema = z.object({
  newUsername: z.string().min(2).max(20).regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
});

auth.put('/username', authMiddleware, async (c) => {
  const payload = c.get('user');
  const body = await c.req.json();
  
  const parsed = UpdateUsernameSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0].message }, 400);
  }

  const { newUsername } = parsed.data;

  // 检查用户名是否已存在
  const existing = await db.user.findUnique({ where: { username: newUsername } });
  if (existing && existing.id !== payload.userId) {
    return c.json({ success: false, error: '用户名已存在' }, 409);
  }

  const user = await db.user.update({
    where: { id: payload.userId },
    data: { username: newUsername },
    select: { id: true, username: true, createdAt: true }
  });

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.getTime()
      }
    }
  });
});
```

**前端实现** - 更新 `src/stores/authStore.ts`:

```typescript
updateUsername: async (newUsername: string) => {
  const token = get().token;
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/username`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ newUsername })
    });

    const result = await response.json();

    if (result.success && result.data?.user) {
      const user = result.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ currentUser: user, error: null });
      return true;
    } else {
      set({ error: result.error || '更新用户名失败' });
      return false;
    }
  } catch {
    set({ error: '网络错误，请重试' });
    return false;
  }
}
```

---

### 任务 3: 实现 updatePassword API

**后端实现** - 在 `server/src/routes/auth.ts` 添加:

```typescript
const UpdatePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100)
});

auth.put('/password', authMiddleware, async (c) => {
  const payload = c.get('user');
  const body = await c.req.json();
  
  const parsed = UpdatePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0].message }, 400);
  }

  const { oldPassword, newPassword } = parsed.data;

  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return c.json({ success: false, error: '用户不存在' }, 404);
  }

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) {
    return c.json({ success: false, error: '旧密码错误' }, 401);
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: payload.userId },
    data: { passwordHash: newHash }
  });

  return c.json({ success: true });
});
```

**前端实现** - 更新 `src/stores/authStore.ts`:

```typescript
updatePassword: async (oldPassword: string, newPassword: string) => {
  const token = get().token;
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const result = await response.json();

    if (result.success) {
      set({ error: null });
      return true;
    } else {
      set({ error: result.error || '更新密码失败' });
      return false;
    }
  } catch {
    set({ error: '网络错误，请重试' });
    return false;
  }
}
```

---

## P1 任务清单

### 任务 4: 后端单元测试

**目标**: 为核心 API 添加自动化测试。

**安装依赖**:
```bash
cd server
npm install -D vitest supertest @types/supertest
```

**配置 vitest** - 创建 `server/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

**更新 package.json**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**创建测试文件** - `server/tests/auth.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import auth from '../src/routes/auth';
import { db } from '../src/lib/db';

// 测试用 Hono app
const app = new Hono();
app.route('/api/auth', auth);

describe('Auth API', () => {
  const testUser = {
    username: `test_${Date.now()}`,
    password: 'password123'
  };
  let token: string;

  afterAll(async () => {
    // 清理测试用户
    await db.user.deleteMany({
      where: { username: { startsWith: 'test_' } }
    });
  });

  it('POST /register - 注册新用户', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.user.username).toBe(testUser.username);
    expect(typeof data.data.user.createdAt).toBe('number');
    token = data.data.token;
  });

  it('POST /register - 重复用户名应失败', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('POST /login - 正确密码登录', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('POST /login - 错误密码应失败', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testUser, password: 'wrong' })
    });

    expect(res.status).toBe(401);
  });

  it('GET /me - 有效 Token', async () => {
    const res = await app.request('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.user.username).toBe(testUser.username);
  });

  it('GET /me - 无 Token 应失败', async () => {
    const res = await app.request('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
```

---

### 任务 5: 错误边界处理

**目标**: API 请求失败时给用户友好的反馈。

**创建 Toast 通知组件** - `src/components/ui/Toast.tsx`:

```typescript
import React, { useEffect } from 'react';
import { create } from 'zustand';

interface ToastState {
  message: string | null;
  type: 'success' | 'error' | 'info';
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'info') => {
    set({ message, type });
    setTimeout(() => set({ message: null }), 3000);
  },
  hide: () => set({ message: null })
}));

export const Toast: React.FC = () => {
  const { message, type } = useToast();
  
  if (!message) return null;

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`}>
      {message}
    </div>
  );
};
```

**在 App.tsx 中使用**:
```typescript
import { Toast } from './components/ui/Toast';

const App = () => {
  return (
    <>
      <Toast />
      {/* 其他内容 */}
    </>
  );
};
```

**在 authStore 中使用**:
```typescript
import { useToast } from '../components/ui/Toast';

// 在 catch 块中
} catch (err) {
  useToast.getState().show('网络错误，请检查连接', 'error');
  return false;
}
```

---

### 任务 6: 环境变量管理

**目标**: 前端 API_URL 可通过环境变量配置。

**创建 `src/config.ts`**:
```typescript
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
};
```

**创建 `.env.development`**:
```env
VITE_API_URL=http://localhost:3001/api
```

**创建 `.env.production`**:
```env
VITE_API_URL=https://api.your-domain.com/api
```

**更新 authStore 和 gameStore**:
```typescript
import { config } from '../config';

const API_URL = `${config.apiUrl}/auth`;
```

**更新 .gitignore**:
```
.env.local
.env.production.local
```

---

## 验证清单

### P0 完成标准

- [ ] 用户登录后，从后端加载存档
- [ ] 游戏状态变化后，自动保存到后端
- [ ] 用户可成功修改用户名
- [ ] 用户可成功修改密码
- [ ] 所有 API 调用包含正确的 Authorization header
- [ ] `npm run build` 前后端均成功
- [ ] `npx tsc --noEmit` 无类型错误

### P1 完成标准

- [ ] `npm test` 在 server 目录下通过
- [ ] 网络错误时显示 Toast 提示
- [ ] 生产环境可通过环境变量配置 API 地址
- [ ] `.env.example` 文件包含所有必要变量

---

## 执行顺序建议

1. **任务 1**: 前端对接存档 API (最重要，核心功能闭环)
2. **任务 2-3**: 实现 updateUsername/Password (用户体验完整)
3. **任务 6**: 环境变量管理 (为后续部署做准备)
4. **任务 5**: 错误边界处理 (提升用户体验)
5. **任务 4**: 后端测试 (保障稳定性)

---

## 注意事项

1. **Token 管理**: 所有需要认证的 API 调用都必须在 header 中携带 `Authorization: Bearer ${token}`

2. **类型一致性**: 后端返回的 `createdAt` 已转换为 `number`，前端类型已匹配

3. **错误处理**: API 调用失败时，必须给用户反馈，不能静默失败

4. **自动保存**: `App.tsx` 中已有 2 秒防抖的自动保存逻辑，只需确保 `saveGame` 改为调用 API

5. **向后兼容**: 可保留 IndexedDB 作为离线备份方案，但优先使用后端 API
