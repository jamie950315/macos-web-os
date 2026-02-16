import React, { useState, useEffect, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { KernelAPI } from '@macos/darwin-api';
import { 
  Files, Search, GitGraph, Box, Settings, 
  ChevronRight, ChevronDown, X, Terminal as TerminalIcon,
  Layout, Maximize2, MoreHorizontal
} from 'lucide-react';
import { TerminalApp } from './Terminal'; // Reuse our power terminal

// --- Types ---
interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
  isOpen?: boolean;
}

interface Tab {
  path: string;
  name: string;
  isDirty: boolean;
  content: string;
  language: string;
}

// --- Components ---

const FileTree: React.FC<{ 
  path: string; 
  level?: number; 
  onFileClick: (path: string, name: string) => void; 
}> = ({ path, level = 0, onFileClick }) => {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState(false);
  const kernel = KernelAPI.getInstance();
  const name = path.split('/').filter(Boolean).pop() || '/';

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expanded) {
      try {
        const entries = await kernel.readdir(path);
        // Sort: Dirs first
        entries.sort((a: any, b: any) => (a.isDir === b.isDir ? 0 : a.isDir ? -1 : 1));
        setNodes(entries);
      } catch (e) {
        console.error(e);
      }
    }
    setExpanded(!expanded);
  };

  if (level === 0 && !expanded) {
      // Auto expand root
      setExpanded(true); 
      // trigger load
      kernel.readdir(path).then((entries: any) => {
          entries.sort((a: any, b: any) => (a.isDir === b.isDir ? 0 : a.isDir ? -1 : 1));
          setNodes(entries);
      });
  }

  return (
    <div className="select-none">
      <div 
        className={`flex items-center hover:bg-[#37373d] cursor-pointer py-0.5 text-gray-300 text-sm`}
        style={{ paddingLeft: level * 12 + 4 }}
        onClick={(e) => {
            if (level === 0 || nodes.length > 0 || path.indexOf('.') === -1) toggle(e); // simplistic dir check
            else onFileClick(path, name);
        }}
      >
        {/* Simplified: assume everything with extension is file, else dir */}
        {(level === 0 || !name.includes('.')) && (
            <span className="mr-1 opacity-70">
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
        )}
        <span className={`${level===0 ? 'font-bold uppercase text-xs tracking-wider' : ''}`}>
            {level === 0 ? 'Project' : name}
        </span>
      </div>
      
      {expanded && (
        <div>
          {nodes.map(node => (
            node.isDir ? (
                <FileTree 
                    key={node.path} 
                    path={node.path} 
                    level={level + 1} 
                    onFileClick={onFileClick} 
                />
            ) : (
                <div 
                    key={node.path}
                    className="flex items-center hover:bg-[#37373d] cursor-pointer py-0.5 text-gray-300 text-sm group"
                    style={{ paddingLeft: (level + 1) * 12 + 18 }}
                    onClick={() => onFileClick(node.path, node.name)}
                >
                    <span className="truncate">{node.name}</span>
                </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export const VSCode: React.FC<{ filePath?: string }> = ({ filePath: initialPath }) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState('files');
  const [showTerminal, setShowTerminal] = useState(true);
  const kernel = KernelAPI.getInstance();

  // Load initial file if provided
  useEffect(() => {
    if (initialPath) {
      openFile(initialPath, initialPath.split('/').pop() || 'file');
    }
  }, [initialPath]);

  const openFile = async (path: string, name: string) => {
    // Check if already open
    if (tabs.find(t => t.path === path)) {
        setActiveTab(path);
        return;
    }

    try {
        const content = await kernel.readFile(path);
        const language = getLanguage(name);
        const newTab: Tab = { path, name, isDirty: false, content, language };
        setTabs([...tabs, newTab]);
        setActiveTab(path);
    } catch (e) {
        console.error('Failed to open file', e);
    }
  };

  const closeTab = (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      const newTabs = tabs.filter(t => t.path !== path);
      setTabs(newTabs);
      if (activeTab === path) {
          setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1].path : null);
      }
  };

  const updateFileContent = (value: string | undefined) => {
      if (!activeTab || value === undefined) return;
      setTabs(tabs.map(t => t.path === activeTab ? { ...t, content: value, isDirty: true } : t));
  };

  const saveFile = async () => {
      if (!activeTab) return;
      const tab = tabs.find(t => t.path === activeTab);
      if (tab) {
          await kernel.writeFile(tab.path, tab.content);
          setTabs(tabs.map(t => t.path === activeTab ? { ...t, isDirty: false } : t));
      }
  };

  // Keyboard shortcut for save
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 's') {
              e.preventDefault();
              saveFile();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs]);

  const getLanguage = (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase();
      const map: Record<string, string> = {
          ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
          css: 'css', html: 'html', json: 'json', md: 'markdown', rs: 'rust',
          py: 'python', java: 'java', go: 'go'
      };
      return map[ext || ''] || 'plaintext';
  };

  const activeTabObj = tabs.find(t => t.path === activeTab);

  return (
    <div className="flex h-full bg-[#1e1e1e] text-[#cccccc]">
      {/* Activity Bar */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-4 border-r border-[#1e1e1e]">
        <ActivityIcon icon={<Files />} active={sidebarTab === 'files'} onClick={() => setSidebarTab('files')} />
        <ActivityIcon icon={<Search />} active={sidebarTab === 'search'} onClick={() => setSidebarTab('search')} />
        <ActivityIcon icon={<GitGraph />} active={sidebarTab === 'git'} onClick={() => setSidebarTab('git')} />
        <ActivityIcon icon={<Box />} active={sidebarTab === 'extensions'} onClick={() => setSidebarTab('extensions')} />
        <div className="flex-1" />
        <ActivityIcon icon={<Settings />} active={false} onClick={() => {}} />
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-[#252526] border-r border-[#1e1e1e] flex flex-col">
        <div className="h-9 px-4 flex items-center text-xs font-medium uppercase tracking-wider text-gray-400">
            Explorer
        </div>
        <div className="flex-1 overflow-y-auto">
            {/* Hardcoded root path to Guest user for security/convenience */}
            <FileTree path="/Users/guest" onFileClick={openFile} />
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs Bar */}
        <div className="flex bg-[#252526] overflow-x-auto scrollbar-hide h-9">
            {tabs.map(tab => (
                <div 
                    key={tab.path}
                    onClick={() => setActiveTab(tab.path)}
                    className={`
                        flex items-center px-3 min-w-[120px] max-w-[200px] border-r border-[#1e1e1e] cursor-pointer text-sm
                        ${activeTab === tab.path ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2a2b]'}
                    `}
                >
                    <span className="truncate flex-1 mr-2">
                        {tab.name}
                        {tab.isDirty && <span className="ml-1 text-white">*</span>}
                    </span>
                    <button 
                        onClick={(e) => closeTab(e, tab.path)}
                        className="p-0.5 rounded-sm hover:bg-[#4b4b4b] opacity-0 group-hover:opacity-100 tab-close"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
        </div>

        {/* Editor or Empty State */}
        <div className="flex-1 relative">
            {activeTabObj ? (
                <Editor
                    height="100%"
                    language={activeTabObj.language}
                    value={activeTabObj.content}
                    theme="vs-dark"
                    onChange={updateFileContent}
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                    }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                    <div className="text-6xl opacity-20">⌘</div>
                    <p>Select a file to edit</p>
                    <div className="text-xs flex gap-4">
                        <span>Show All Commands <span className="bg-[#333] px-1 rounded">⇧⌘P</span></span>
                        <span>Go to File <span className="bg-[#333] px-1 rounded">⌘P</span></span>
                    </div>
                </div>
            )}
        </div>

        {/* Integrated Terminal Panel */}
        {showTerminal && (
            <div className="h-48 border-t border-[#333] bg-[#1e1e1e] flex flex-col">
                <div className="h-8 flex items-center px-4 gap-4 text-xs border-b border-[#333] uppercase">
                    <span className="text-white border-b border-white pb-1 cursor-pointer">Terminal</span>
                    <span className="text-gray-500 cursor-pointer hover:text-gray-300">Output</span>
                    <span className="text-gray-500 cursor-pointer hover:text-gray-300">Debug Console</span>
                    <span className="text-gray-500 cursor-pointer hover:text-gray-300">Problems</span>
                    <div className="flex-1" />
                    <button onClick={() => setShowTerminal(false)}><X size={12} /></button>
                </div>
                <div className="flex-1 p-2 overflow-hidden">
                    <TerminalApp /> 
                </div>
            </div>
        )}

        {/* Status Bar */}
        <div className="h-6 bg-[#007acc] flex items-center px-3 text-xs text-white select-none">
            <div className="flex gap-4">
                <button onClick={() => setShowTerminal(!showTerminal)} className="flex items-center gap-1 hover:bg-white/10 px-1 rounded">
                    <Layout size={12} />
                </button>
                <span>main*</span>
                <span className="flex items-center gap-1"><X size={10} className="rounded-full bg-white/20 p-[1px]" /> 0</span>
                <span className="flex items-center gap-1"><TerminalIcon size={10} /> 0</span>
            </div>
            <div className="flex-1" />
            <div className="flex gap-4">
                <span>Ln {activeTabObj ? '12' : '--'}, Col {activeTabObj ? '4' : '--'}</span>
                <span>UTF-8</span>
                <span>{activeTabObj?.language || 'Plain Text'}</span>
                <span>Prettier</span>
                <span>🔔</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`p-2 rounded-none relative ${active ? 'text-white' : 'text-gray-500 hover:text-white'}`}
    >
        {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white" />}
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </button>
);
