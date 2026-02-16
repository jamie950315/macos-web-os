import React, { useEffect, useState } from 'react';
import { useSystemStore } from './store/systemStore';
import { useWindowManager } from './store/windowManager';
import { BootScreen } from './components/BootScreen';
import { Desktop } from './components/Desktop';
import { MenuBar } from './components/MenuBar';
import { Dock } from './components/Dock';
import { WindowLayer } from './components/WindowLayer';
import { KernelAPI } from '@macos/darwin-api';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import init, { DarwinKernel } from '../../kernel/pkg/darwin_kernel';

// Import all apps for Spotlight
import { FinderApp } from './apps/Finder';
import { Safari } from './apps/Safari';
import { TerminalApp } from './apps/Terminal';
import { Calculator } from './apps/Calculator';
import { TextEdit } from './apps/TextEdit';
import { SystemPreferences } from './apps/SystemPreferences';
import { VSCode } from './apps/VSCode';
import { Music } from './apps/Music';
import { Photos } from './apps/Photos';
import { Camera } from './apps/Camera';
import { ActivityMonitor } from './apps/ActivityMonitor';

const APPS_MAP: Record<string, { name: string, icon: string, component: React.ReactNode, width?: number, height?: number }> = {
    'finder': { name: 'Finder', icon: '📁', component: <FinderApp />, width: 800, height: 600 },
    'safari': { name: 'Safari', icon: '🧭', component: <Safari />, width: 1024, height: 768 },
    'terminal': { name: 'Terminal', icon: '🖥️', component: <TerminalApp />, width: 700, height: 500 },
    'vscode': { name: 'VS Code', icon: '💙', component: <VSCode />, width: 1000, height: 800 },
    'activity': { name: 'Activity Monitor', icon: '📈', component: <ActivityMonitor />, width: 800, height: 600 },
    'photos': { name: 'Photos', icon: '🖼️', component: <Photos />, width: 900, height: 600 },
    'music': { name: 'Music', icon: '🎵', component: <Music />, width: 800, height: 500 },
    'camera': { name: 'Camera', icon: '📷', component: <Camera />, width: 700, height: 600 },
    'calculator': { name: 'Calculator', icon: '🧮', component: <Calculator />, width: 320, height: 480 },
    'textedit': { name: 'TextEdit', icon: '📝', component: <TextEdit />, width: 600, height: 400 },
    'settings': { name: 'System Settings', icon: '⚙️', component: <SystemPreferences />, width: 800, height: 600 },
};

export const WindowServer: React.FC = () => {
  const { booted, setBooted, setBootProgress } = useSystemStore();
  const [error, setError] = useState<string | null>(null);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const createWindow = useWindowManager((s) => s.createWindow);

  useEffect(() => {
    const boot = async () => {
      try {
        setBootProgress(10);
        console.log('Starting macOS Web Kernel...');
        
        try {
            await init();
            setBootProgress(40);
        } catch (e: any) {
            console.error('WASM Init Failed:', e);
        }
        
        let kernel;
        try {
            kernel = new DarwinKernel();
            setBootProgress(60);
        } catch (e: any) {
            console.error('Kernel Create Failed:', e);
        }

        if (kernel) {
            try {
                // Idempotent init
                const result = kernel.init();
                console.log('Kernel Init:', result);
                setBootProgress(80);
                KernelAPI.getInstance().setKernel(kernel);
            } catch (e: any) {
                console.error('Kernel Logic Failed:', e);
            }
        }
        
        setBootProgress(90);

        setTimeout(() => {
          setBootProgress(100);
          setTimeout(() => setBooted(true), 500);
        }, 500);

      } catch (e: any) {
        console.error('Boot failed:', e);
        setError(e.message || 'Kernel panic');
      }
    };

    boot();
  }, [setBooted, setBootProgress]);

  // Global Shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              setShowSpotlight(prev => !prev);
          }
          if (e.key === 'Escape') {
              setShowSpotlight(false);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSpotlightSelect = (appId: string) => {
      const app = APPS_MAP[appId];
      if (app) {
          createWindow(appId, app.name, app.component, { width: app.width, height: app.height });
          setShowSpotlight(false);
          setSpotlightQuery('');
      }
  };

  const filteredApps = Object.entries(APPS_MAP).filter(([, app]) => 
      app.name.toLowerCase().includes(spotlightQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center font-mono p-10">
        <h1 className="text-red-500 text-2xl mb-4">KERNEL PANIC</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-4 py-2 border border-white rounded hover:bg-white hover:text-black">
          Reboot
        </button>
      </div>
    );
  }

  if (!booted) {
    return <BootScreen />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Desktop />
      <WindowLayer />
      <MenuBar />
      <Dock />

      {/* Spotlight Overlay */}
      <AnimatePresence>
        {showSpotlight && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm z-[99999]"
                    onClick={() => setShowSpotlight(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-white/20 z-[100000]"
                >
                    <div className="flex items-center px-4 py-4 gap-3 border-b border-gray-200/50">
                        <Search size={24} className="text-gray-500" />
                        <input 
                            autoFocus
                            value={spotlightQuery}
                            onChange={(e) => setSpotlightQuery(e.target.value)}
                            placeholder="Spotlight Search"
                            className="flex-1 bg-transparent text-2xl font-light outline-none placeholder:text-gray-400"
                        />
                    </div>
                    {spotlightQuery && (
                        <div className="max-h-[400px] overflow-y-auto p-2">
                            {filteredApps.length > 0 ? (
                                <>
                                    <div className="text-xs font-semibold text-gray-500 px-2 mb-1">Top Hit</div>
                                    {filteredApps.map(([id, app], i) => (
                                        <div 
                                            key={id}
                                            onClick={() => handleSpotlightSelect(id)}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${i === 0 ? 'bg-blue-500 text-white' : 'hover:bg-gray-200/50'}`}
                                        >
                                            <div className="text-2xl">{app.icon}</div>
                                            <div className="flex-1">
                                                <div className="font-medium">{app.name}</div>
                                                <div className={`text-xs ${i === 0 ? 'text-blue-100' : 'text-gray-500'}`}>Application</div>
                                            </div>
                                            {i === 0 && <span className="text-xs opacity-80">Return</span>}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="p-4 text-center text-gray-500">No results found</div>
                            )}
                        </div>
                    )}
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
};
