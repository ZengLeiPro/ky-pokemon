#!/bin/bash
set -e

# 阿里云 CI/CD - GitHub Secrets 同步脚本
# 项目: ky-pokemon
# GitHub: ZengLeiPro/ky-pokemon

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  阿里云 CI/CD - GitHub Secrets 同步${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查 gh CLI 是否已安装
if ! command -v gh &> /dev/null; then
  echo -e "${RED}错误: 未找到 GitHub CLI (gh)${NC}"
  echo "请安装: https://cli.github.com/"
  exit 1
fi

# 检查是否已登录
if ! gh auth status &> /dev/null; then
  echo -e "${YELLOW}请先登录 GitHub CLI:${NC}"
  echo "  gh auth login"
  exit 1
fi

# GitHub 仓库信息
REPO="ZengLeiPro/ky-pokemon"

echo -e "${GREEN}目标仓库:${NC} $REPO"
echo ""

# 从环境变量读取阿里云配置（或交互式输入）
echo -e "${YELLOW}请提供阿里云配置信息：${NC}"
echo ""

# 读取 AccessKey ID
if [ -z "$ALIYUN_ACCESS_KEY_ID" ]; then
  read -p "阿里云 AccessKey ID: " ALIYUN_ACCESS_KEY_ID
fi

# 读取 AccessKey Secret
if [ -z "$ALIYUN_ACCESS_KEY_SECRET" ]; then
  read -s -p "阿里云 AccessKey Secret (输入不可见): " ALIYUN_ACCESS_KEY_SECRET
  echo ""
fi

# 读取地域（默认值）
if [ -z "$REGION" ]; then
  read -p "阿里云地域 [cn-shenzhen]: " REGION
  REGION=${REGION:-cn-shenzhen}
fi

# 读取 OSS Bucket 名称
if [ -z "$OSS_BUCKET" ]; then
  read -p "OSS Bucket 名称 [ky-pokemon]: " OSS_BUCKET
  OSS_BUCKET=${OSS_BUCKET:-ky-pokemon}
fi

echo ""

# 同步 Secrets
echo -e "${YELLOW}正在同步 GitHub Secrets...${NC}"

gh secret set ALIYUN_ACCESS_KEY_ID --body "$ALIYUN_ACCESS_KEY_ID" --repo "$REPO"
echo "✅ ALIYUN_ACCESS_KEY_ID"

gh secret set ALIYUN_ACCESS_KEY_SECRET --body "$ALIYUN_ACCESS_KEY_SECRET" --repo "$REPO"
echo "✅ ALIYUN_ACCESS_KEY_SECRET"

gh secret set REGION --body "$REGION" --repo "$REPO"
echo "✅ REGION"

gh secret set OSS_BUCKET --body "$OSS_BUCKET" --repo "$REPO"
echo "✅ OSS_BUCKET"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  GitHub Secrets 同步完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 提示后续步骤
echo -e "${YELLOW}后续步骤：${NC}"
echo ""
echo "1. 配置 OSS 静态网站和 CORS："
echo "   aliyun oss website --method put oss://${OSS_BUCKET} infra/oss/website.xml"
echo "   aliyun oss cors --method put oss://${OSS_BUCKET} infra/oss/cors.xml"
echo ""
echo "2. 在 OSS 控制台设置 Bucket 为公共读："
echo "   https://oss.console.aliyun.com/bucket/oss-${REGION}/${OSS_BUCKET}/permission"
echo ""
echo "3. 提交配置文件并推送到 GitHub："
echo "   git add ."
echo "   git commit -m \"chore: 添加阿里云 CI/CD 配置\""
echo "   git push origin main"
echo ""
echo "4. 首次部署验证后，启用自动部署："
echo "   gh variable set ENABLE_DEPLOY --body \"true\" --repo \"$REPO\""
echo ""
echo -e "${GREEN}完成！${NC}"
