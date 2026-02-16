import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullScreen: boolean;
  zIndex: number;
  focus: boolean;
  content: React.ReactNode;
}

interface WindowManagerState {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;

  createWindow: (appId: string, title: string, content: React.ReactNode, options?: Partial<WindowState>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  toggleFullScreen: (id: string) => void;
}

export const useWindowManager = create<WindowManagerState>()(
  immer((set) => ({
    windows: [],
    activeWindowId: null,
    nextZIndex: 100,

    createWindow: (appId, title, content, options = {}) => {
      const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      set((state) => {
        state.windows.forEach(w => w.focus = false);

        const newWindow: WindowState = {
          id,
          appId,
          title,
          content,
          x: options.x ?? 100 + (state.windows.length * 30),
          y: options.y ?? 100 + (state.windows.length * 30),
          width: options.width ?? 800,
          height: options.height ?? 600,
          isMinimized: false,
          isMaximized: false,
          isFullScreen: false,
          zIndex: state.nextZIndex,
          focus: true,
          ...options,
        } as WindowState; // Cast to avoid immer draft issues with ReactNode

        state.windows.push(newWindow);
        state.activeWindowId = id;
        state.nextZIndex += 1;
      });

      return id;
    },

    closeWindow: (id) => {
      set((state) => {
        const idx = state.windows.findIndex(w => w.id === id);
        if (idx > -1) {
          state.windows.splice(idx, 1);
          if (state.activeWindowId === id) {
            state.activeWindowId = state.windows.length > 0
              ? state.windows[state.windows.length - 1].id
              : null;
          }
        }
      });
    },

    minimizeWindow: (id) => {
      set((state) => {
        const win = state.windows.find(w => w.id === id);
        if (win) win.isMinimized = !win.isMinimized;
      });
    },

    maximizeWindow: (id) => {
      set((state) => {
        const win = state.windows.find(w => w.id === id);
        if (win) {
          if (win.isMaximized) {
            win.width = 800;
            win.height = 600;
            win.x = 100;
            win.y = 100;
          } else {
            win.width = window.innerWidth - 20;
            win.height = window.innerHeight - 60;
            win.x = 10;
            win.y = 30;
          }
          win.isMaximized = !win.isMaximized;
        }
      });
    },

    focusWindow: (id) => {
      set((state) => {
        const win = state.windows.find(w => w.id === id);
        if (win && !win.isMinimized) {
          state.windows.forEach(w => w.focus = false);
          win.focus = true;
          win.zIndex = state.nextZIndex;
          state.nextZIndex += 1;
          state.activeWindowId = id;
        }
      });
    },

    moveWindow: (id, x, y) => {
      set((state) => {
        const win = state.windows.find(w => w.id === id);
        if (win) {
          win.x = Math.max(0, x);
          win.y = Math.max(25, y);
        }
      });
    },

    resizeWindow: (id, width, height) => {
      set((state) => {
        const win = state.windows.find(w => w.id === id);
        if (win) {
          win.width = Math.max(400, width);
          win.height = Math.max(300, height);
        }
      });
    },

    toggleFullScreen: (id) => {
      set((state) => {
        const win = state.windows.find(w => w.id === id);
        if (win) {
          win.isFullScreen = !win.isFullScreen;
        }
      });
    },
  }))
);
