import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music as MusicIcon } from 'lucide-react';

export const Music: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const tracks = [
    { title: 'Synthwave Dreams', artist: 'Neon Horizon', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3', cover: '#ff0055' },
    { title: 'Cyber City', artist: 'Glitch Mob', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Elips.mp3', cover: '#00ccff' },
    { title: 'Night Drive', artist: 'Retrowave', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3', cover: '#cc00ff' },
  ];
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#2c2c2e] to-[#1c1c1e] text-white">
      {/* Sidebar / Playlist */}
      <div className="flex-1 flex">
        <div className="w-48 bg-[#1c1c1e] border-r border-[#3a3a3c] p-4 hidden md:block">
          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Library</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 rounded-md bg-[#2c2c2e] text-red-500">
              <MusicIcon size={16} />
              <span className="text-white text-sm">Songs</span>
            </div>
            {/* Mock items */}
            <div className="p-2 text-sm text-gray-400">Artists</div>
            <div className="p-2 text-sm text-gray-400">Albums</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          <div
            className="w-48 h-48 rounded-lg shadow-2xl mb-6 flex items-center justify-center text-4xl font-bold text-white transition-all duration-500"
            style={{ backgroundColor: currentTrack.cover, boxShadow: `0 20px 50px -10px ${currentTrack.cover}66` }}
          >
            🎵
          </div>
          <h2 className="text-2xl font-bold mb-1">{currentTrack.title}</h2>
          <p className="text-gray-400 mb-8">{currentTrack.artist}</p>

          {/* Progress Bar */}
          <div className="w-full max-w-md flex items-center gap-3 text-xs text-gray-400 mb-6">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8">
            <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors">
              <SkipBack size={24} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors">
              <SkipForward size={24} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />
    </div>
  );
};
