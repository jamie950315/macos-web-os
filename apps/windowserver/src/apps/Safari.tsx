import React, { useState } from 'react';
import { RefreshCcw, ArrowLeft, ArrowRight, Lock, Plus, X, Star, BookOpen, Share } from 'lucide-react';

interface Tab {
  id: string;
  url: string;
  title: string;
  history: string[];
  historyIndex: number;
}

export const Safari: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: 'https://openclaw.ai', title: 'OpenClaw AI', history: ['https://openclaw.ai'], historyIndex: 0 }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('');

  const activeTab = tabs.find(t => t.id === activeTabId)!;

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const navigate = (url: string) => {
    let target = url;
    if (!url.startsWith('http')) target = `https://${url}`;
    
    const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
    newHistory.push(target);
    
    updateTab(activeTabId, {
        url: target,
        history: newHistory,
        historyIndex: newHistory.length - 1
    });
  };

  const newTab = () => {
      const id = Date.now().toString();
      setTabs([...tabs, { id, url: '', title: 'Start Page', history: [], historyIndex: -1 }]);
      setActiveTabId(id);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const newTabs = tabs.filter(t => t.id !== id);
      if (newTabs.length === 0) newTab();
      else {
          setTabs(newTabs);
          if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f6f6]">
      {/* Tab Bar */}
      <div className="flex items-center pt-2 px-2 gap-1 bg-[#dcdcdc] border-b border-[#a0a0a0]">
        <div className="flex gap-2 mr-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
        </div>
        
        <div className="flex-1 flex overflow-x-auto scrollbar-hide gap-1">
            {tabs.map(tab => (
                <div 
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`
                        flex items-center px-3 py-1.5 min-w-[140px] max-w-[200px] rounded-t-lg text-xs cursor-default
                        ${activeTabId === tab.id ? 'bg-[#f6f6f6] shadow-sm font-medium' : 'bg-[#dcdcdc] text-gray-600 hover:bg-[#d0d0d0]'}
                    `}
                >
                    <span className="truncate flex-1">{tab.url || 'Start Page'}</span>
                    <button onClick={(e) => closeTab(e, tab.id)} className="ml-2 hover:bg-black/10 rounded p-0.5"><X size={10} /></button>
                </div>
            ))}
            <button onClick={newTab} className="p-1.5 hover:bg-black/5 rounded"><Plus size={14} /></button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-10 bg-[#f6f6f6] flex items-center px-3 gap-3 border-b border-[#dcdcdc]">
        <div className="flex gap-1">
            <button className="p-1 rounded hover:bg-black/5 disabled:opacity-30"><ArrowLeft size={16} /></button>
            <button className="p-1 rounded hover:bg-black/5 disabled:opacity-30"><ArrowRight size={16} /></button>
        </div>
        
        <button className="p-1 rounded hover:bg-black/5"><BookOpen size={16} /></button>

        <form 
            onSubmit={(e) => { e.preventDefault(); navigate(urlInput); }} 
            className="flex-1 flex items-center bg-[#e5e5e5] rounded-md px-2 h-7 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/30 transition-all border border-transparent focus-within:border-blue-500/50"
        >
            <Lock size={10} className="text-gray-500 mr-2" />
            <input
                type="text"
                value={activeTab.url === urlInput ? urlInput : activeTab.url} // Simplified sync
                onChange={(e) => { setUrlInput(e.target.value); updateTab(activeTabId, { url: e.target.value }); }}
                className="flex-1 bg-transparent border-none outline-none text-sm text-center focus:text-left selection:bg-blue-200"
                placeholder="Search or enter website name"
            />
            <RefreshCcw size={12} className="text-gray-500 ml-2 cursor-pointer hover:text-black" />
        </form>

        <button className="p-1 rounded hover:bg-black/5"><Share size={16} /></button>
        <button className="p-1 rounded hover:bg-black/5"><Plus size={16} /></button>
        <button className="p-1 rounded hover:bg-black/5"><div className="border border-black rounded w-4 h-4 flex justify-center items-center text-[8px]">2</div></button>
      </div>

      {/* Favorites Bar */}
      <div className="h-7 bg-[#f6f6f6] flex items-center px-4 gap-4 text-xs text-gray-600 border-b border-[#dcdcdc]">
        <Favorite label="Apple" icon="" />
        <Favorite label="iCloud" icon="☁️" />
        <Favorite label="Google" icon="G" />
        <Favorite label="OpenClaw" icon="🦞" />
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white">
        {activeTab.url ? (
            <iframe
                src={activeTab.url}
                className="w-full h-full border-none"
                title="Content"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#fbfbfb] text-gray-400">
                <div className="text-6xl font-light mb-4">Safari</div>
                <div className="grid grid-cols-4 gap-8">
                    <StartPageItem icon="" label="Apple" />
                    <StartPageItem icon="☁️" label="iCloud" />
                    <StartPageItem icon="G" label="Google" />
                    <StartPageItem icon="🦞" label="OpenClaw" />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const Favorite: React.FC<{ label: string; icon: string }> = ({ label, icon }) => (
    <div className="flex items-center gap-1 cursor-pointer hover:bg-black/5 px-2 py-0.5 rounded">
        <span>{icon}</span>
        <span>{label}</span>
    </div>
);

const StartPageItem: React.FC<{ label: string; icon: string }> = ({ label, icon }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
        <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            {icon}
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
);
