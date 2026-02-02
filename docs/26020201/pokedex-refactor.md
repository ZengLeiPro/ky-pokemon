# 图鉴数据结构重构实施文档

> **文档版本**：v1.0
> **创建日期**：2026-02-02
> **文档用途**：指导 AI 在不同会话中接力完成图鉴系统重构
> **预计涉及文件**：约 10-15 个文件

---

## 一、背景信息

### 1.1 项目概述

这是一个宝可梦类型的 Web 游戏项目，包含以下核心功能：
- 宝可梦捕获、培养、进化
- 玩家之间的社交功能（好友、私信）
- 宝可梦交换、赠送
- PvP 实时对战

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + TypeScript + Zustand（状态管理） |
| 后端 | Express + TypeScript |
| 数据库 | PostgreSQL + Prisma ORM |
| 共享代码 | `/shared` 目录（类型定义、常量、Schema） |

### 1.3 关键目录结构

```
ky-pokemon/
├── src/                          # 前端代码
│   ├── stores/gameStore.ts       # 游戏状态管理（包含图鉴逻辑）
│   └── components/stages/DexView.tsx  # 图鉴界面组件
├── server/                       # 后端代码
│   ├── src/routes/game.ts        # 游戏数据 API
│   └── prisma/schema.prisma      # 数据库 Schema
└── shared/                       # 前后端共享
    ├── types/game.ts             # 类型定义（PokedexStatus）
    └── schemas/api.schema.ts     # API 数据验证 Schema
```

### 1.4 数据库操作规范（重要！）

**禁止直接操作数据库**。所有数据库结构变更必须通过 Prisma 迁移系统完成：

1. 修改 `server/prisma/schema.prisma`
2. 运行 `npx prisma migrate dev --name <描述>` 生成迁移文件
3. 将迁移文件提交到 Git

---

## 二、项目现状与问题

### 2.1 当前图鉴数据结构

图鉴数据存储在 `GameSave` 表的 `pokedex` 字段中，以 JSON 字符串形式保存：

**数据库 Schema（`server/prisma/schema.prisma`）：**
```prisma
model GameSave {
  id              String   @id @default(uuid())
  userId          String
  // ... 其他字段
  pokedex         String   // Record<string, PokedexStatus> (JSON string)
  // ...
}
```

**实际存储的数据示例：**
```json
{
  "1": "CAUGHT",
  "2": "SEEN",
  "3": "UNKNOWN",
  "4": "CAUGHT",
  ...
  "151": "UNKNOWN"
}
```

**类型定义（`shared/types/game.ts`）：**
```typescript
export type PokedexStatus = 'CAUGHT' | 'SEEN' | 'UNKNOWN';
```

### 2.2 当前图鉴数据流

1. **前端状态**：`src/stores/gameStore.ts` 中维护 `pokedex: Record<number, PokedexStatus>`
2. **保存到后端**：调用 API 时将 pokedex 对象 JSON.stringify 后发送
3. **后端存储**：`server/src/routes/game.ts` 将 JSON 字符串存入数据库
4. **读取恢复**：从数据库读取后 JSON.parse 还原为对象

### 2.3 图鉴状态更新位置（共 4 处）

| 位置 | 文件 | 行号（参考） | 触发条件 |
|------|------|-------------|----------|
| 1 | `src/stores/gameStore.ts` | `selectStarter` 函数 | 选择初始宝可梦时，标记为 CAUGHT |
| 2 | `src/stores/gameStore.ts` | `startWildBattle` 函数 | 遇见野生宝可梦时，UNKNOWN → SEEN |
| 3 | `src/stores/gameStore.ts` | `catchPokemon` 函数 | 捕获宝可梦时，标记为 CAUGHT |
| 4 | `src/stores/gameStore.ts` | `evolvePokemon` 函数 | 宝可梦进化时，新形态标记为 CAUGHT |

### 2.4 存在的问题

