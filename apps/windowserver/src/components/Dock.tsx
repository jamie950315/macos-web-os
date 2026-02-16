import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWindowManager } from '../store/windowManager';

import { FinderApp } from '../apps/Finder';
import { Safari } from '../apps/Safari';
import { TerminalApp } from '../apps/Terminal';
import { Calculator } from '../apps/Calculator';
import { TextEdit } from '../apps/TextEdit';
import { SystemPreferences } from '../apps/SystemPreferences';
import { VSCode } from '../apps/VSCode';
import { Music } from '../apps/Music';
import { Photos } from '../apps/Photos';
import { Camera } from '../apps/Camera';

interface DockApp {
  id: string;
  name: string;
  icon: string;
  component: React.ReactNode;
  width?: number;
  height?: number;
}

const DOCK_APPS: DockApp[] = [
  { id: 'finder', name: 'Finder', icon: '📁', component: <FinderApp />, width: 800, height: 500 },
  { id: 'safari', name: 'Safari', icon: '🧭', component: <Safari />, width: 1024, height: 768 },
  { id: 'terminal', name: 'Terminal', icon: '🖥️', component: <TerminalApp />, width: 700, height: 500 },
  { id: 'vscode', name: 'VS Code', icon: '💙', component: <VSCode />, width: 1000, height: 700 },
  { id: 'photos', name: 'Photos', icon: '🖼️', component: <Photos />, width: 900, height: 600 },
  { id: 'music', name: 'Music', icon: '🎵', component: <Music />, width: 800, height: 500 },
  { id: 'camera', name: 'Camera', icon: '📷', component: <Camera />, width: 700, height: 600 },
  { id: 'calculator', name: 'Calculator', icon: '🧮', component: <Calculator />, width: 320, height: 480 },
  { id: 'textedit', name: 'TextEdit', icon: '📝', component: <TextEdit />, width: 600, height: 400 },
  { id: 'system-preferences', name: 'System Settings', icon: '⚙️', component: <SystemPreferences />, width: 800, height: 600 },
];

export const Dock: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const createWindow = useWindowManager((s) => s.createWindow);

  const handleClick = (app: DockApp) => {
    createWindow(app.id, app.name, app.component, {
      width: app.width,
      height: app.height,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 4,
        padding: '4px 8px',
        background: 'rgba(255,255,255,0.25)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.3)',
        zIndex: 99998,
      }}
    >
      {DOCK_APPS.map((app, i) => {
        const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - i) : 999;
        const scale = hoveredIndex !== null
          ? distance === 0 ? 1.5 : distance === 1 ? 1.25 : 1
          : 1;

        return (
          <motion.div
            key={app.id}
            animate={{ scale }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleClick(app)}
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              cursor: 'pointer',
              transformOrigin: 'bottom center',
              borderRadius: 12,
            }}
            title={app.name}
          >
            {app.icon}
          </motion.div>
        );
      })}
    </div>
  );
};
