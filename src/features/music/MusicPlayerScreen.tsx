import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '../../store/slice/musicSlice';
import { FiChevronDown, FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiList, FiVideo, FiAlignLeft } from 'react-icons/fi';
import UpNextQueue from './UpNextQueue';
import LyricsView from './LyricsView';

interface MusicPlayerScreenProps {
  currentTrack: Track;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  showVideo: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

const MusicPlayerScreen: React.FC<MusicPlayerScreenProps> = ({
  currentTrack, isPlaying, progress, currentTime, duration,
  volume, isMuted, queue, showVideo, onPlayPause, onNext, onPrev, onClose, onSeek, onVolumeChange, onToggleMute, onToggleVideo
}) => {
  const [activeTab, setActiveTab] = useState<'player' | 'lyrics' | 'queue'>('player');

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div 
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[2000] overflow-hidden flex flex-col font-sans"
    >
      {/* Background Layer: Only show blurred thumbnail if video is OFF */}
      <div className={`absolute inset-0 bg-black -z-20 transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`} />
      
      <AnimatePresence>
        {!showVideo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            className="absolute inset-0 -z-10 opacity-40 scale-110 pointer-events-none"
            style={{
              backgroundImage: `url(${currentTrack.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(80px) saturate(200%) brightness(0.6)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Gradient Overlay: Keeps UI readable even over bright videos */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0a0a] -z-10 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-8">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 transition-all hover:scale-105"
        >
          <FiChevronDown className="w-7 h-7 text-white" />
        </button>
        
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5">
          <button onClick={() => setActiveTab('player')} className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'player' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Playing</button>
          <button onClick={() => setActiveTab('lyrics')} className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'lyrics' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Lyrics</button>
          <button onClick={() => setActiveTab('queue')} className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'queue' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Queue</button>
        </div>

        <div className="w-12 h-12" /> {/* Spacer for centering */}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex overflow-hidden pointer-events-none">
        
        {/* Left Side: Artwork/Track Info */}
        <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-700 ${showVideo ? 'opacity-0 scale-90 translate-y-10' : 'opacity-100 scale-100 translate-y-0'}`}>
           <div className="relative pointer-events-auto">
                {/* Rotating Vinyl Disk */}
                <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] 2xl:w-[550px] 2xl:h-[550px]">
                  <motion.div 
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-full h-full rounded-full shadow-[0_0_80px_rgba(0,0,0,0.8)] border-[8px] border-black/80 overflow-hidden relative"
                  >
                    {/* Vinyl Grooves */}
                    <div className="absolute inset-0 rounded-full border-[1px] border-white/5 m-4" />
                    <div className="absolute inset-0 rounded-full border-[1px] border-white/5 m-10" />
                    <div className="absolute inset-0 rounded-full border-[1px] border-white/5 m-16" />
                    <div className="absolute inset-0 rounded-full border-[1px] border-white/5 m-24" />
                    
                    <img src={currentTrack.thumbnail} alt="Cover" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                    
                    {/* Center Label */}
                    <div className="absolute inset-0 m-auto w-1/3 h-1/3 rounded-full border-4 border-[#0a0a0a] shadow-inner overflow-hidden">
                       <img src={currentTrack.thumbnail} alt="Label" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 m-auto w-3 h-3 bg-[#0a0a0a] rounded-full border border-black/50" />
                    </div>
                  </motion.div>
                </div>
            </div>

            <div className="mt-12 text-center max-w-2xl px-6 pointer-events-auto">
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] line-clamp-2">
                {currentTrack.title}
                </h1>
                <p className="mt-3 text-lg md:text-xl font-bold text-gray-400 uppercase tracking-widest drop-shadow-lg line-clamp-1">
                {currentTrack.artist}
                </p>
            </div>
        </div>

        {/* Right Side: Tab Content (Glassmorphic) */}
        <div className={`w-[450px] pointer-events-auto bg-black/40 backdrop-blur-2xl border-l border-white/5 transition-all duration-500 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)] ${activeTab === 'player' ? 'translate-x-full hidden' : 'translate-x-0'}`}>
           {activeTab === 'queue' && <UpNextQueue queue={queue} currentTrack={currentTrack} />}
           {activeTab === 'lyrics' && <LyricsView track={currentTrack} currentTime={currentTime} />}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 pb-10 pt-6 px-10 border-t border-white/5 bg-gradient-to-t from-black to-transparent">
        
        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto flex items-center gap-6 mb-8">
          <span className="text-xs font-bold text-white drop-shadow-md tracking-widest">{formatTime(currentTime)}</span>
          <div className="flex-1 relative group cursor-pointer h-4 flex items-center">
            <div className="absolute inset-0 h-1.5 bg-white/20 rounded-full my-auto overflow-hidden shadow-inner">
               <div className="h-full bg-primary relative drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" style={{ width: `${progress}%` }} />
            </div>
            <input 
              type="range" min="0" max="100" value={progress || 0} onChange={onSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs font-bold text-white drop-shadow-md tracking-widest">{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 w-1/3">
             <button onClick={onToggleVideo} className={`p-3 rounded-full transition-all shadow-lg ${showVideo ? 'bg-primary text-white shadow-primary/50' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10'}`}>
                <FiVideo className="w-5 h-5" />
             </button>
             <button onClick={() => setActiveTab(activeTab === 'lyrics' ? 'player' : 'lyrics')} className={`p-3 rounded-full transition-all shadow-lg ${activeTab === 'lyrics' ? 'bg-primary text-white shadow-primary/50' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10'}`}>
                <FiAlignLeft className="w-5 h-5" />
             </button>
          </div>

          <div className="flex items-center justify-center gap-8 w-1/3">
            <button onClick={onPrev} className="text-white hover:text-primary drop-shadow-lg transition-all hover:-translate-x-1">
              <FiSkipBack className="w-8 h-8" />
            </button>
            <button 
              onClick={onPlayPause}
              className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <FiPause className="w-8 h-8" /> : <FiPlay className="w-8 h-8 ml-2" />}
            </button>
            <button onClick={onNext} className="text-white hover:text-primary drop-shadow-lg transition-all hover:translate-x-1">
              <FiSkipForward className="w-8 h-8" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-4 w-1/3">
             <button onClick={onToggleMute}>
                <FiVolume2 className={`w-5 h-5 drop-shadow-lg ${isMuted ? 'text-gray-400' : 'text-white'} hover:text-primary`} />
             </button>
             <input 
                type="range" min="0" max="1" step="0.01" value={volume} onChange={onVolumeChange}
                className="w-32 h-1 bg-white/20 shadow-inner rounded-full accent-white"
             />
             <button onClick={() => setActiveTab(activeTab === 'queue' ? 'player' : 'queue')} className={`p-3 ml-4 rounded-full transition-all shadow-lg ${activeTab === 'queue' ? 'bg-primary text-white shadow-primary/50' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10'}`}>
                <FiList className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MusicPlayerScreen;
