import React, { useState } from 'react';
import { useSystemStore } from '@macos/windowserver/store';
import { Moon, Sun, Monitor, Info, Image as ImageIcon } from 'lucide-react';

export const SystemPreferences: React.FC = () => {
  const { darkMode, toggleDarkMode, wallpaper, setWallpaper } = useSystemStore();
  const [activeTab, setActiveTab] = useState('general');

  const wallpapers = [
    { name: 'Sonoma', url: '/wallpapers/sonoma.jpg' },
    { name: 'Ventura', url: '/wallpapers/ventura.jpg' },
    { name: 'Monterey', url: '/wallpapers/monterey.jpg' },
    { name: 'Big Sur', url: '/wallpapers/big-sur.jpg' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f6f6f6] text-gray-800">
      {/* Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-48 border-r border-gray-200 bg-[#e8e6e8] flex flex-col p-4 gap-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-200/50">
            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl">
              G
            </div>
            <div>
              <div className="font-semibold text-sm">Guest User</div>
              <div className="text-xs text-gray-500">Local Account</div>
            </div>
          </div>

          <div className="h-px bg-gray-300 my-2" />

          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-sm ${activeTab === 'general' ? 'bg-[#007aff] text-white' : 'hover:bg-black/5'}`}
          >
            <Monitor size={16} /> General
          </button>
          <button
            onClick={() => setActiveTab('wallpaper')}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-sm ${activeTab === 'wallpaper' ? 'bg-[#007aff] text-white' : 'hover:bg-black/5'}`}
          >
            <ImageIcon size={16} /> Wallpaper
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-sm ${activeTab === 'about' ? 'bg-[#007aff] text-white' : 'hover:bg-black/5'}`}
          >
            <Info size={16} /> About
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-white">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium mb-4">Appearance</h2>
              <div className="flex gap-4">
                <div
                  onClick={() => !darkMode && toggleDarkMode()}
                  className={`cursor-pointer p-4 border rounded-lg flex flex-col items-center gap-2 ${darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <Moon size={32} />
                  <span className="text-sm">Dark</span>
                </div>
                <div
                  onClick={() => darkMode && toggleDarkMode()}
                  className={`cursor-pointer p-4 border rounded-lg flex flex-col items-center gap-2 ${!darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <Sun size={32} />
                  <span className="text-sm">Light</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallpaper' && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium mb-4">Wallpaper</h2>
              <div className="grid grid-cols-2 gap-4">
                {wallpapers.map((wp) => (
                  <div
                    key={wp.name}
                    onClick={() => setWallpaper(wp.url)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${wallpaper === wp.url ? 'border-blue-500 scale-105' : 'border-transparent hover:scale-105'}`}
                  >
                    <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${wp.url})`, backgroundColor: '#ddd' }} />
                    <div className="p-2 text-center text-sm font-medium">{wp.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg flex items-center justify-center text-4xl text-white">
                
              </div>
              <h1 className="text-2xl font-bold">macOS Web</h1>
              <p className="text-gray-500">Version 14.0 Sonoma (Web Edition)</p>
              <div className="bg-gray-100 p-4 rounded-lg text-sm text-left w-full max-w-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Processor</span>
                  <span>WebAssembly Core i9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Memory</span>
                  <span>16 GB Unified Memory</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Graphics</span>
                  <span>WebGL 2.0 Metal</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
