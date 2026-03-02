# 多階段建構：建構 Rust Kernel → 建構 React Apps → 最終 Nginx 映像

# 階段 1: 建構 Rust WebAssembly
FROM rust:1.85-slim AS wasm-builder

RUN apt-get update && apt-get install -y pkg-config libssl-dev clang curl

WORKDIR /build
COPY apps/kernel ./apps/kernel

WORKDIR /build/apps/kernel
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
RUN wasm-pack build --target web --out-dir pkg

# 階段 2: 建構 Node 應用程式
FROM node:20-alpine as node-builder

RUN npm install -g pnpm

WORKDIR /build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps ./apps

# 從 wasm-builder 複製 built kernel
COPY --from=wasm-builder /build/apps/kernel/pkg ./apps/kernel/pkg

# 安裝依賴並建構
RUN pnpm install --frozen-lockfile
RUN pnpm build

# 階段 3: 生產映像
FROM nginx:alpine

COPY infra/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=node-builder /build/apps/windowserver/.dist /usr/share/nginx/html

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3333/ || exit 1

EXPOSE 3333
