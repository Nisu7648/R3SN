#!/bin/bash

# 🚀 ONE-COMMAND DEPLOYMENT
# Usage: ./quick-deploy.sh [platform]
# Platforms: railway, vercel, render, docker, fly

set -e

PLATFORM="${1:-railway}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║           🚀 R3SN QUICK DEPLOY 🚀                          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Platform: $PLATFORM"
echo ""

case $PLATFORM in
  railway)
    echo "Deploying to Railway..."
    if ! command -v railway &> /dev/null; then
      echo "Installing Railway CLI..."
      npm install -g @railway/cli
    fi
    railway login
    railway up
    echo "✅ Deployed to Railway!"
    ;;
    
  vercel)
    echo "Deploying to Vercel..."
    if ! command -v vercel &> /dev/null; then
      echo "Installing Vercel CLI..."
      npm install -g vercel
    fi
    vercel --prod
    echo "✅ Deployed to Vercel!"
    ;;
    
  render)
    echo "Deploying to Render..."
    echo "Push to Git to trigger deployment"
    git add .
    git commit -m "Deploy to Render"
    git push
    echo "✅ Deployment triggered on Render!"
    ;;
    
  docker)
    echo "Deploying with Docker..."
    docker-compose up -d --build
    echo "✅ Deployed with Docker!"
    echo "Access at: http://localhost:3000"
    ;;
    
  fly)
    echo "Deploying to Fly.io..."
    if ! command -v flyctl &> /dev/null; then
      echo "Installing Fly CLI..."
      curl -L https://fly.io/install.sh | sh
    fi
    flyctl deploy
    echo "✅ Deployed to Fly.io!"
    ;;
    
  *)
    echo "❌ Unknown platform: $PLATFORM"
    echo "Supported: railway, vercel, render, docker, fly"
    exit 1
    ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║           ✅ DEPLOYMENT SUCCESSFUL! ✅                     ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
