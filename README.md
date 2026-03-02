# macOS Web OS

A comprehensive, high-performance web-based simulation of macOS. This project is built with a modern stack featuring a custom Rust-based WebAssembly kernel and a responsive React/TypeScript UI layer.

## ✨ Features

*   **Authentic UI/UX**: Meticulously designed to replicate the macOS "Aqua" design language and window management system.
*   **WebAssembly Kernel**: A custom-built Rust kernel running directly in the browser, handling process scheduling and low-level system APIs.
*   **Virtual File System (VFS)**: A robust, in-browser standard file system that user applications can interact with.
*   **User-Space Applications**: Includes fully functional simulated standalone applications like Finder, Terminal, Safari, VS Code, and System Preferences.
*   **Smooth Compositing**: A dedicated Window Server for view compositing, window lifecycles, and animations using `react-rnd` and `framer-motion`.
*   **Containerized Deployment**: Ready for production deployments using Docker and Kubernetes.

## 🏗️ Technical Architecture

This project is structured as a monorepo using `pnpm` workspaces and `turbo`. It is explicitly divided into low-level system modules and user-space applications to mirror actual operating system architecture.

### 🧩 Core System (`apps/`)

*   **`kernel` (Rust/Wasm)**: The core OS engine compiled to WebAssembly. Simulates low-level system APIs, process scheduling, and standard library bindings via `wasm-bindgen` and `js-sys`.
*   **`windowserver` (React/Vite)**: The primary view compositor and desktop environment. Coordinates the rendering of the system UI and manages the window lifecycle.
*   **`bootloader` (React/Vite)**: Manages the initial Apple boot screen sequence before handling execution off to the Window Server.
*   **`apps` (React/TypeScript)**: Standalone user-space applications (Finder, Terminal, Safari, VS Code, etc.) that consume the API infrastructure to interact with the broader system.

### 📦 Packages & Libraries (`packages/`)

*   **`darwin-api`**: The crucial intermediary TypeScript API. It acts as the system call (syscall) interface, bridging the Rust WebAssembly kernel with the React user-space applications.
*   **`vfs`**: The Virtual File System (VFS) implementation that governs file structures across all applications.
*   **`aqua-engine` & `core-ui`**: Reusable React UI design systems. They implement the "Aqua" design language to give the applications their native macOS look and feel.

### 🐳 Infrastructure (`infra/`)

*   Contains configurations for Docker and Kubernetes for automated deployment pipelines.

## 🚀 Getting Started

### Prerequisites

*   Node.js
*   `pnpm` (version `8.15.0`)
*   Rust toolchain (cargo)

### Installation & Local Development

1. **Bootstrap the project** (compiles the Rust kernel and installs Node dependencies):
   ```bash
   pnpm run bootstrap
   ```

2. **Start the development server**:
   ```bash
   pnpm run dev
   ```
   *Note: This starts the `turbo` pipeline for all apps and packages in parallel.*

### Docker Deployment

You can quickly run the simulated OS via Docker:

```bash
cd infra/docker
docker compose up -d
```
*The OS will be available on port `3333`.*

## 🛠️ Scripts & Commands

*   `pnpm run test`: Executes `turbo run test` across all packages.
*   `pnpm run lint`: Lint the entire monorepo codebase.
*   `pnpm run build`: Production build.
*   `pnpm run deploy:k8s`: Deploy the application to Kubernetes.
