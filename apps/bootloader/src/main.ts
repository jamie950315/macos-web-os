/**
 * macOS Web Bootloader
 * 負責初始化 WebAssembly Kernel 並啟動 WindowServer
 */

import init, { DarwinKernel } from '../../kernel/pkg/darwin_kernel';

interface BootConfig {
  memoryPool: number;
  enableSpotlight: boolean;
  defaultUser: string;
}

class Bootloader {
  private kernel: DarwinKernel | null = null;
  private config: BootConfig;

  constructor(config: BootConfig) {
    this.config = config;
  }

  async boot(): Promise<void> {
    console.log('[Bootloader] Starting macOS Web...');
    const startTime = performance.now();

    try {
      // 1. 載入 WebAssembly 模組
      await this.initializeKernel();

      // 2. 掛載虛擬檔案系統
      await this.mountFilesystem();

      // 3. 初始化裝置驅動程式（模擬）
      await this.initializeDrivers();

      // 4. 啟動 WindowServer
      await this.launchWindowServer();

      // 5. 啟動系統服務（Dock、MenuBar）
      await this.startSystemServices();

      const bootTime = (performance.now() - startTime).toFixed(2);
      console.log(`[Bootloader] System ready in ${bootTime}ms`);

      // 發送系統就緒事件
      window.dispatchEvent(new CustomEvent('macos-ready', {
        detail: { kernel: this.kernel, bootTime }
      }));

    } catch (error) {
      console.error('[Bootloader] Fatal error:', error);
      this.displayPanicScreen(error as Error);
    }
  }

  private async initializeKernel(): Promise<void> {
    await init();
    this.kernel = new DarwinKernel();
    const result = this.kernel.init();
    console.log('[Kernel]', result);
  }

  private async mountFilesystem(): Promise<void> {
    // VFS 已在 kernel init 時建立，這裡進行額外的 mount point 設定
    console.log('[Filesystem] Root filesystem mounted (HFS+ simulation)');
  }

  private async initializeDrivers(): Promise<void> {
    // 模擬裝置驅動初始化
    const drivers = [
      'com.apple.driver.AppleACPIPlatform',
      'com.apple.driver.AppleSMC',
      'com.apple.iokit.IOStorageFamily',
      'com.apple.driver.AppleAHCIPort'
    ];

    for (const driver of drivers) {
      console.log(`[Driver] Loaded: ${driver}`);
      await this.simulateDelay(50);
    }
  }

  private async launchWindowServer(): Promise<void> {
    // 動態載入 WindowServer React 應用
    const { default: ReactApp } = await import('../../windowserver/src/main');
    const root = document.getElementById('root');
    if (root) {
      // React 18 createRoot 邏輯
      console.log('[WindowServer] Display server started');
    }
  }

  private async startSystemServices(): Promise<void> {
    // 啟動 Dock 和 MenuBar
    console.log('[SystemServices] Launching Dock...');
    console.log('[SystemServices] Launching SystemUIServer...');
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private displayPanicScreen(error: Error): void {
    document.body.innerHTML = `
      <div style="background: black; color: white; font-family: monospace; padding: 40px; height: 100vh;">
        <h1>🚫 System Panic</h1>
        <p>${error.message}</p>
        <pre>${error.stack}</pre>
        <p>Please restart your browser.</p>
      </div>
    `;
  }
}

// 啟動點
const bootloader = new Bootloader({
  memoryPool: 512 * 1024 * 1024, // 512MB 虛擬記憶體
  enableSpotlight: true,
  defaultUser: 'guest'
});

// DOM 準備就緒後啟動
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bootloader.boot());
} else {
  bootloader.boot();
}
