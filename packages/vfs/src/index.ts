/**
 * Virtual File System utilities
 * TypeScript helpers for VFS operations
 */

export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modified: number;
}

export const VFSUtils = {
  parsePath(path: string): string[] {
    return path.split('/').filter(Boolean);
  },

  joinPath(...parts: string[]): string {
    return '/' + parts.filter(Boolean).join('/');
  },

  getParentPath(path: string): string {
    const parts = this.parsePath(path);
    parts.pop();
    return this.joinPath(...parts);
  },

  getFileName(path: string): string {
    const parts = this.parsePath(path);
    return parts[parts.length - 1] || '';
  },
};
