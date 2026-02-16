/**
 * Darwin API Bridge
 * TypeScript wrapper for Wasm Kernel API calls
 */

export class KernelAPI {
  private static instance: KernelAPI;
  private kernel: any = null;

  private constructor() {}

  static getInstance(): KernelAPI {
    if (!KernelAPI.instance) {
      KernelAPI.instance = new KernelAPI();
    }
    return KernelAPI.instance;
  }

  async init() {
    console.log('[KernelAPI] Waiting for kernel initialization...');
  }

  setKernel(kernel: any) {
    this.kernel = kernel;
  }

  async readdir(path: string): Promise<any[]> {
    if (!this.kernel) {
      throw new Error('Kernel not initialized');
    }
    return this.kernel.readdir(path);
  }

  async readFile(path: string): Promise<string> {
    if (!this.kernel) {
      throw new Error('Kernel not initialized');
    }
    return this.kernel.read_file(path);
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.kernel) {
      throw new Error('Kernel not initialized');
    }
    this.kernel.write_file(path, content);
  }

  async mkdir(path: string): Promise<void> {
    if (!this.kernel) {
      throw new Error('Kernel not initialized');
    }
    this.kernel.mkdir(path);
  }

  async getSystemInfo(): Promise<any> {
    if (!this.kernel) {
      throw new Error('Kernel not initialized');
    }
    return this.kernel.get_system_info();
  }
}
