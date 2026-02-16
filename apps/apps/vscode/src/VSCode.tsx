import React, { useState, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { KernelAPI } from '@macos/darwin-api';

interface VSCodeProps {
  filePath?: string;
}

export const VSCode: React.FC<VSCodeProps> = ({ filePath }) => {
  const [code, setCode] = useState('// Select a file to edit');
  const [language, setLanguage] = useState('javascript');
  const monaco = useMonaco();
  const kernel = KernelAPI.getInstance();

  useEffect(() => {
    if (filePath) {
      loadFile(filePath);
      detectLanguage(filePath);
    }
  }, [filePath]);

  const loadFile = async (path: string) => {
    try {
      const content = await kernel.readFile(path);
      setCode(content);
    } catch (e) {
      setCode(`// Error loading file: ${path}`);
    }
  };

  const detectLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': setLanguage('typescript'); break;
      case 'js': case 'jsx': setLanguage('javascript'); break;
      case 'html': setLanguage('html'); break;
      case 'css': setLanguage('css'); break;
      case 'json': setLanguage('json'); break;
      case 'md': setLanguage('markdown'); break;
      case 'rs': setLanguage('rust'); break;
      case 'py': setLanguage('python'); break;
      default: setLanguage('plaintext');
    }
  };

  const handleSave = async (value: string | undefined) => {
    if (filePath && value !== undefined) {
      await kernel.writeFile(filePath, value);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white">
      <div className="h-8 bg-[#252526] flex items-center px-4 text-xs select-none border-b border-[#3e3e3e]">
        <span className="opacity-80">{filePath || 'Untitled'}</span>
        <span className="ml-auto opacity-50">{language}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={handleSave}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
      <div className="h-6 bg-[#007acc] flex items-center px-2 text-xs text-white select-none">
        <span>Ready</span>
        <span className="ml-auto">Ln 1, Col 1</span>
        <span className="ml-4">UTF-8</span>
        <span className="ml-4">{language}</span>
      </div>
    </div>
  );
};