| 问题 | 说明 |
|------|------|
| **无法做全服统计** | 想查"有多少玩家捕获了皮卡丘"需要遍历所有玩家的存档并解析 JSON |
| **无法做排行榜** | 想查"谁收集的宝可梦最多"同样需要全量计算 |
| **无法追踪时间** | 不知道玩家何时遇见/捕获某只宝可梦 |
| **无法做稀有度分析** | 无法直接统计最稀有的宝可梦是哪只 |
| **数据无法索引** | JSON 字段内的数据无法建立数据库索引 |

---

## 三、实施目标

### 3.1 核心目标

将图鉴数据从 JSON 字符串改为独立的数据库表，每个玩家的每只宝可梦对应一条记录。

### 3.2 新数据结构

```prisma
model PokedexEntry {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  speciesId     Int       // 宝可梦图鉴编号 1-151
  status        String    // "SEEN" | "CAUGHT"（不存 UNKNOWN，未记录即为 UNKNOWN）
  firstSeenAt   DateTime  @default(now())  // 第一次遇见时间
  firstCaughtAt DateTime? // 第一次捕获时间（可为空）
  updatedAt     DateTime  @updatedAt

  @@unique([userId, speciesId])  // 每个玩家每只宝可梦只有一条记录
  @@index([userId])
  @@index([speciesId])
  @@index([status])
}
```

**设计要点：**
- 不存储 `UNKNOWN` 状态，数据库中没有记录即表示未遇见
- `firstSeenAt` 记录第一次遇见时间
- `firstCaughtAt` 记录第一次捕获时间（SEEN 状态时为 null）
- 通过 `@@unique([userId, speciesId])` 保证数据唯一性

### 3.3 改造后能实现的功能

1. **全服统计**：最热门/最稀有的宝可梦
2. **排行榜**：图鉴收集排行
3. **成就系统**：基于收集数量的成就
4. **时间线**：玩家的捕获历史记录
5. **数据分析**：玩家行为分析

### 3.4 兼容性要求

- 现有玩家的图鉴数据必须完整迁移，不能丢失
- 前端图鉴界面功能保持不变
- API 接口变更需向后兼容或同步更新前端

---

## 四、实施方案细节

### 4.1 阶段一：数据库 Schema 变更

#### 4.1.1 修改 Prisma Schema

**文件**：`server/prisma/schema.prisma`

**操作**：

1. 在 `User` 模型中添加关联：
```prisma
model User {
  // ... 现有字段

  // 新增：图鉴记录
  pokedexEntries  PokedexEntry[]
}
```

2. 新增 `PokedexEntry` 模型（放在文件末尾）：
```prisma
// ========== 图鉴记录 ==========
model PokedexEntry {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  speciesId     Int       // 宝可梦图鉴编号 1-151
  status        String    // "SEEN" | "CAUGHT"
  firstSeenAt   DateTime  @default(now())
  firstCaughtAt DateTime?
  updatedAt     DateTime  @updatedAt

  @@unique([userId, speciesId])
  @@index([userId])
  @@index([speciesId])
  @@index([status])
}
```

3. **暂时保留** `GameSave.pokedex` 字段，待数据迁移完成后再移除

#### 4.1.2 生成迁移文件

```bash
cd server
npx prisma migrate dev --name add_pokedex_entry_table
```

#### 4.1.3 生成 Prisma Client

```bash
npx prisma generate
```

---

### 4.2 阶段二：后端 API 改造

#### 4.2.1 新增图鉴相关 API

**文件**：新建 `server/src/routes/pokedex.ts`

需要实现的端点：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/pokedex` | GET | 获取当前用户的图鉴数据 |
| `/api/pokedex/update` | POST | 更新图鉴状态（遇见/捕获） |
| `/api/pokedex/stats` | GET | 获取全服统计数据 |
| `/api/pokedex/leaderboard` | GET | 获取图鉴排行榜 |

#### 4.2.2 GET /api/pokedex 实现逻辑

```typescript
// 从数据库查询用户的所有图鉴记录
const entries = await prisma.pokedexEntry.findMany({
  where: { userId: req.user.id }
});

