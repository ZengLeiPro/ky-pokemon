# 后端服务实施方案

## 1. 技术选型确认

| 组件 | 选择 | 说明 |
|------|------|------|
| 框架 | **Hono** | 轻量、类型安全、边缘部署友好 |
| 运行时 | **Node.js** | 稳定生态，后期可迁移 Bun |
| 数据库 | **PostgreSQL** | 生产级、功能完整 |
| ORM | **Prisma** | 类型安全、迁移管理、优秀 DX |
| 鉴权 | **JWT (jose)** | 标准化、轻量 |
| 密码哈希 | **bcrypt** | 行业标准 |
| 验证 | **Zod** | 复用 shared 层 Schema |

---

## 2. 目标架构

### 2.1 目录结构

```
ky-pokemon/
├── shared/                    # 前后端共享 (已完成)
│
├── server/                    # 后端代码
│   ├── src/
│   │   ├── index.ts           # 入口，Hono app
│   │   ├── routes/
│   │   │   ├── auth.ts        # 认证路由
│   │   │   └── game.ts        # 游戏数据路由
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT 验证中间件
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── game.service.ts
│   │   └── lib/
│   │       ├── db.ts          # Prisma client
│   │       └── jwt.ts         # JWT 工具
│   ├── prisma/
│   │   ├── schema.prisma      # 数据库 Schema
│   │   └── migrations/        # 迁移文件
│   ├── package.json
│   └── tsconfig.json
│
└── src/                       # 前端代码 (已有)
```

### 2.2 数据库 Schema 设计

```prisma
// server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  gameSave     GameSave?
}

model GameSave {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 游戏数据 (JSON 存储，复用 shared 类型)
  team            Json     // Pokemon[]
  pcBox           Json     // Pokemon[]
  currentLocation String
  badges          String[] // badge IDs
  pokedex         Json     // Record<string, PokedexStatus>
  inventory       Json     // InventoryItem[] (不含 effect 函数)
  money           Int      @default(3000)
  playTime        Int      @default(0) // 秒
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 3. API 设计

### 3.1 认证 API

| 方法 | 端点 | 请求体 | 响应 |
|------|------|--------|------|
| POST | `/api/auth/register` | `{ username, password }` | `{ user, token }` |
| POST | `/api/auth/login` | `{ username, password }` | `{ user, token }` |
| POST | `/api/auth/refresh` | Header: `Authorization` | `{ token }` |
| PUT | `/api/auth/password` | `{ oldPassword, newPassword }` | `{ success }` |

### 3.2 游戏数据 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/game/save` | 加载存档 (需认证) |
| POST | `/api/game/save` | 保存存档 (需认证) |
| DELETE | `/api/game/save` | 删除存档 (需认证) |

### 3.3 响应格式

```typescript
// 成功
{ success: true, data: { ... } }

// 失败
{ success: false, error: "错误信息" }
```

---

## 4. 实施步骤

### Phase 1: 项目初始化 (30 分钟)

```bash
# 1. 创建 server 目录
mkdir -p server/src/{routes,middleware,services,lib}
mkdir -p server/prisma

# 2. 初始化 package.json
cd server && npm init -y

# 3. 安装依赖
npm install hono @hono/node-server prisma @prisma/client bcrypt jose zod
npm install -D typescript @types/node @types/bcrypt tsx

# 4. 初始化 Prisma
npx prisma init

# 5. 配置 tsconfig.json
```

**server/tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**server/package.json scripts**:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

### Phase 2: 数据库配置 (20 分钟)

1. **配置 .env**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ky_pokemon?schema=public"
JWT_SECRET="your-super-secret-key-change-in-production"
```

2. **创建 Prisma Schema** (如上所示)

3. **运行迁移**:
```bash
npx prisma migrate dev --name init
```

### Phase 3: 核心代码实现 (2 小时)

**server/src/lib/db.ts**:
```typescript
import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();
```

**server/src/lib/jwt.ts**:
```typescript
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: { userId: string; username: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; username: string };
  } catch {
    return null;
  }
}
```

**server/src/middleware/auth.ts**:
```typescript
import { Context, Next } from 'hono';
import { verifyToken } from '../lib/jwt';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: '未提供认证令牌' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return c.json({ success: false, error: '令牌无效或已过期' }, 401);
  }

  c.set('user', payload);
  await next();
}
```

**server/src/routes/auth.ts**:
```typescript
import { Hono } from 'hono';
import bcrypt from 'bcrypt';
import { db } from '../lib/db';
import { signToken } from '../lib/jwt';
import { UserCredentialsSchema } from '@shared/schemas';

