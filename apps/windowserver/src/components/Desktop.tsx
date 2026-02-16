import React from 'react';
import { useSystemStore } from '../store/systemStore';

export const Desktop: React.FC = () => {
  const { darkMode } = useSystemStore();

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        // Sonoma-style gradient wallpaper
        background: darkMode
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #1a1a2e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #5ee7df 75%, #667eea 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 30s ease infinite',
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};
