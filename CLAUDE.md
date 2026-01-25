# 项目规范

## 数据库操作规范

**禁止直接操作数据库**。所有数据库结构变更必须通过 Prisma 迁移系统完成。

### 禁止的操作

- 直接编写或执行 SQL DDL 语句（CREATE TABLE、ALTER TABLE、DROP TABLE 等）
- 直接连接数据库执行结构修改
- 使用 `prisma db push` 跳过迁移历史
- 手动修改 `_prisma_migrations` 表（除非用于修复失败的迁移）

### 正确的流程

1. **修改 Schema**：编辑 `server/prisma/schema.prisma`
2. **生成迁移**：运行 `npx prisma migrate dev --name <描述>` 生成迁移文件
3. **提交代码**：将迁移文件提交到 Git
4. **部署**：通过 CI/CD 自动执行 `prisma migrate deploy`

### 环境说明

- **本地开发**：使用 Docker 运行 PostgreSQL（`server/docker-compose.yml`）
- **生产环境**：阿里云 RDS PostgreSQL，通过 CI/CD 的 `/api/internal/db-migrate` 端点执行迁移

### 迁移故障修复

如果迁移失败，使用 `/api/internal/db-migrate-resolve` 端点，不要直接操作数据库：

```bash
curl -X POST "${FC_URL}/api/internal/db-migrate-resolve" \
  -H "x-migration-token: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"migration": "<迁移名称>", "action": "applied|rolled-back"}'
```

## 测试代码规范

临时测试代码必须放在专门的 `tests` 文件夹中，不要散落在项目各处。
