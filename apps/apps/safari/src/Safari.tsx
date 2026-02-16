import React, { useState } from 'react';
import { RefreshCcw, ArrowLeft, ArrowRight } from 'lucide-react';

export const Safari: React.FC = () => {
  const [url, setUrl] = useState('https://openclaw.ai');
  const [currentUrl, setCurrentUrl] = useState('https://openclaw.ai');
  const [loading, setLoading] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith('http')) {
      setCurrentUrl(`https://${url}`);
    } else {
      setCurrentUrl(url);
    }
    setLoading(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f6f6]">
      {/* Toolbar */}
      <div className="h-10 bg-[#e8e6e8] border-b border-gray-300 flex items-center px-4 gap-2">
        <button className="p-1 rounded hover:bg-black/10 text-gray-600 disabled:opacity-50">
          <ArrowLeft size={16} />
        </button>
        <button className="p-1 rounded hover:bg-black/10 text-gray-600 disabled:opacity-50">
          <ArrowRight size={16} />
        </button>
        <button onClick={() => setCurrentUrl(currentUrl)} className="p-1 rounded hover:bg-black/10 text-gray-600">
          <RefreshCcw size={14} />
        </button>

        <form onSubmit={handleNavigate} className="flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full h-7 px-3 rounded-md bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Search or enter website name"
          />
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        <iframe
          src={currentUrl}
          className="w-full h-full border-none"
          title="Safari Content"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
};
