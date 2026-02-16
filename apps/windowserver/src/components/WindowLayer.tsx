import React from 'react';
import { useWindowManager } from '../store/windowManager';
import { WindowFrame } from './WindowFrame';

export const WindowLayer: React.FC = () => {
  const windows = useWindowManager((s) => s.windows);

  return (
    <>
      {windows
        .filter((w) => !w.isMinimized)
        .map((w) => (
          <WindowFrame key={w.id} windowState={w} />
        ))}
    </>
  );
};
