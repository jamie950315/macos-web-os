import React, { useEffect, useState } from 'react';
import { useWindowManager } from '../store/windowManager';
import { KernelAPI } from '@macos/darwin-api';
import { TextEdit } from './TextEdit';
import { VSCode } from './VSCode';
import { 
  ChevronLeft, ChevronRight, LayoutGrid, List, Search, 
  Folder, FileText, Image as ImageIcon, Music, Film, HardDrive, 
  Download, Clock, Cloud, Monitor, ChevronRight as BreadcrumbArrow 
} from 'lucide-react';
import { format } from 'date-fns';

interface FileItem {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modified: number;
}

export const FinderApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/Users/guest/Desktop');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'icon' | 'list'>('icon');
  const [history, setHistory] = useState<string[]>(['/Users/guest/Desktop']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const createWindow = useWindowManager((s) => s.createWindow);
  const kernel = KernelAPI.getInstance();

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    try {
      const entries = await kernel.readdir(path);
      // Sort: Folders first
      entries.sort((a: any, b: any) => {
          if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
          return a.isDir ? -1 : 1;
      });
      setFiles(entries);
    } catch (err) {
      console.error('Failed to read directory:', err);
    }
  };

  const navigate = (path: string) => {
      if (path === currentPath) return;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(path);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentPath(path);
      setSelectedIds([]);
  };

  const goBack = () => {
      if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setCurrentPath(history[historyIndex - 1]);
      }
  };

  const goForward = () => {
      if (historyIndex < history.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setCurrentPath(history[historyIndex + 1]);
      }
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.isDir) {
      navigate(item.path);
    } else {
      openFile(item);
    }
  };

  const openFile = (item: FileItem) => {
    const ext = item.name.split('.').pop()?.toLowerCase();
    const options = { width: 800, height: 600 };
    
    switch (ext) {
      case 'txt': case 'md': case 'json': case 'xml': case 'yaml':
        createWindow('com.apple.textedit', item.name, <TextEdit filePath={item.path} />, { ...options, width: 600, height: 400 });
        break;
      case 'js': case 'ts': case 'tsx': case 'jsx': case 'css': case 'html': case 'py': case 'rs':
        createWindow('com.microsoft.vscode', item.name, <VSCode filePath={item.path} />, { ...options, width: 1000, height: 800 });
        break;
      case 'png': case 'jpg': case 'jpeg': case 'gif':
        // Reuse Photos app in single view mode (simplified here)
        // ideally Photos app should accept a path
        alert('Preview not implemented yet for ' + ext);
        break;
      default:
        alert(`Cannot open file: ${item.name}`);
    }
  };

  const handleSelect = (e: React.MouseEvent, path: string) => {
      if (e.metaKey || e.ctrlKey) {
          setSelectedIds(prev => prev.includes(path) ? prev.filter(id => id !== path) : [...prev, path]);
      } else {
          setSelectedIds([path]);
      }
  };

  const getIcon = (item: FileItem) => {
      if (item.isDir) return <Folder size={48} className="text-blue-400 fill-blue-400/20" />;
      const ext = item.name.split('.').pop()?.toLowerCase();
      switch (ext) {
          case 'png': case 'jpg': return <ImageIcon size={48} className="text-purple-400" />;
          case 'mp3': case 'wav': return <Music size={48} className="text-red-400" />;
          case 'mp4': case 'mov': return <Film size={48} className="text-orange-400" />;
          case 'txt': case 'md': return <FileText size={48} className="text-gray-400" />;
          default: return <FileText size={48} className="text-gray-300" />;
      }
  };

  const formatSize = (bytes: number) => {
      if (bytes === 0) return '--';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-white text-black font-sans select-none rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="h-12 bg-[#f3f3f3] border-b border-[#dcdcdc] flex items-center px-4 gap-4 draggable-area">
        <div className="flex gap-2">
          <button onClick={goBack} disabled={historyIndex === 0} className="p-1 rounded hover:bg-black/5 disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-1 rounded hover:bg-black/5 disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-[#e3e3e3] rounded-md p-0.5 border border-[#dcdcdc]">
            <button 
                onClick={() => setViewMode('icon')} 
                className={`p-1 px-2 rounded-sm ${viewMode === 'icon' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            >
                <LayoutGrid size={14} />
            </button>
            <button 
                onClick={() => setViewMode('list')} 
                className={`p-1 px-2 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            >
                <List size={14} />
            </button>
        </div>

        <div className="flex-1" />

        <div className="relative">
            <Search size={14} className="absolute left-2 top-1.5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search" 
                className="pl-8 pr-3 py-1 bg-[#e3e3e3] border border-[#dcdcdc] rounded-md text-sm w-48 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
            />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-[#f3f3f3]/50 backdrop-blur-xl border-r border-[#dcdcdc] flex flex-col p-2 pt-4 gap-1 text-sm font-medium text-gray-600">
            <SidebarGroup title="Favorites">
                <SidebarItem icon={<Clock size={16} className="text-blue-500" />} label="Recents" active={false} />
                <SidebarItem icon={<Folder size={16} className="text-blue-500 fill-blue-500" />} label="Applications" path="/Applications" current={currentPath} onClick={navigate} />
                <SidebarItem icon={<Monitor size={16} className="text-blue-500" />} label="Desktop" path="/Users/guest/Desktop" current={currentPath} onClick={navigate} />
                <SidebarItem icon={<FileText size={16} className="text-blue-500" />} label="Documents" path="/Users/guest/Documents" current={currentPath} onClick={navigate} />
                <SidebarItem icon={<Download size={16} className="text-blue-500" />} label="Downloads" path="/Users/guest/Downloads" current={currentPath} onClick={navigate} />
            </SidebarGroup>
            
            <SidebarGroup title="iCloud">
                <SidebarItem icon={<Cloud size={16} className="text-blue-500" />} label="iCloud Drive" active={false} />
            </SidebarGroup>

            <SidebarGroup title="Locations">
                <SidebarItem icon={<HardDrive size={16} className="text-gray-500" />} label="Macintosh HD" path="/" current={currentPath} onClick={navigate} />
            </SidebarGroup>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white">
            {/* Breadcrumb Path Bar */}
            <div className="h-8 border-b border-[#f0f0f0] flex items-center px-4 gap-1 text-xs text-gray-500 bg-white">
                {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
                    <React.Fragment key={i}>
                        <span className={`hover:bg-gray-100 px-1 rounded cursor-pointer ${i === arr.length - 1 ? 'font-bold text-black' : ''}`}>
                            {part}
                        </span>
                        {i < arr.length - 1 && <BreadcrumbArrow size={10} className="opacity-50" />}
                    </React.Fragment>
                ))}
            </div>

            <div className="flex-1 overflow-auto p-4" onClick={() => setSelectedIds([])}>
                {viewMode === 'icon' ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
                        {files.map((file) => (
                            <div
                                key={file.path}
                                onClick={(e) => { e.stopPropagation(); handleSelect(e, file.path); }}
                                onDoubleClick={() => handleDoubleClick(file)}
                                className={`
                                    flex flex-col items-center p-2 rounded-md cursor-pointer border border-transparent
                                    ${selectedIds.includes(file.path) ? 'bg-[#dcebfd] border-[#dcebfd]' : 'hover:bg-gray-100'}
                                `}
                            >
                                <div className="mb-2 transition-transform active:scale-95">
                                    {getIcon(file)}
                                </div>
                                <span className={`text-xs text-center break-all line-clamp-2 px-1 rounded ${selectedIds.includes(file.path) ? 'bg-[#0063e1] text-white font-medium' : 'text-gray-700'}`}>
                                    {file.name}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-white sticky top-0 z-10 text-gray-500 text-xs font-medium border-b border-gray-200">
                            <tr>
                                <th className="py-1 px-4 w-1/2">Name</th>
                                <th className="py-1 px-4">Date Modified</th>
                                <th className="py-1 px-4">Size</th>
                                <th className="py-1 px-4">Kind</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file, i) => (
                                <tr
                                    key={file.path}
                                    onClick={(e) => { e.stopPropagation(); handleSelect(e, file.path); }}
                                    onDoubleClick={() => handleDoubleClick(file)}
                                    className={`
                                        cursor-pointer group
                                        ${selectedIds.includes(file.path) ? 'bg-[#0063e1] text-white' : i % 2 === 0 ? 'bg-white' : 'bg-[#f5f8fa]'}
                                    `}
                                >
                                    <td className="py-1.5 px-4 flex items-center gap-2">
                                        <div className="scale-75 origin-left">{getIcon(file)}</div>
                                        <span className="font-medium">{file.name}</span>
                                    </td>
                                    <td className={`py-1.5 px-4 ${selectedIds.includes(file.path) ? 'text-white/90' : 'text-gray-500'}`}>
                                        {format(new Date(file.modified * 1000), 'MMM d, yyyy HH:mm')}
                                    </td>
                                    <td className={`py-1.5 px-4 font-mono ${selectedIds.includes(file.path) ? 'text-white/90' : 'text-gray-500'}`}>
                                        {formatSize(file.size)}
                                    </td>
                                    <td className={`py-1.5 px-4 ${selectedIds.includes(file.path) ? 'text-white/90' : 'text-gray-500'}`}>
                                        {file.isDir ? 'Folder' : file.name.split('.').pop()?.toUpperCase() + ' File'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#f6f6f6] border-t border-[#e5e5e5] flex items-center px-4 text-xs text-gray-500 gap-4">
                <span>{files.length} items</span>
                <span>{formatSize(files.reduce((acc, f) => acc + f.size, 0))} available</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const SidebarGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4">
        <div className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</div>
        {children}
    </div>
);

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; path?: string; current?: string; onClick?: (p: string) => void }> = ({ icon, label, active, path, current, onClick }) => {
    const isSelected = active || (path && current === path);
    return (
        <div 
            onClick={() => path && onClick && onClick(path)}
            className={`
                flex items-center gap-2 px-2 py-1 mx-1 rounded-md cursor-pointer transition-colors
                ${isSelected ? 'bg-[#dcebfd]' : 'hover:bg-black/5'}
            `}
        >
            {icon}
            <span className={isSelected ? 'text-[#0063e1] font-medium' : 'text-gray-700'}>{label}</span>
        </div>
    );
};
