import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { KernelAPI } from '@macos/darwin-api';
import '@xterm/xterm/css/xterm.css';

const PROMPT_START = '\x1b[1;32mguest@macbook\x1b[0m:\x1b[1;34m';
const PROMPT_END = '\x1b[0m$ ';

export const TerminalApp: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [cwd, setCwd] = useState('/Users/guest');
  const [inputBuffer, setInputBuffer] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const kernel = KernelAPI.getInstance();

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.2,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#cccccc',
        selectionBackground: '#264f78',
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
    prompt(term, cwd);

    term.onKey(({ key, domEvent }) => {
      const char = domEvent.key;

      if (char === 'Enter') {
        term.write('\r\n');
        handleCommand(inputBuffer.trim());
        setInputBuffer('');
        setCursorPos(0);
        setHistoryIndex(-1);
      } else if (char === 'Backspace') {
        if (cursorPos > 0) {
          const left = inputBuffer.slice(0, cursorPos - 1);
          const right = inputBuffer.slice(cursorPos);
          setInputBuffer(left + right);
          setCursorPos(cursorPos - 1);
          // Redraw line
          term.write('\b \b'); // visual hack for end of line
          if (right.length > 0) {
             // For mid-line edit, we need a full redraw logic, keeping simple for now
             term.write('\x1b[2K\r'); // Clear line
             prompt(term, cwd);
             term.write(left + right);
             const moveBack = right.length;
             if(moveBack > 0) term.write(`\x1b[${moveBack}D`);
          }
        }
      } else if (char === 'ArrowLeft') {
        if (cursorPos > 0) {
          term.write('\x1b[D');
          setCursorPos(cursorPos - 1);
        }
      } else if (char === 'ArrowRight') {
        if (cursorPos < inputBuffer.length) {
          term.write('\x1b[C');
          setCursorPos(cursorPos + 1);
        }
      } else if (char === 'ArrowUp') {
        if (history.length > 0) {
            const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            const cmd = history[newIndex];
            setInputBuffer(cmd);
            setCursorPos(cmd.length);
            term.write('\x1b[2K\r');
            prompt(term, cwd);
            term.write(cmd);
        }
      } else if (char === 'ArrowDown') {
        if (historyIndex !== -1) {
            const newIndex = historyIndex + 1;
            if (newIndex >= history.length) {
                setHistoryIndex(-1);
                setInputBuffer('');
                setCursorPos(0);
                term.write('\x1b[2K\r');
                prompt(term, cwd);
            } else {
                setHistoryIndex(newIndex);
                const cmd = history[newIndex];
                setInputBuffer(cmd);
                setCursorPos(cmd.length);
                term.write('\x1b[2K\r');
                prompt(term, cwd);
                term.write(cmd);
            }
        }
      } else if (char === 'Tab') {
        domEvent.preventDefault();
        handleTabCompletion();
      } else if (char.length === 1 && !domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
        // Insert character at cursor position
        const left = inputBuffer.slice(0, cursorPos);
        const right = inputBuffer.slice(cursorPos);
        setInputBuffer(left + key + right);
        setCursorPos(cursorPos + 1);
        term.write(key + right);
        if (right.length > 0) term.write(`\x1b[${right.length}D`); // Move cursor back
      } else if (domEvent.ctrlKey && key === 'l') {
          term.clear();
          prompt(term, cwd);
          setInputBuffer('');
          setCursorPos(0);
      } else if (domEvent.ctrlKey && key === 'c') {
          term.write('^C\r\n');
          prompt(term, cwd);
          setInputBuffer('');
          setCursorPos(0);
      }
    });

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(terminalRef.current);

    return () => {
      term.dispose();
      resizeObserver.disconnect();
    };
  }, [cwd, inputBuffer, cursorPos, history, historyIndex]); // Dependencies for closure

  // Keep refs updated for async callbacks
  const cwdRef = useRef(cwd);
  useEffect(() => { cwdRef.current = cwd; }, [cwd]);

  const prompt = (term: XTerm, currentCwd: string) => {
    // Simplify path for prompt
    let displayPath = currentCwd;
    if (displayPath.startsWith('/Users/guest')) {
        displayPath = displayPath.replace('/Users/guest', '~');
    }
    term.write(`${PROMPT_START}${displayPath}${PROMPT_END}`);
  };

  const resolvePath = (path: string) => {
    if (!path) return cwdRef.current;
    if (path.startsWith('/')) return path;
    
    // Handle relative paths
    const parts = cwdRef.current.split('/').filter(Boolean);
    const newParts = path.split('/').filter(Boolean);
    
    for (const part of newParts) {
        if (part === '.') continue;
        if (part === '..') {
            parts.pop();
        } else {
            parts.push(part);
        }
    }
    return '/' + parts.join('/');
  };

  const handleCommand = async (cmdLine: string) => {
    const term = xtermRef.current!;
    if (!cmdLine) {
      prompt(term, cwdRef.current);
      return;
    }

    setHistory((prev) => [...prev, cmdLine]);
    
    // Simple parser that handles quotes
    const args: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < cmdLine.length; i++) {
        const char = cmdLine[i];
        if (char === '"' || char === "'") {
            inQuote = !inQuote;
        } else if (char === ' ' && !inQuote) {
            if (current) args.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    if (current) args.push(current);

    const cmd = args[0];
    const params = args.slice(1);

    try {
      switch (cmd) {
        case 'clear':
          term.clear();
          break;
        case 'pwd':
          term.writeln(cwdRef.current);
          break;
        case 'ls':
          await listDirectory(params[0] || cwdRef.current);
          break;
        case 'cd':
          await changeDirectory(params[0]);
          break;
        case 'cat':
          await catFile(params[0]);
          break;
        case 'touch':
          await touchFile(params[0]);
          break;
        case 'mkdir':
          await makeDirectory(params[0]);
          break;
        case 'rm':
          term.writeln('rm: permission denied (just kidding, not implemented yet)');
          break;
        case 'echo':
          term.writeln(params.join(' '));
          break;
        case 'whoami':
          term.writeln('guest');
          break;
        case 'uname':
          const sys = await kernel.getSystemInfo();
          term.writeln(`${sys.name} ${sys.version} ${sys.build} (wasm)`);
          break;
        case 'help':
          term.writeln('Available commands: ls, cd, pwd, cat, touch, mkdir, echo, clear, uname, whoami');
          break;
        default:
          term.writeln(`bash: ${cmd}: command not found`);
      }
    } catch (e: any) {
      term.writeln(`Error: ${e.message}`);
    }

    // Update prompt with *latest* CWD (it might have changed)
    prompt(term, cwdRef.current);
  };

  const handleTabCompletion = async () => {
      // Basic implementation for current directory
      // In a real shell this is very complex
      const term = xtermRef.current!;
      const parts = inputBuffer.split(' ');
      const lastPart = parts[parts.length - 1];
      
      if (!lastPart) return;

      try {
          const files = await kernel.readdir(cwdRef.current);
          const matches = files.filter((f: any) => f.name.startsWith(lastPart));
          
          if (matches.length === 1) {
              const completion = matches[0].name.slice(lastPart.length);
              term.write(completion);
              setInputBuffer(prev => prev + completion);
              setCursorPos(prev => prev + completion.length);
          } else if (matches.length > 1) {
              term.write('\r\n');
              matches.forEach((m: any) => term.write(m.name + '  '));
              term.write('\r\n');
              prompt(term, cwdRef.current);
              term.write(inputBuffer);
          }
      } catch (e) {}
  };

  const listDirectory = async (path: string) => {
    const term = xtermRef.current!;
    const targetPath = resolvePath(path);
    try {
        const entries = await kernel.readdir(targetPath);
        // Sort: Directories first, then files
        entries.sort((a: any, b: any) => {
            if (a.isDir && !b.isDir) return -1;
            if (!a.isDir && b.isDir) return 1;
            return a.name.localeCompare(b.name);
        });

        entries.forEach((entry: any) => {
            let name = entry.name;
            if (entry.isDir) {
                name = `\x1b[1;34m${name}/\x1b[0m`;
            } else if (name.endsWith('.sh')) {
                name = `\x1b[1;32m${name}\x1b[0m`;
            }
            term.write(name + '  ');
        });
        term.write('\r\n');
    } catch (e: any) {
        term.writeln(`ls: ${path}: No such file or directory`);
    }
  };

  const changeDirectory = async (path: string = '/Users/guest') => {
      const targetPath = resolvePath(path);
      try {
          // Verify it exists (readdir throws if not found)
          await kernel.readdir(targetPath);
          setCwd(targetPath);
          // Prompt will be updated by handleCommand loop
      } catch (e) {
          xtermRef.current!.writeln(`cd: ${path}: No such file or directory`);
      }
  };

  const catFile = async (path: string) => {
      const term = xtermRef.current!;
      if (!path) return term.writeln('usage: cat <file>');
      const targetPath = resolvePath(path);
      try {
          const content = await kernel.readFile(targetPath);
          term.writeln(content);
      } catch (e) {
          term.writeln(`cat: ${path}: No such file or directory`);
      }
  };

  const touchFile = async (path: string) => {
      if (!path) return;
      const targetPath = resolvePath(path);
      try {
          await kernel.writeFile(targetPath, '');
      } catch (e) {
          xtermRef.current!.writeln(`touch: cannot touch '${path}': Permission denied`);
      }
  };

  const makeDirectory = async (path: string) => {
      if (!path) return;
      const targetPath = resolvePath(path);
      try {
          await kernel.mkdir(targetPath);
      } catch (e) {
          xtermRef.current!.writeln(`mkdir: cannot create '${path}': File exists`);
      }
  };

  return <div ref={terminalRef} className="h-full w-full bg-[#1e1e1e]" />;
};