const auth = new Hono();

auth.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = UserCredentialsSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
  }

  const { username, password } = parsed.data;

  // 检查用户名是否存在
  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    return c.json({ success: false, error: '用户名已存在' }, 409);
  }

  // 创建用户
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { username, passwordHash },
    select: { id: true, username: true, createdAt: true }
  });

  const token = await signToken({ userId: user.id, username: user.username });

  return c.json({
    success: true,
    data: { user, token }
  });
});

auth.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = UserCredentialsSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
  }

  const { username, password } = parsed.data;

  const user = await db.user.findUnique({ where: { username } });
  if (!user) {
    return c.json({ success: false, error: '用户名或密码错误' }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ success: false, error: '用户名或密码错误' }, 401);
  }

  const token = await signToken({ userId: user.id, username: user.username });

  return c.json({
    success: true,
    data: {
      user: { id: user.id, username: user.username, createdAt: user.createdAt },
      token
    }
  });
});

export default auth;
```

**server/src/routes/game.ts**:
```typescript
import { Hono } from 'hono';
import { db } from '../lib/db';
import { authMiddleware } from '../middleware/auth';
import { SaveGameRequestSchema } from '@shared/schemas';

const game = new Hono();

// 所有路由需要认证
game.use('/*', authMiddleware);

game.get('/save', async (c) => {
  const user = c.get('user');
  
  const save = await db.gameSave.findUnique({
    where: { userId: user.userId }
  });

  if (!save) {
    return c.json({ success: true, data: null });
  }

  return c.json({ success: true, data: save });
});

game.post('/save', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  const parsed = SaveGameRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: '存档数据格式错误' }, 400);
  }

  const { team, pcBox, currentLocationId, badges, pokedex } = parsed.data;

  const save = await db.gameSave.upsert({
    where: { userId: user.userId },
    create: {
      userId: user.userId,
      team,
      pcBox,
      currentLocation: currentLocationId,
      badges,
      pokedex,
      inventory: [],
      money: 3000,
      playTime: 0
    },
    update: {
      team,
      pcBox,
      currentLocation: currentLocationId,
      badges,
      pokedex
    }
  });

  return c.json({ success: true, data: { savedAt: save.updatedAt } });
});

game.delete('/save', async (c) => {
  const user = c.get('user');
  
  await db.gameSave.delete({
    where: { userId: user.userId }
  }).catch(() => null);

  return c.json({ success: true });
});

export default game;
```

**server/src/index.ts**:
```typescript
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import auth from './routes/auth';
import game from './routes/game';

const app = new Hono();

// 中间件
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// 路由
app.route('/api/auth', auth);
app.route('/api/game', game);

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 3001;

console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
```

### Phase 4: 前端适配 (1 小时)

更新 `src/stores/authStore.ts`，将 localStorage 调用替换为 API 调用。

### Phase 5: 测试与验证 (30 分钟)

```bash
# 启动数据库 (Docker)
docker run -d --name postgres-ky -e POSTGRES_PASSWORD=password -p 5432:5432 postgres

# 运行迁移
cd server && npx prisma migrate dev

# 启动后端
npm run dev

# 测试 API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

---

## 5. 时间估算

| Phase | 任务 | 预计时间 |
|-------|------|----------|
| 1 | 项目初始化 | 30 分钟 |
| 2 | 数据库配置 | 20 分钟 |
| 3 | 核心代码实现 | 2 小时 |
| 4 | 前端适配 | 1 小时 |
| 5 | 测试验证 | 30 分钟 |
| **总计** | | **约 4.5 小时** |

---

## 6. 后续扩展

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 排行榜 API | P2 | 按徽章数/游戏时长排名 |
| 社交功能 | P3 | 好友列表、对战邀请 |
| 云端自动存档 | P2 | 定时同步 |
| Rate Limiting | P1 | 防止 API 滥用 |
