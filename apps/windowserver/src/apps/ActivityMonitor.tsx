import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, HardDrive, Wifi, MemoryStick } from 'lucide-react';

interface Process {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  mem: number;
  threads: number;
}

const MOCK_PROCESSES = [
  { name: 'kernel_task', user: 'root' },
  { name: 'WindowServer', user: '_windowserver' },
  { name: 'Finder', user: 'guest' },
  { name: 'Dock', user: 'guest' },
  { name: 'Google Chrome', user: 'guest' },
  { name: 'Google Chrome Helper', user: 'guest' },
  { name: 'VS Code', user: 'guest' },
  { name: 'Terminal', user: 'guest' },
  { name: 'mdworker', user: '_spotlight' },
  { name: 'syslogd', user: 'root' },
  { name: 'launchd', user: 'root' },
  { name: 'UserEventAgent', user: 'guest' },
];

export const ActivityMonitor: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activeTab, setActiveTab] = useState('cpu');

  // Simulate real-time data
  useEffect(() => {
    const generateData = () => {
      const now = new Date().toLocaleTimeString();
      return {
        name: now,
        system: Math.floor(Math.random() * 15) + 5,
        user: Math.floor(Math.random() * 30) + 10,
      };
    };

    // Init data
    setData(Array(20).fill(0).map(generateData));

    // Init processes
    setProcesses(MOCK_PROCESSES.map((p, i) => ({
      pid: 100 + i,
      name: p.name,
      user: p.user,
      cpu: 0,
      mem: 0,
      threads: Math.floor(Math.random() * 10) + 1
    })));

    const interval = setInterval(() => {
      setData(prev => [...prev.slice(1), generateData()]);
      
      setProcesses(prev => prev.map(p => ({
        ...p,
        cpu: Math.random() * (p.name === 'kernel_task' ? 5 : 20),
        mem: Math.random() * 500
      })).sort((a, b) => b.cpu - a.cpu));

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalCPU = data.length > 0 ? (data[data.length - 1].system + data[data.length - 1].user) : 0;

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 font-sans text-xs">
      {/* Toolbar */}
      <div className="h-14 bg-[#f3f3f3] border-b border-gray-300 flex items-center px-4 gap-4">
        <div className="flex bg-[#e3e3e3] p-0.5 rounded-md">
            <TabButton icon={<Cpu size={14} />} label="CPU" active={activeTab === 'cpu'} onClick={() => setActiveTab('cpu')} />
            <TabButton icon={<MemoryStick size={14} />} label="Memory" active={activeTab === 'mem'} onClick={() => setActiveTab('mem')} />
            <TabButton icon={<HardDrive size={14} />} label="Disk" active={activeTab === 'disk'} onClick={() => setActiveTab('disk')} />
            <TabButton icon={<Wifi size={14} />} label="Network" active={activeTab === 'net'} onClick={() => setActiveTab('net')} />
        </div>
        
        <div className="flex-1" />
        
        <div className="bg-white border border-gray-300 px-3 py-1 rounded-md shadow-sm">
            <span className="text-gray-500 mr-2">Search</span>
            <input className="outline-none w-32" />
        </div>
      </div>

      {/* Graphs */}
      <div className="h-32 bg-[#1e1e1e] p-2 flex gap-2 border-b border-gray-800">
        <div className="flex-1 relative">
            <div className="absolute top-2 left-2 text-white font-medium z-10 flex flex-col">
                <span>CPU Load</span>
                <span className="text-2xl font-light">{totalCPU}%</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#007aff" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#007aff" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Area type="monotone" dataKey="user" stackId="1" stroke="#007aff" fill="url(#colorCpu)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="system" stackId="1" stroke="#ff3b30" fill="#ff3b30" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
        <div className="w-48 bg-[#252526] rounded p-2 text-gray-300 space-y-1">
            <div className="flex justify-between"><span>System:</span><span className="text-red-400">{data[data.length-1]?.system}%</span></div>
            <div className="flex justify-between"><span>User:</span><span className="text-blue-400">{data[data.length-1]?.user}%</span></div>
            <div className="flex justify-between"><span>Idle:</span><span className="text-green-400">{100 - totalCPU}%</span></div>
            <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="flex justify-between"><span>Threads:</span><span>{processes.reduce((acc, p) => acc + p.threads, 0)}</span></div>
                <div className="flex justify-between"><span>Processes:</span><span>{processes.length}</span></div>
            </div>
        </div>
      </div>

      {/* Process Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr>
                    <Th width="40%">Process Name</Th>
                    <Th width="10%">% CPU</Th>
                    <Th width="10%">CPU Time</Th>
                    <Th width="10%">Threads</Th>
                    <Th width="15%">Memory</Th>
                    <Th width="15%">User</Th>
                    <Th width="10%">PID</Th>
                </tr>
            </thead>
            <tbody>
                {processes.map((p, i) => (
                    <tr key={p.pid} className={`hover:bg-blue-500 hover:text-white group ${i % 2 === 0 ? 'bg-white' : 'bg-[#f5f8fa]'}`}>
                        <td className="py-1 px-2 border-b border-gray-100 flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center text-[8px] text-gray-600 group-hover:text-blue-500">
                                <Activity size={10} />
                            </div>
                            <span className="font-medium">{p.name}</span>
                        </td>
                        <td className="py-1 px-2 border-b border-gray-100 font-mono">{p.cpu.toFixed(1)}</td>
                        <td className="py-1 px-2 border-b border-gray-100 font-mono">0:{(Math.random() * 60).toFixed(2)}</td>
                        <td className="py-1 px-2 border-b border-gray-100">{p.threads}</td>
                        <td className="py-1 px-2 border-b border-gray-100 font-mono">{p.mem.toFixed(1)} MB</td>
                        <td className="py-1 px-2 border-b border-gray-100">{p.user}</td>
                        <td className="py-1 px-2 border-b border-gray-100 text-gray-500 group-hover:text-blue-100">{p.pid}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-all
            ${active ? 'bg-white shadow-sm text-black' : 'text-gray-600 hover:bg-black/5'}
        `}
    >
        {icon}
        {label}
    </button>
);

const Th: React.FC<{ children: React.ReactNode; width?: string }> = ({ children, width }) => (
    <th className="py-1 px-2 font-medium text-gray-500 border-b border-gray-300 text-[11px]" style={{ width }}>
        {children}
    </th>
);
