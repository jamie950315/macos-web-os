import { create } from 'zustand';

interface SystemState {
  booted: boolean;
  bootProgress: number;
  currentUser: string;
  wallpaper: string;
  darkMode: boolean;
  menuBarItems: MenuBarItem[];

  setBooted: (booted: boolean) => void;
  setBootProgress: (progress: number) => void;
  setWallpaper: (url: string) => void;
  toggleDarkMode: () => void;
}

interface MenuBarItem {
  id: string;
  label: string;
  icon?: string;
  position: 'left' | 'right';
  items?: { label: string; shortcut?: string; action?: () => void; separator?: boolean }[];
}

export const useSystemStore = create<SystemState>()((set) => ({
  booted: false,
  bootProgress: 0,
  currentUser: 'guest',
  wallpaper: '/wallpapers/sonoma.jpg',
  darkMode: false,
  menuBarItems: [],

  setBooted: (booted) => set({ booted }),
  setBootProgress: (bootProgress) => set({ bootProgress }),
  setWallpaper: (wallpaper) => set({ wallpaper }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
