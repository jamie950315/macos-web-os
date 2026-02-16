import React, { useState, useEffect } from 'react';
import { KernelAPI } from '@macos/darwin-api';

interface TextEditProps {
  filePath?: string;
}

export const TextEdit: React.FC<TextEditProps> = ({ filePath }) => {
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const kernel = KernelAPI.getInstance();

  useEffect(() => {
    if (filePath) {
      loadFile(filePath);
    }
  }, [filePath]);

  const loadFile = async (path: string) => {
    try {
      const data = await kernel.readFile(path);
      setContent(data);
      setIsDirty(false);
    } catch (e) {
      console.error('Failed to load file:', e);
    }
  };

  const handleSave = async () => {
    if (!filePath) {
      // Create a default file if none specified
      const defaultPath = `/Users/guest/Documents/Untitled-${Date.now()}.txt`;
      await kernel.writeFile(defaultPath, content);
      // In a real app, we'd update the window title and file path prop here
      alert(`Saved to ${defaultPath}`);
    } else {
      await kernel.writeFile(filePath, content);
    }
    setIsDirty(false);
  };

  return (
    <div className="flex flex-col h-full bg-white text-black font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`px-3 py-1 text-sm rounded ${
              isDirty
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Save
          </button>
          <span className="text-sm text-gray-500">
            {filePath || 'Untitled'} {isDirty ? '●' : ''}
          </span>
        </div>
      </div>
      <textarea
        className="flex-1 w-full p-4 resize-none outline-none text-base leading-relaxed"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsDirty(true);
        }}
        spellCheck={false}
      />
    </div>
  );
};
