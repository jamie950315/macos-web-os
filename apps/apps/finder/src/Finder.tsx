import React, { useEffect, useState } from 'react';
import { useWindowManager } from '@macos/windowserver/store';
import { KernelAPI } from '@macos/darwin-api';

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'icon' | 'list'>('icon');

  const kernel = KernelAPI.getInstance();

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    try {
      const entries = await kernel.readdir(path);
      setFiles(entries);
    } catch (err) {
      console.error('Failed to read directory:', err);
    }
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.isDir) {
      setCurrentPath(item.path);
    } else {
      // 如果是檔案，開啟對應的應用程式
      openFileWithDefaultApp(item);
    }
  };

  const openFileWithDefaultApp = (item: FileItem) => {
    const ext = item.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt':
      case 'md':
        const { useWindowManager } = require('@macos/windowserver/store');
        const { TextEdit } = require('@macos/apps/textedit');
        useWindowManager.getState().createWindow(
          'com.apple.textedit',
          item.name,
          <TextEdit filePath={item.path} />
        );
        break;
      case 'pdf':
        // 使用 Preview 開啟
        break;
      default:
        alert(`無法開啟檔案：${item.name}`);
    }
  };

  const navigateUp = () => {
    const parent = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parent);
  };

  return (
    <div className="h-full flex flex-col bg-[#f6f6f6]">
      {/* 工具列 */}
      <div className="h-12 bg-[#e8e6e8] border-b border-gray-300 flex items-center px-4 gap-3">
        <div className="flex gap-1">
          <button
            onClick={navigateUp}
            className="p-1.5 rounded bg-white/50 hover:bg-white shadow-sm border border-gray-300/50"
          >
            ←
          </button>
          <button className="p-1.5 rounded bg-white/50 hover:bg-white shadow-sm border border-gray-300/50">
            →
          </button>
        </div>

        <div className="flex-1 flex items-center bg-[#dcdcde] rounded-md px-3 py-1.5 text-sm">
          <span className="text-gray-500 text-xs mr-2">⌘</span>
          <span className="text-gray-700 font-medium">{currentPath}</span>
        </div>

        <div className="flex bg-[#dcdcde] rounded-md p-0.5">
          <button
            onClick={() => setViewMode('icon')}
            className={`p-1.5 rounded ${viewMode === 'icon' ? 'bg-white shadow-sm' : ''}`}
          >
            ▦
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'icon' ? (
          <div className="grid grid-cols-auto-fill-100 gap-4">
            {files.map((file) => (
              <div
                key={file.path}
                onClick={() => setSelectedId(file.path)}
                onDoubleClick={() => handleDoubleClick(file)}
                className={`
                  flex flex-col items-center p-3 rounded-lg cursor-pointer
                  ${selectedId === file.path ? 'bg-[#0063e1] text-white' : 'hover:bg-black/5'}
                `}
              >
                <div className={`
                  w-16 h-16 mb-2 flex items-center justify-center text-3xl
                  ${file.isDir ? 'text-blue-400' : 'text-gray-400'}
                  ${selectedId === file.path ? 'brightness-200' : ''}
                `}>
                  {file.isDir ? '📁' : '📄'}
                </div>
                <span className="text-xs text-center break-all line-clamp-2">
                  {file.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-2 font-normal pl-2">名稱</th>
                <th className="pb-2 font-normal">修改日期</th>
                <th className="pb-2 font-normal">大小</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr
                  key={file.path}
                  onClick={() => setSelectedId(file.path)}
                  onDoubleClick={() => handleDoubleClick(file)}
                  className={`
                    cursor-pointer border-b border-gray-100
                    ${selectedId === file.path ? 'bg-[#0063e1] text-white' : 'hover:bg-gray-100'}
                  `}
                >
                  <td className="py-1.5 pl-2 flex items-center gap-2">
                    <span>{file.isDir ? '📁' : '📄'}</span>
                    {file.name}
                  </td>
                  <td className="py-1.5 text-gray-500">
                    {new Date(file.modified * 1000).toLocaleDateString()}
                  </td>
                  <td className="py-1.5 text-gray-500">
                    {file.isDir ? '--' : `${(file.size / 1024).toFixed(1)} KB`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 狀態列 */}
      <div className="h-6 bg-[#f0f0f0] border-t border-gray-300 text-xs flex items-center px-4 text-gray-500">
        {files.length} 個項目
      </div>
    </div>
  );
};
