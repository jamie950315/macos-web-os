import React, { useState } from 'react';
import { useWindowManager } from '../store/windowManager';

export const MenuBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const activeWindowId = useWindowManager((s) => s.activeWindowId);
  const windows = useWindowManager((s) => s.windows);

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeWindow = windows.find((w) => w.id === activeWindowId);
  const appName = activeWindow?.title ?? 'Finder';

  const formatTime = (d: Date) => {
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--menu-bar-height, 25px)',
        background: 'var(--menu-bg, rgba(246,246,246,0.8))',
        backdropFilter: 'var(--bg-blur, saturate(180%) blur(20px))',
        WebkitBackdropFilter: 'var(--bg-blur, saturate(180%) blur(20px))',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: 13,
        fontWeight: 600,
        zIndex: 99999,
        color: '#000',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Apple menu */}
        <span style={{ fontSize: 16, cursor: 'pointer' }}></span>
        <span style={{ fontWeight: 700 }}>{appName}</span>
        <span style={{ fontWeight: 400, opacity: 0.8, cursor: 'pointer' }}>File</span>
        <span style={{ fontWeight: 400, opacity: 0.8, cursor: 'pointer' }}>Edit</span>
        <span style={{ fontWeight: 400, opacity: 0.8, cursor: 'pointer' }}>View</span>
        <span style={{ fontWeight: 400, opacity: 0.8, cursor: 'pointer' }}>Window</span>
        <span style={{ fontWeight: 400, opacity: 0.8, cursor: 'pointer' }}>Help</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontWeight: 400 }}>
        <span>🔋 100%</span>
        <span>📶</span>
        <span>{formatTime(time)}</span>
      </div>
    </div>
  );
};