// 转换为前端期望的格式 Record<number, PokedexStatus>
const pokedex: Record<number, PokedexStatus> = {};
for (let i = 1; i <= 151; i++) {
  pokedex[i] = 'UNKNOWN';
}
entries.forEach(entry => {
  pokedex[entry.speciesId] = entry.status as PokedexStatus;
});

return res.json({ pokedex });
```

#### 4.2.3 POST /api/pokedex/update 实现逻辑

```typescript
// 请求体：{ speciesId: number, status: 'SEEN' | 'CAUGHT' }
const { speciesId, status } = req.body;

// 使用 upsert 实现"有则更新，无则创建"
await prisma.pokedexEntry.upsert({
  where: {
    userId_speciesId: {
      userId: req.user.id,
      speciesId
    }
  },
  create: {
    userId: req.user.id,
    speciesId,
    status,
    firstSeenAt: new Date(),
    firstCaughtAt: status === 'CAUGHT' ? new Date() : null
  },
  update: {
    status,
    // 只在首次捕获时记录时间
    firstCaughtAt: status === 'CAUGHT' ?
      prisma.raw('COALESCE("firstCaughtAt", NOW())') : undefined
  }
});
```

**注意**：`firstCaughtAt` 的更新逻辑需要特别处理，确保只在第一次捕获时记录，后续不覆盖。可以使用 Prisma 的条件更新或原生 SQL。

#### 4.2.4 修改现有游戏保存 API

**文件**：`server/src/routes/game.ts`

在保存游戏数据时，同步更新 `PokedexEntry` 表：

```typescript
// POST /api/game/save 中
// 1. 保存 GameSave（暂时仍保存 pokedex JSON 作为备份）
// 2. 同步更新 PokedexEntry 表
const pokedexData = req.body.pokedex as Record<string, PokedexStatus>;

for (const [speciesIdStr, status] of Object.entries(pokedexData)) {
  if (status === 'UNKNOWN') continue; // 不存储 UNKNOWN

  const speciesId = parseInt(speciesIdStr);
  await prisma.pokedexEntry.upsert({
    where: { userId_speciesId: { userId, speciesId } },
    create: { userId, speciesId, status, firstSeenAt: new Date(), firstCaughtAt: status === 'CAUGHT' ? new Date() : null },
    update: {
      status,
      ...(status === 'CAUGHT' && { firstCaughtAt: new Date() }) // 注意：这里需要更精细的逻辑
    }
  });
}
```

**优化建议**：使用 `prisma.$transaction` 批量处理以提高性能。

#### 4.2.5 注册新路由

**文件**：`server/src/index.ts` 或路由注册文件

```typescript
import pokedexRoutes from './routes/pokedex';
app.use('/api/pokedex', pokedexRoutes);
```

---

### 4.3 阶段三：数据迁移

#### 4.3.1 创建迁移脚本

**文件**：新建 `server/scripts/migrate-pokedex-data.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePokedexData() {
  // 1. 获取所有 GameSave 记录
  const gameSaves = await prisma.gameSave.findMany({
    select: {
      userId: true,
      pokedex: true,
      createdAt: true
    }
  });

  console.log(`Found ${gameSaves.length} game saves to migrate`);

  for (const save of gameSaves) {
    try {
      const pokedex = JSON.parse(save.pokedex) as Record<string, string>;
      const entries = [];

      for (const [speciesIdStr, status] of Object.entries(pokedex)) {
        if (status === 'UNKNOWN') continue;

        entries.push({
          userId: save.userId,
          speciesId: parseInt(speciesIdStr),
          status,
          firstSeenAt: save.createdAt, // 使用存档创建时间作为近似值
          firstCaughtAt: status === 'CAUGHT' ? save.createdAt : null
        });
      }

      // 批量插入，忽略已存在的记录
      await prisma.pokedexEntry.createMany({
        data: entries,
        skipDuplicates: true
      });

      console.log(`Migrated ${entries.length} entries for user ${save.userId}`);
    } catch (error) {
      console.error(`Failed to migrate user ${save.userId}:`, error);
    }
  }

  console.log('Migration completed');
}

