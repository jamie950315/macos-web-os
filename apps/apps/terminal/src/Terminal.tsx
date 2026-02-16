import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { KernelAPI } from '@macos/darwin-api';
import '@xterm/xterm/css/xterm.css';

const PROMPT = '\x1b[1;32mguest@macbook\x1b[0m:\x1b[1;34m~\x1b[0m$ ';

export const TerminalApp: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [cwd, setCwd] = useState('/Users/guest');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputBuffer, setInputBuffer] = useState('');

  const kernel = KernelAPI.getInstance();

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#cccccc',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;32mWelcome to macOS Web Terminal\x1b[0m');
    term.writeln('Type "help" for a list of commands.');
    term.write(PROMPT);

    term.onKey(({ key, domEvent }) => {
      const char = domEvent.key;

      if (char === 'Enter') {
        term.write('\r\n');
        handleCommand(inputBuffer.trim());
        setInputBuffer('');
      } else if (char === 'Backspace') {
        if (inputBuffer.length > 0) {
          term.write('\b \b');
          setInputBuffer(inputBuffer.slice(0, -1));
        }
      } else if (char === 'ArrowUp') {
        // Simple history implementation
        if (history.length > 0) {
           // history implementation details omitted for brevity
        }
      } else if (char.length === 1 && !domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
        term.write(key);
        setInputBuffer((prev) => prev + key);
      }
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(terminalRef.current);

    return () => {
      term.dispose();
      resizeObserver.disconnect();
    };
  }, []);

  const handleCommand = async (cmdLine: string) => {
    const term = xtermRef.current;
    if (!term) return;

    if (!cmdLine) {
      term.write(PROMPT);
      return;
    }

    setHistory((prev) => [...prev, cmdLine]);
    const [cmd, ...args] = cmdLine.split(' ');

    try {
      switch (cmd) {
        case 'clear':
          term.clear();
          break;
        case 'pwd':
          term.writeln(cwd);
          break;
        case 'ls':
          await listDirectory(args[0] || cwd);
          break;
        case 'cd':
          await changeDirectory(args[0]);
          break;
        case 'cat':
          await catFile(args[0]);
          break;
        case 'echo':
          term.writeln(args.join(' '));
          break;
        case 'mkdir':
          await makeDirectory(args[0]);
          break;
        case 'help':
          term.writeln('Available commands: ls, cd, pwd, cat, echo, mkdir, clear, help, uname, whoami, uptime');
          break;
        case 'uname':
            const info = await kernel.getSystemInfo();
            term.writeln(`${info.name} ${info.version} ${info.build}`);
            break;
        case 'whoami':
            term.writeln('guest');
            break;
        case 'uptime':
            const uptime = await kernel.getSystemInfo().then((i: any) => i.uptime);
            term.writeln(`up ${formatUptime(uptime)}`);
            break;
        default:
          term.writeln(`bash: ${cmd}: command not found`);
      }
    } catch (e: any) {
      term.writeln(`Error: ${e.message}`);
    }

    term.write(PROMPT);
  };

  const resolvePath = (path: string) => {
    if (path.startsWith('/')) return path;
    if (path === '..') {
        const parts = cwd.split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/');
    }
    if (path === '.') return cwd;
    return cwd === '/' ? `/${path}` : `${cwd}/${path}`;
  };

  const listDirectory = async (path: string) => {
    const term = xtermRef.current!;
    const targetPath = resolvePath(path);
    try {
        const entries = await kernel.readdir(targetPath);
        entries.forEach((entry: any) => {
            const color = entry.isDir ? '\x1b[1;34m' : '';
            const reset = '\x1b[0m';
            term.writeln(`${color}${entry.name}${reset}`);
        });
    } catch (e: any) {
        term.writeln(`ls: ${path}: No such file or directory`);
    }
  };

  const changeDirectory = async (path: string = '/Users/guest') => {
      const term = xtermRef.current!;
      const targetPath = resolvePath(path);
      try {
          // Verify it exists and is a directory
          await kernel.readdir(targetPath); // Will throw if not dir or not exists (simple check)
          setCwd(targetPath);
      } catch (e) {
          term.writeln(`cd: ${path}: No such file or directory`);
      }
  };

  const catFile = async (path: string) => {
      const term = xtermRef.current!;
      if (!path) {
          term.writeln('usage: cat <file>');
          return;
      }
      const targetPath = resolvePath(path);
      try {
          const content = await kernel.readFile(targetPath);
          term.writeln(content);
      } catch (e) {
          term.writeln(`cat: ${path}: No such file or directory`);
      }
  };

  const makeDirectory = async (path: string) => {
      const term = xtermRef.current!;
      if (!path) {
          term.writeln('usage: mkdir <directory>');
          return;
      }
      const targetPath = resolvePath(path);
      try {
          await kernel.mkdir(targetPath);
      } catch (e) {
          term.writeln(`mkdir: cannot create directory '${path}': File exists`);
      }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return <div ref={terminalRef} className="h-full w-full bg-[#1e1e1e]" />;
};
