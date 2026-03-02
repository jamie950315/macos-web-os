# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Lint, and Test Commands

This project is a web-based macOS simulation using a `pnpm` workspace, `turbo` monorepo, and a Rust WebAssembly kernel. Ensure you are using `pnpm@8.15.0`.

- **Initial Setup / Bootstrap:**
  ```bash
  pnpm run bootstrap
  ```
  *(This compiles the Rust kernel using `cargo build --release` and installs Node dependencies using `pnpm install`.)*

- **Development Server:**
  ```bash
  pnpm run dev
  ```
  *(Starts the `turbo` pipeline for all apps and packages in parallel.)*

- **Running Tests (All):**
  ```bash
  pnpm run test
  ```
  *(Executes `turbo run test` across all packages.)*

- **Running a Single Test:**
  Find the specific package/app directory and run its local test runner (e.g., `cd apps/<app-name> && pnpm test -- <test-file>`).

- **Production Build:**
  ```bash
  pnpm run build
  ```

- **Linting:**
  ```bash
  pnpm run lint
  ```

- **Deploying to Kubernetes:**
  ```bash
  pnpm run deploy:k8s
  ```

## High-Level Architecture

The repository is structured to mirror parts of the macOS architecture, divided between low-level system modules (Rust/Wasm) and user-space apps (React/TypeScript).

### Core System (`apps/`)
- **`apps/kernel/` (Rust):** The core OS engine compiled to WebAssembly. Simulates low-level system APIs, process scheduling, and standard library bindings via `wasm-bindgen` and `js-sys`.
- **`apps/bootloader/` (React/Vite):** Manages the initial Apple boot screen sequence before handing execution to the window server.
- **`apps/windowserver/` (React/Vite):** The primary view compositor and desktop environment. Coordinates rendering, system UI, and window lifecycle management using libraries like `react-rnd` and `framer-motion`.

### User-Space Applications (`apps/apps/`)
- Contains standalone user applications such as `finder`, `terminal`, `safari`, `vscode`, `system-preferences`, etc. These consume the `darwin-api` to interact with the broader system.

### Packages & Libraries (`packages/`)
- **`packages/darwin-api/`:** The crucial intermediary TypeScript API. It acts as the syscall interface, bridging the Rust WebAssembly kernel with the React applications.
- **`packages/vfs/`:** The Virtual File System implementation that governs file structures across the applications.
- **`packages/aqua-engine/` & `packages/core-ui/`:** Reusable React UI design systems. They implement the "Aqua" design language to give the applications their native macOS look and feel.

### Infrastructure (`infra/`)
- Contains configurations for Docker and Kubernetes for automated deployment.