migratePokedexData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### 4.3.2 执行迁移

```bash
cd server
npx ts-node scripts/migrate-pokedex-data.ts
```

#### 4.3.3 验证迁移结果

```bash
# 进入 Prisma Studio 查看数据
npx prisma studio
```

或执行验证脚本：
```typescript
// 比较 GameSave.pokedex 和 PokedexEntry 的数据一致性
```

---

### 4.4 阶段四：前端改造

#### 4.4.1 更新类型定义

**文件**：`shared/types/game.ts`

新增类型（如需要）：
```typescript
export interface PokedexEntry {
  speciesId: number;
  status: PokedexStatus;
  firstSeenAt: string;
  firstCaughtAt: string | null;
}
```

#### 4.4.2 修改 gameStore

**文件**：`src/stores/gameStore.ts`

**目标**：在图鉴状态变化时，同步调用后端 API 更新数据库。

**方案 A（推荐）**：保持现有的本地状态管理，在保存游戏时批量同步
- 优点：改动最小，性能好
- 现有逻辑基本不变，只需确保保存时正确传递 pokedex 数据

**方案 B**：每次状态变化立即同步
- 优点：数据实时性强
- 缺点：网络请求频繁，需要处理离线情况

**建议采用方案 A**，因为现有的保存机制已经能正确同步数据。

#### 4.4.3 修改图鉴界面（可选增强）

**文件**：`src/components/stages/DexView.tsx`

可以添加的新功能：
1. 显示首次捕获时间
2. 全服统计入口
3. 排行榜入口

这些是可选的增强功能，不是必须的。

#### 4.4.4 更新 API Schema

**文件**：`shared/schemas/api.schema.ts`

如果添加了新的 API 端点，需要添加对应的验证 Schema。

---

### 4.5 阶段五：清理与完善

#### 4.5.1 移除旧字段（可选，建议延后）

在确认新系统稳定运行后，可以考虑：

1. 修改 `server/prisma/schema.prisma`，删除 `GameSave.pokedex` 字段
2. 生成迁移：`npx prisma migrate dev --name remove_pokedex_json_field`
3. 更新相关代码，移除 JSON 解析逻辑

**建议**：保留 1-2 周观察期，确认无问题后再移除。

#### 4.5.2 添加统计 API（可选增强）

实现 `/api/pokedex/stats` 和 `/api/pokedex/leaderboard` 端点。

---

## 五、实施 Checklist

> **使用说明**：
> - 每完成一个小任务，请将 `[ ]` 改为 `[x]`
> - 如果遇到问题无法继续，在对应任务后添加备注说明
> - 新会话的 AI 请先阅读此 Checklist 了解进度，然后继续未完成的任务

### 阶段一：数据库 Schema 变更

- [x] 1.1 阅读并理解现有 `server/prisma/schema.prisma` 结构
- [x] 1.2 在 `User` 模型中添加 `pokedexEntries` 关联
- [x] 1.3 新增 `PokedexEntry` 模型
- [x] 1.4 运行 `npx prisma migrate dev --name add_pokedex_entry_table` 生成迁移
- [x] 1.5 运行 `npx prisma generate` 更新 Prisma Client
- [x] 1.6 验证迁移成功（本地数据库有新表）

### 阶段二：后端 API 改造

- [x] 2.1 新建 `server/src/routes/pokedex.ts` 文件
- [x] 2.2 实现 `GET /api/pokedex` 端点（获取用户图鉴）
- [x] 2.3 实现 `POST /api/pokedex/update` 端点（更新图鉴状态）
- [x] 2.4 在主路由文件中注册 pokedex 路由
- [x] 2.5 修改 `server/src/routes/game.ts` 的保存逻辑，同步写入 PokedexEntry
- [x] 2.6 测试 API 端点正常工作（GET/POST /api/pokedex, /stats, /leaderboard 全部通过）

### 阶段三：数据迁移

