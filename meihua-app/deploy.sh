#!/bin/bash
# 用法: ./deploy.sh [patch|minor|major]
# 默认: patch (1.0.0 → 1.0.1)

set -e

BUMP=${1:-patch}

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
nvm use 20 --silent

# 递增版本号（只改 package.json，不自动 git tag）
npm version $BUMP --no-git-tag-version

VERSION=$(node -p "require('./package.json').version")
echo "🚀 Deploying v$VERSION..."

# Git commit
cd ..
git add -A
git commit -m "v$VERSION"
git tag "v$VERSION"
cd meihua-app

# Deploy to Vercel
npx vercel --prod

echo ""
echo "✅ v$VERSION deployed!"
echo ""
echo "👉 To rollback: npx vercel rollback"
