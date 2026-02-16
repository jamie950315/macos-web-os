#!/bin/bash
set -e

ENV=${1:-production}
VERSION=$(git describe --tags --always)
IMAGE="macos-web-os:${VERSION}"

echo "🚀 Starting deployment pipeline..."
echo "Environment: $ENV"
echo "Version: $VERSION"

# 1. 建構 Wasm Kernel
echo "🔨 Building Rust kernel..."
cd apps/kernel
wasm-pack build --release --target web
cd ../..

# 2. 建構 Docker 映像
echo "🐳 Building Docker image..."
docker build -t ${IMAGE} -f infra/docker/Dockerfile .

# 3. 執行測試
echo "🧪 Running integration tests..."
pnpm test

# 4. 推送到 Registry
echo "📤 Pushing to registry..."
docker tag ${IMAGE} registry.internal/macos-web-os:${VERSION}
docker push registry.internal/macos-web-os:${VERSION}

# 5. 部署到 K8s
echo "☸️  Deploying to Kubernetes..."
kubectl set image deployment/macos-web-os macos-web=registry.internal/macos-web-os:${VERSION} -n macos-production
kubectl rollout status deployment/macos-web-os -n macos-production

echo "✅ Deployment complete!"
echo "Verify: kubectl get pods -n macos-production"
