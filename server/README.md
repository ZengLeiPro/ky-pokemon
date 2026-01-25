# KY Pokemon - Backend Server

基于 Express + TypeScript + Prisma 的后端 API 服务。

## 技术栈

- Node.js 22
- TypeScript
- Express
- Prisma (PostgreSQL)
- JWT 认证

## 本地开发

### 前置要求

- Node.js >= 22
- Docker & Docker Compose

### 启动步骤

1. 安装依赖
```bash
npm install
```

2. 启动 PostgreSQL 数据库
```bash
docker-compose up -d
```

3. 复制环境变量配置
```bash
cp .env.example .env
```

4. 执行数据库迁移
```bash
npx prisma migrate dev
```

5. 生成 Prisma Client
```bash
npx prisma generate
```

6. 启动开发服务器
```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

### 数据库管理

查看数据库内容（Prisma Studio）:
```bash
npx prisma studio
```

创建新的迁移:
```bash
npx prisma migrate dev --name <migration_name>
```

重置数据库:
```bash
npx prisma migrate reset
```

停止数据库:
```bash
docker-compose down
```

清理数据（保留容器）:
```bash
docker-compose down -v
```

## 生产部署

生产环境使用阿里云函数计算（FC）+ RDS PostgreSQL。

### 环境变量

需要在 GitHub Secrets 中配置：
- `DATABASE_URL`: RDS PostgreSQL 连接字符串
- `JWT_SECRET`: JWT 签名密钥
- `MIGRATION_TOKEN`: 数据库迁移接口的访问令牌
- `VPC_ID`, `VSWITCH_ID`, `SECURITY_GROUP_ID`: VPC 配置

### CI/CD

推送到 `main` 分支时自动触发部署流程：
1. 代码质量检查
2. 构建
3. 部署到阿里云 FC
4. 执行数据库迁移

## API 文档

服务端口：3001

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 游戏存档接口
- `GET /api/game-save/:mode` - 获取存档
- `POST /api/game-save/:mode` - 创建/更新存档

### 内部接口
- `POST /api/internal/db-migrate` - 执行数据库迁移（需要 MIGRATION_TOKEN）
- `POST /api/internal/db-seed` - 执行数据库种子（需要 MIGRATION_TOKEN）
