# macOS Web OS

A web-based macOS operating system simulator built with React, TypeScript, and Rust WebAssembly.

![Deploy Status](https://github.com/jamie950315/macos-web-os/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)

## 🚀 Live Demo

The application is automatically deployed to GitHub Pages: [View Live Demo](https://jamie950315.github.io/macos-web-os/)

## 🏗️ Architecture

This project is a monorepo consisting of:

- **Kernel** (`apps/kernel`): Rust-based WebAssembly kernel that provides core OS functionality
- **Window Server** (`apps/windowserver`): React-based window management system
- **Applications** (`apps/apps`): Various macOS-style applications including:
  - Finder
  - Safari
  - Terminal
  - Calculator
  - Camera
  - Music
  - Photos
  - System Preferences
  - TextEdit
  - VS Code

## 🛠️ Development

### Prerequisites

- Node.js 20+
- pnpm 8.15.0+
- Rust 1.75+
- wasm-pack

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/jamie950315/macos-web-os.git
cd macos-web-os
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the Rust kernel:
```bash
cd apps/kernel
wasm-pack build --target web
cd ../..
```

4. Start development server:
```bash
pnpm dev
```

5. Build for production:
```bash
pnpm build
```

## 📦 Deployment

The project is configured for automatic deployment to GitHub Pages via GitHub Actions. Every push to the `master` branch triggers a new deployment.

### Manual Deployment

You can also trigger a manual deployment using the workflow dispatch feature in GitHub Actions.

### Kubernetes Deployment

For production Kubernetes deployment, see the configuration in `infra/k8s/`:

```bash
pnpm deploy:k8s
```

## 🧪 Testing

Run tests:
```bash
pnpm test
```

## 🎨 Features

- Full macOS-style window management
- Draggable and resizable windows
- Working menu bar and dock
- Multiple functional applications
- WebAssembly-powered kernel
- Responsive design

## 📄 License

Version: 14.0.0-sonoma

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
