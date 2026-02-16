import React, { useState } from 'react';
import { useSystemStore } from '@macos/windowserver/store';
import { 
  Moon, Sun, Monitor, Info, Image as ImageIcon, Wifi, Bluetooth, 
  Globe, Bell, Lock, Fingerprint, Keyboard, Mouse, Battery, Folder
} from 'lucide-react';

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
    <div 
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
);

export const SystemPreferences: React.FC = () => {
  const { darkMode, toggleDarkMode, wallpaper, setWallpaper } = useSystemStore();
  const [activeTab, setActiveTab] = useState('appearance');

  const wallpapers = [
    { name: 'Sonoma Horizon', url: '/wallpapers/sonoma.jpg' },
    { name: 'Ventura Graphic', url: '/wallpapers/ventura.jpg' },
    { name: 'Monterey Canyon', url: '/wallpapers/monterey.jpg' },
    { name: 'Big Sur Coast', url: '/wallpapers/big-sur.jpg' },
    { name: 'Solar Gradients', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80' },
    { name: 'Midnight City', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=80' },
  ];

  return (
    <div className="flex h-full bg-[#f5f5f7] text-gray-900 font-sans select-none">
      {/* Sidebar */}
      <div className="w-64 flex flex-col border-r border-gray-200/50 pt-8 pb-4 px-3 overflow-y-auto bg-[#f0f0f2]/50 backdrop-blur-xl">
        {/* User Card */}
        <div className="flex items-center gap-3 mb-6 px-2 hover:bg-black/5 p-2 rounded-lg cursor-pointer transition-colors">
            <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl shadow-inner font-semibold">G</div>
            <div>
                <div className="font-semibold">Guest User</div>
                <div className="text-xs text-gray-500">Apple ID</div>
            </div>
        </div>

        <div className="space-y-1">
            <SidebarItem icon={<Wifi className="bg-blue-500 text-white p-1 rounded-md" />} label="Wi-Fi" active={activeTab === 'wifi'} onClick={() => setActiveTab('wifi')} status="On" />
            <SidebarItem icon={<Bluetooth className="bg-blue-500 text-white p-1 rounded-md" />} label="Bluetooth" active={activeTab === 'bt'} onClick={() => setActiveTab('bt')} status="On" />
            <SidebarItem icon={<Globe className="bg-blue-500 text-white p-1 rounded-md" />} label="Network" active={activeTab === 'net'} onClick={() => setActiveTab('net')} />
        </div>
        
        <div className="my-4 h-px bg-gray-300/50" />

        <div className="space-y-1">
            <SidebarItem icon={<Bell className="bg-red-500 text-white p-1 rounded-md" />} label="Notifications" active={activeTab === 'notif'} onClick={() => setActiveTab('notif')} />
            <SidebarItem icon={<Monitor className="bg-gray-500 text-white p-1 rounded-md" />} label="Displays" active={activeTab === 'display'} onClick={() => setActiveTab('display')} />
            <SidebarItem icon={<ImageIcon className="bg-cyan-500 text-white p-1 rounded-md" />} label="Wallpaper" active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
            <SidebarItem icon={<Lock className="bg-gray-500 text-white p-1 rounded-md" />} label="Lock Screen" active={activeTab === 'lock'} onClick={() => setActiveTab('lock')} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>

        {activeTab === 'appearance' && (
            <div className="max-w-2xl space-y-8">
                {/* Theme Toggle */}
                <Section title="Appearance">
                    <div className="flex gap-4">
                        <div onClick={() => darkMode && toggleDarkMode()} className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2 w-32 transition-all ${!darkMode ? 'border-blue-500 bg-white shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                            <div className="w-full h-16 bg-[#e5e5e5] rounded-lg relative overflow-hidden">
                                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white shadow-sm" />
                            </div>
                            <span className="text-sm font-medium">Light</span>
                        </div>
                        <div onClick={() => !darkMode && toggleDarkMode()} className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2 w-32 transition-all ${darkMode ? 'border-blue-500 bg-white shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                            <div className="w-full h-16 bg-[#1e1e1e] rounded-lg relative overflow-hidden">
                                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gray-600" />
                            </div>
                            <span className="text-sm font-medium">Dark</span>
                        </div>
                        <div className="cursor-pointer p-4 rounded-xl border-2 border-transparent hover:bg-white/50 flex flex-col items-center gap-2 w-32 opacity-50">
                            <div className="w-full h-16 bg-gradient-to-r from-[#e5e5e5] to-[#1e1e1e] rounded-lg" />
                            <span className="text-sm font-medium">Auto</span>
                        </div>
                    </div>
                </Section>

                {/* Wallpaper Grid */}
                <Section title="Wallpapers">
                    <div className="grid grid-cols-3 gap-4">
                        {wallpapers.map((wp) => (
                            <div 
                                key={wp.name}
                                onClick={() => setWallpaper(wp.url)}
                                className={`
                                    group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                                    ${wallpaper === wp.url ? 'border-blue-500 scale-[1.02] shadow-md' : 'border-transparent hover:scale-[1.02] hover:shadow-sm'}
                                `}
                            >
                                <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium">{wp.name}</span>
                                </div>
                                {wallpaper === wp.url && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm">✓</div>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
        )}

        {activeTab === 'wifi' && (
            <Section title="Wi-Fi">
                <div className="bg-white rounded-xl divide-y divide-gray-100 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Wifi className="text-blue-500" />
                            <span className="font-medium">Wi-Fi</span>
                        </div>
                        <Switch checked={true} onChange={() => {}} />
                    </div>
                    <div className="p-2">
                        {['My Network 5G', 'Guest WiFi', 'Starbucks'].map(net => (
                            <div key={net} className="flex items-center justify-between p-2 px-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <span className="text-sm">{net}</span>
                                {net === 'My Network 5G' ? <span className="text-blue-500 text-xs font-medium">Connected</span> : <Lock size={14} className="text-gray-400" />}
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
        )}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</h2>
        {children}
    </div>
);

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void; status?: string }> = ({ icon, label, active, onClick, status }) => (
    <div 
        onClick={onClick}
        className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-black/5 text-gray-700'}`}
    >
        <div className="flex items-center gap-3">
            <div className="scale-75">{icon}</div>
            <span className="text-sm font-medium">{label}</span>
        </div>
        {status && <span className={`text-xs ${active ? 'text-blue-100' : 'text-gray-400'}`}>{status}</span>}
    </div>
);