- [x] 3.1 创建迁移脚本 `server/scripts/migrate-pokedex-data.ts`
- [x] 3.2 在本地测试迁移脚本
- [x] 3.3 执行迁移，将现有 JSON 数据转换到新表
- [x] 3.4 验证迁移数据完整性（5条记录迁移成功，数据一致性验证通过）

### 阶段四：前端改造

- [x] 4.1 确认 `shared/types/game.ts` 类型定义是否需要更新（无需修改，PokedexStatus 已存在）
- [x] 4.2 确认 `shared/schemas/api.schema.ts` 是否需要更新（无需修改，pokedex schema 已存在）
- [x] 4.3 确认 `src/stores/gameStore.ts` 的保存逻辑正确传递 pokedex 数据（已确认正确传递）
- [ ] 4.4 测试前端图鉴功能正常

### 阶段五：集成测试

- [ ] 5.1 测试新用户注册后图鉴功能正常
- [ ] 5.2 测试遇见野生宝可梦后图鉴更新正常
- [ ] 5.3 测试捕获宝可梦后图鉴更新正常
- [ ] 5.4 测试宝可梦进化后图鉴更新正常
- [ ] 5.5 测试保存/读取游戏后图鉴数据正确

### 阶段六：清理（可选，建议延后执行）

- [ ] 6.1 确认新系统稳定运行 1 周以上
- [ ] 6.2 移除 `GameSave.pokedex` 字段
- [ ] 6.3 清理相关的 JSON 解析代码

### 增强功能（可选）

- [x] E.1 实现 `GET /api/pokedex/stats` 全服统计端点
- [x] E.2 实现 `GET /api/pokedex/leaderboard` 排行榜端点
- [ ] E.3 前端添加统计/排行榜入口

---

## 六、注意事项

### 6.1 关键提醒

1. **不要直接操作数据库**，所有变更通过 Prisma 迁移
2. **迁移前备份数据**，虽然是本地开发，但养成好习惯
3. **保持 `GameSave.pokedex` 字段**直到确认新系统稳定
4. **每完成一个小阶段就更新 Checklist**，方便下一个会话接力

### 6.2 可能遇到的问题

| 问题 | 解决方案 |
|------|----------|
| Prisma 迁移失败 | 检查 schema 语法，确保数据库连接正常 |
| `firstCaughtAt` 更新逻辑复杂 | 可以先用简单逻辑，后续再优化 |
| 数据迁移时间戳不准确 | 这是已知限制，历史数据使用近似时间 |
| 前后端类型不匹配 | 确保 shared 目录的类型定义同步更新 |

### 6.3 测试数据库连接

```bash
cd server
# 确保 Docker 运行中
docker-compose up -d
# 测试连接
npx prisma db pull
```

---

## 七、参考资料

### 7.1 关键文件路径

| 文件 | 用途 |
|------|------|
| `server/prisma/schema.prisma` | 数据库 Schema 定义 |
| `server/src/routes/game.ts` | 游戏数据 API |
| `src/stores/gameStore.ts` | 前端游戏状态管理 |
| `src/components/stages/DexView.tsx` | 图鉴界面组件 |
| `shared/types/game.ts` | 共享类型定义 |
| `shared/schemas/api.schema.ts` | API 数据验证 |

### 7.2 现有图鉴状态更新位置

在 `src/stores/gameStore.ts` 中搜索 `pokedex` 可以找到所有更新位置：
- `selectStarter` 函数
- `startWildBattle` 函数
- `catchPokemon` 函数（搜索 `CAUGHT`）
- `evolvePokemon` 函数

### 7.3 宝可梦数量

游戏中共有 **151 种**宝可梦（第一代），图鉴编号 1-151。

---

## 八、完成标志

当以下条件全部满足时，视为重构完成：

1. PokedexEntry 表已创建并包含正确的索引
2. 现有玩家的图鉴数据已迁移到新表
3. 新的图鉴状态变化能正确写入 PokedexEntry 表
4. 前端图鉴功能正常工作
5. 所有 Checklist 必选项（阶段一至五）已完成

---

**文档结束**

如有疑问，请参考项目的 `CLAUDE.md` 文件了解更多项目规范。
