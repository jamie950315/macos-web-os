/**
 * Aqua Rendering Engine
 * Provides macOS-style visual effects and animations
 */

export const AquaEffects = {
  blur: (intensity: number = 20) => ({
    backdropFilter: `blur(${intensity}px)`,
    WebkitBackdropFilter: `blur(${intensity}px)`,
  }),

  vibrancy: (type: 'light' | 'dark' | 'medium' = 'light') => {
    const configs = {
      light: { background: 'rgba(255, 255, 255, 0.7)' },
      dark: { background: 'rgba(0, 0, 0, 0.7)' },
      medium: { background: 'rgba(128, 128, 128, 0.7)' },
    };
    return configs[type];
  },

  shadow: (level: 1 | 2 | 3 = 2) => {
    const shadows = {
      1: '0 1px 3px rgba(0, 0, 0, 0.1)',
      2: '0 4px 12px rgba(0, 0, 0, 0.15)',
      3: '0 10px 30px rgba(0, 0, 0, 0.25)',
    };
    return { boxShadow: shadows[level] };
  },
};

export const AquaColors = {
  accent: '#007AFF',
  accentHover: '#0051D5',
  windowBg: 'rgba(246, 246, 246, 0.9)',
  titleBarBg: 'rgba(232, 232, 232, 0.85)',
};
