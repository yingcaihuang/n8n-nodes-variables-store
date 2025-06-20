#!/bin/bash

# GitHub推送脚本
# 使用方法: ./push-to-github.sh [your-github-username]

GITHUB_USERNAME=${1:-"betty"}
REPO_NAME="n8n-nodes-variables-store"

echo "🚀 准备推送到GitHub..."
echo "GitHub用户名: $GITHUB_USERNAME"
echo "仓库名称: $REPO_NAME"
echo ""

# 检查是否已经有远程仓库
if git remote get-url origin 2>/dev/null; then
    echo "⚠️  远程仓库已存在，更新URL..."
    git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
else
    echo "➕ 添加远程仓库..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
fi

# 创建主分支并推送
echo "📤 推送代码到GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 成功推送到GitHub!"
    echo "🔗 仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "📦 npm包地址: https://www.npmjs.com/package/n8n-nodes-variables-store"
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "1. GitHub仓库是否已创建"
    echo "2. 是否有推送权限"
    echo "3. 网络连接是否正常"
fi
