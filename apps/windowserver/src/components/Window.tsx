import React, { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useWindowManager } from '../store/windowManager';

interface WindowProps {
  id: string;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ id, children }) => {
  const win = useWindowManager(state => state.windows.find(w => w.id === id));
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, moveWindow } = useWindowManager();
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  if (!win || win.isMinimized) return null;

  return (
    <motion.div
      ref={windowRef}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragListener={!win.isMaximized && !win.isFullScreen}
      onDragEnd={(_, info) => {
        moveWindow(id, win.x + info.offset.x, win.y + info.offset.y);
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      onPointerDown={() => focusWindow(id)}
      onClick={() => focusWindow(id)}
      className={`
        absolute rounded-xl overflow-hidden shadow-2xl
        backdrop-blur-xl bg-white/80 border border-white/20
        ${win.focus ? 'ring-1 ring-blue-400/30' : 'grayscale-[0.1]'}
        flex flex-col
      `}
      style={{
        boxShadow: win.focus
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
        zIndex: win.zIndex
      }}
    >
      {/* 標題列 */}
      <div
        className={`
          h-10 flex items-center justify-between px-4
          ${win.focus ? 'bg-gradient-to-b from-gray-100/90 to-gray-200/80' : 'bg-gray-200/60'}
          border-b border-black/5 cursor-default select-none
        `}
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex items-center gap-2">
          {/* 關閉、縮小、全螢幕按鈕 */}
          <div className="flex gap-2 group">
            <button
              onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
              className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/30 hover:bg-[#ff5f57]/80 flex items-center justify-center text-[8px] text-black/0 hover:text-black/60"
            >
              ×
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
              className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]/30 hover:bg-[#febc2e]/80 flex items-center justify-center text-[8px] text-black/0 hover:text-black/60"
            >
              −
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); maximizeWindow(id); }}
              className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]/30 hover:bg-[#28c840]/80 flex items-center justify-center text-[8px] text-black/0 hover:text-black/60"
            >
              +
            </button>
          </div>
        </div>

        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-gray-700/80 max-w-[50%] truncate pointer-events-none">
          {win.title}
        </span>

        <div className="w-10" /> {/* Spacer for balance */}
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-hidden relative bg-white/40">
        {children}
      </div>

      {/* 縮放控制（右下角） */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = win.width;
          const startHeight = win.height;

          const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            useWindowManager.getState().resizeWindow(id, startWidth + dx, startHeight + dy);
          };

          const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
          };

          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
        }}
      />
    </motion.div>
  );
};
