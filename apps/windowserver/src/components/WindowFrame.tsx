import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWindowManager, type WindowState } from '../store/windowManager';

interface WindowFrameProps {
  windowState: WindowState;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ windowState }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow } =
    useWindowManager();

  const dragRef = useRef({ startX: 0, startY: 0, winX: 0, winY: 0, dragging: false });

  const handleTitleBarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      focusWindow(windowState.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        winX: windowState.x,
        winY: windowState.y,
        dragging: true,
      };

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current.dragging) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        moveWindow(windowState.id, dragRef.current.winX + dx, dragRef.current.winY + dy);
      };

      const onMouseUp = () => {
        dragRef.current.dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [windowState.id, windowState.x, windowState.y, focusWindow, moveWindow]
  );

  const w = windowState;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: w.isFullScreen ? 0 : w.x,
        y: w.isFullScreen ? 0 : w.y,
        width: w.isFullScreen ? '100vw' : w.isMaximized ? '100vw' : w.width,
        height: w.isFullScreen ? '100vh' : w.isMaximized ? `calc(100vh - 25px)` : w.height,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseDown={() => focusWindow(w.id)}
      style={{
        position: 'absolute',
        top: w.isMaximized && !w.isFullScreen ? 25 : 0,
        left: 0,
        zIndex: w.zIndex,
        borderRadius: w.isFullScreen ? 0 : 10,
        overflow: 'hidden',
        boxShadow: w.focus
          ? 'var(--window-shadow, 0 22px 70px 4px rgba(0,0,0,0.28))'
          : '0 8px 30px rgba(0,0,0,0.12)',
        border: w.isFullScreen ? 'none' : '1px solid var(--window-border, rgba(0,0,0,0.12))',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title Bar */}
      {!w.isFullScreen && (
        <div
          onMouseDown={handleTitleBarMouseDown}
          onDoubleClick={() => maximizeWindow(w.id)}
          style={{
            height: 'var(--window-title-height, 28px)',
            background: w.focus ? 'var(--window-bg, rgba(246,246,246,0.85))' : 'rgba(232,232,232,0.9)',
            backdropFilter: 'var(--bg-blur)',
            WebkitBackdropFilter: 'var(--bg-blur)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            cursor: 'default',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            flexShrink: 0,
          }}
        >
          {/* Traffic Lights */}
          <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
            <TrafficLight color="#FF5F57" onClick={() => closeWindow(w.id)} />
            <TrafficLight color="#FEBC2E" onClick={() => minimizeWindow(w.id)} />
            <TrafficLight color="#28C840" onClick={() => maximizeWindow(w.id)} />
          </div>
          <span
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 500,
              color: w.focus ? '#333' : '#999',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {w.title}
          </span>
          <div style={{ width: 54 }} /> {/* Spacer to center title */}
        </div>
      )}

      {/* Window Content */}
      <div
        style={{
          flex: 1,
          background: 'var(--window-bg, rgba(246,246,246,0.85))',
          backdropFilter: 'var(--bg-blur)',
          WebkitBackdropFilter: 'var(--bg-blur)',
          overflow: 'hidden', // Let app handle overflow
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {w.content}
      </div>
    </motion.div>
  );
};

const TrafficLight: React.FC<{ color: string; onClick: () => void }> = ({ color, onClick }) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    style={{
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: color,
      cursor: 'pointer',
      border: '1px solid rgba(0,0,0,0.1)',
    }}
  />
);
