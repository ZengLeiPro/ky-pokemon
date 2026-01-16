# 阿里云 OSS 部署指南

本项目已配置阿里云 CI/CD，可自动将前端应用部署到 OSS。

## 部署架构

```
GitHub Push → GitHub Actions CI/CD → 阿里云 OSS
```

## 已完成配置

- ✅ GitHub Actions workflow（`.github/workflows/frontend-deploy.yml`）
- ✅ OSS 静态网站配置（`infra/oss/website.xml`）
- ✅ OSS CORS 配置（`infra/oss/cors.xml`）
- ✅ GitHub Secrets 已同步

## 手动步骤（必需）

### 1. 安装阿里云 CLI

如果还未安装阿里云 CLI，请先安装：

```bash
# macOS
brew install aliyun-cli

# Linux
wget https://aliyuncli.alicdn.com/aliyun-cli-linux-latest-amd64.tgz
tar -xzf aliyun-cli-linux-latest-amd64.tgz
sudo mv aliyun /usr/local/bin/
```

### 2. 配置阿里云 CLI

```bash
aliyun configure
```

按提示输入：
- AccessKey ID: `LTAI5tC2zF9MjhBmBLAdamzB`（或你的 AccessKey）
- AccessKey Secret: （输入不可见）
- Default Region: `cn-shenzhen`
- Default Output Format: `json`

### 3. 配置 OSS Bucket

#### 3.1 设置静态网站托管

```bash
aliyun oss website --method put oss://ky-pokemon infra/oss/website.xml
```

#### 3.2 配置 CORS

```bash
aliyun oss cors --method put oss://ky-pokemon infra/oss/cors.xml
```

#### 3.3 设置 Bucket 为公共读

访问阿里云 OSS 控制台：
https://oss.console.aliyun.com/bucket/oss-cn-shenzhen/ky-pokemon/permission

设置权限：
- Bucket ACL: **公共读**（允许匿名访问静态网站）

### 4. 验证 GitHub Actions

访问 GitHub Actions 页面查看 CI 运行情况：
https://github.com/ZengLeiPro/ky-pokemon/actions

当前 **自动部署未启用**（ENABLE_DEPLOY=false），CI 只会构建但不会部署。

### 5. 首次手动部署（可选）

如果想立即测试部署，可以手动触发：

```bash
# 本地构建
npm run build

# 手动上传到 OSS
aliyun oss sync dist/ oss://ky-pokemon/ \
  --endpoint oss-cn-shenzhen.aliyuncs.com \
  --delete \
  --force
```

### 6. 启用自动部署

验证 OSS 配置正确后，启用自动部署：

```bash
gh variable set ENABLE_DEPLOY --body "true" --repo "ZengLeiPro/ky-pokemon"
```

之后每次推送到 `main` 分支，都会自动触发部署。

## 访问地址

部署完成后，可以通过以下地址访问：

**OSS 默认域名**：
- http://ky-pokemon.oss-cn-shenzhen.aliyuncs.com

**（可选）自定义域名**：
- 在 OSS 控制台绑定自定义域名
- 配置 DNS CNAME 记录
- 启用 CDN 加速（推荐）

## CI/CD 流程说明

### CI 阶段（所有分支）

1. 检出代码
2. 安装依赖
3. TypeScript 类型检查
4. 构建应用（`npm run build`）
5. 上传构建产物（Artifact）

### CD 阶段（仅 main 分支 + ENABLE_DEPLOY=true）

1. 下载构建产物
2. 安装并配置阿里云 CLI
3. 同步文件到 OSS（覆盖式部署，删除旧文件）
4. 输出访问地址

## 环境变量说明

已配置的 GitHub Secrets：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `ALIYUN_ACCESS_KEY_ID` | 阿里云访问密钥 ID | LTAI5t... |
| `ALIYUN_ACCESS_KEY_SECRET` | 阿里云访问密钥 Secret | （保密） |
| `REGION` | 阿里云地域 | cn-shenzhen |
| `OSS_BUCKET` | OSS Bucket 名称 | ky-pokemon |

可配置的 GitHub Variables：

| Variable 名称 | 说明 | 默认值 |
|--------------|------|--------|
| `ENABLE_DEPLOY` | 是否启用自动部署 | false |

## 常见问题

### Q1: 访问网站显示 403 Forbidden

**原因**：Bucket 权限未设置为公共读

**解决**：在 OSS 控制台将 Bucket ACL 设置为"公共读"

### Q2: 刷新页面后出现 404

**原因**：未配置静态网站错误文档

**解决**：执行步骤 3.1，配置 OSS 静态网站托管

### Q3: GitHub Actions 部署失败

**原因**：阿里云 AccessKey 权限不足

**检查**：确保 AccessKey 具有以下权限：
- AliyunOSSFullAccess（OSS 完全访问权限）

### Q4: 如何回滚部署

OSS 部署是覆盖式的，如需回滚：

```bash
# 方法1: 从旧的 commit 重新部署
git checkout <old-commit>
npm run build
aliyun oss sync dist/ oss://ky-pokemon/ --endpoint oss-cn-shenzhen.aliyuncs.com --delete --force

# 方法2: 使用 GitHub Actions 重新运行旧的 workflow
```

## 成本预估

阿里云 OSS 按使用量计费：

- **存储费用**：约 ¥0.12/GB/月
- **流量费用**：约 ¥0.50/GB（外网流出）
- **请求费用**：约 ¥0.01/万次

**示例**：
- 静态网站大小：10 MB
- 月访问量：10,000 次（平均 100 MB 流量）
- **预计月费用**：< ¥1

**建议**：启用 CDN 加速可降低流量成本并提升访问速度。

## 安全建议

1. **定期轮换 AccessKey**：建议每 90 天更换一次
2. **使用 RAM 子账号**：不要使用主账号 AccessKey
3. **最小权限原则**：只授予必要的 OSS 权限
4. **敏感信息管理**：不要将 AccessKey 提交到代码仓库

## 技术支持

如有问题，请查看：
- [阿里云 OSS 文档](https://help.aliyun.com/product/31815.html)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [项目 Issues](https://github.com/ZengLeiPro/ky-pokemon/issues)
