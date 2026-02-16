import React from 'react';
import { useSystemStore } from '../store/systemStore';

export const BootScreen: React.FC = () => {
  const { bootProgress } = useSystemStore();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}
    >
      {/* Apple Logo */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 170 170"
        fill="white"
        style={{ marginBottom: 40 }}
      >
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.92.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.76-14.04-5.05-7.08-9.2-15.29-12.46-24.65C18.79 111.78 17 102.96 17 94.4c0-9.84 2.13-18.33 6.38-25.45 3.35-5.72 7.81-10.24 13.4-13.56 5.59-3.32 11.63-5.01 18.15-5.18 3.92 0 9.06 1.21 15.44 3.6 6.36 2.4 10.44 3.61 12.24 3.61 1.34 0 5.88-1.42 13.57-4.25 7.27-2.63 13.41-3.72 18.44-3.29 13.63 1.1 23.87 6.47 30.67 16.15-12.19 7.39-18.22 17.73-18.1 31 .12 10.33 3.86 18.94 11.2 25.78 3.33 3.16 7.05 5.6 11.18 7.34-.9 2.6-1.84 5.1-2.84 7.48zM119.11 7.24c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.37a25.2 25.2 0 01-.19-3.07c0-7.78 3.39-16.1 9.4-22.9 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.71.12 1.1.17 2.2.17 3.24z" />
      </svg>

      {/* Progress Bar */}
      <div
        style={{
          width: 200,
          height: 4,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${bootProgress}%`,
            height: '100%',
            background: '#fff',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
