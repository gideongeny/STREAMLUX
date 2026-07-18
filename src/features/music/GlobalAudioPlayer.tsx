import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store/store';
import { togglePlay, pause, play, playNext, playPrevious, toggleExpanded, setExpanded, clearTrack } from '../../store/slice/musicSlice';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiX, FiMaximize2 } from 'react-icons/fi';
import { useYouTubeIframe } from './useYouTubeIframe';
import MusicPlayerScreen from './MusicPlayerScreen';

const GlobalAudioPlayer: React.FC = () => {
    const dispatch = useDispatch();
    const { currentTrack, isPlaying, queue, isExpanded } = useSelector((state: RootState) => state.music);
    
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showVideoGlobal, setShowVideoGlobal] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement>(null); // For Saavn tracks

    // Bulletproof YouTube Engine
    const isYouTube = currentTrack?.source === 'youtube';
    const { containerRef: ytContainerRef, playerRef: ytPlayerRef } = useYouTubeIframe(
      isYouTube ? currentTrack.id : null,
      (state) => {
        // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
        if (state === 0) {
           dispatch(playNext());
        } else if (state === 1 && !isPlaying) {
           dispatch(play());
        } else if (state === 2 && isPlaying) {
           dispatch(pause());
        }
      },
      (player) => {
         // Strict Volume Sync on Ready
         const actualVolume = isMuted ? 0 : volume;
         player.setVolume(actualVolume * 100);
         
         // Auto-play when ready if requested
         if (isPlaying) player.playVideo();
      }
    );

    // Sync Play/Pause state with respective engines
    useEffect(() => {
        if (isYouTube && ytPlayerRef.current && ytPlayerRef.current.playVideo) {
             if (isPlaying) ytPlayerRef.current.playVideo();
             else ytPlayerRef.current.pauseVideo();
        } else if (!isYouTube && audioRef.current) {
             if (isPlaying) audioRef.current.play().catch(() => dispatch(pause()));
             else audioRef.current.pause();
        }
    }, [isPlaying, isYouTube]);

    // Handle Mute/Volume
    useEffect(() => {
        const actualVolume = isMuted ? 0 : volume;
        if (isYouTube && ytPlayerRef.current && ytPlayerRef.current.setVolume) {
             ytPlayerRef.current.setVolume(actualVolume * 100);
        } else if (!isYouTube && audioRef.current) {
             audioRef.current.volume = actualVolume;
        }
    }, [volume, isMuted, isYouTube]);

    // Track Progress
    const updateProgress = useCallback(() => {
        let current = 0;
        let total = 0;

        if (isYouTube && ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
            current = ytPlayerRef.current.getCurrentTime() || 0;
            total = ytPlayerRef.current.getDuration() || 0;
        } else if (!isYouTube && audioRef.current) {
            current = audioRef.current.currentTime;
            total = audioRef.current.duration;
        }

        setCurrentTime(current);
        setDuration(total || 0);
        if (total > 0) setProgress((current / total) * 100);
    }, [isYouTube]);

    useEffect(() => {
        const interval = setInterval(updateProgress, 500);
        return () => clearInterval(interval);
    }, [updateProgress]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newProgress = Number(e.target.value);
        const newTime = (newProgress / 100) * duration;
        
        if (isYouTube && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
             ytPlayerRef.current.seekTo(newTime, true);
        } else if (!isYouTube && audioRef.current) {
             audioRef.current.currentTime = newTime;
        }
        setProgress(newProgress);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value));
        if (isMuted) setIsMuted(false);
    };

    // Format time (seconds to MM:SS)
    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!currentTrack) return null;

    return (
        <>
            {/* Indestructible Global YouTube Container */}
            <div 
                className={`fixed z-[1500] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden bg-black ${
                   isExpanded && showVideoGlobal 
                     ? 'inset-0 opacity-100 pointer-events-auto shadow-[0_0_100px_rgba(0,0,0,1)]' 
                     : 'bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none'
                }`}
            >
                <div 
                    ref={ytContainerRef} 
                    className={`w-full h-full transform origin-center transition-transform duration-1000 ease-out ${isExpanded && showVideoGlobal ? 'scale-100' : 'scale-75'}`} 
                />
            </div>

            <AnimatePresence>
                {isExpanded ? (
                    <MusicPlayerScreen 
                        key="full-screen"
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        progress={progress}
                        currentTime={currentTime}
                        duration={duration}
                        volume={volume}
                        isMuted={isMuted}
                        queue={queue}
                        showVideo={showVideoGlobal}
                        onPlayPause={() => dispatch(togglePlay())}
                        onNext={() => dispatch(playNext())}
                        onPrev={() => dispatch(playPrevious())}
                        onClose={() => dispatch(setExpanded(false))}
                        onSeek={handleSeek}
                        onVolumeChange={handleVolumeChange}
                        onToggleMute={() => setIsMuted(!isMuted)}
                        onToggleVideo={() => setShowVideoGlobal(!showVideoGlobal)}
                    />
                ) : (
                    <motion.div 
                        key="mini-player"
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 h-24 md:h-28 bg-[#0a0a0a]/90 backdrop-blur-3xl border-t border-white/5 px-6 md:px-12 flex flex-col justify-center z-[1000] shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
                    >
                        {/* Global Progress Bar */}
                        <div className="absolute top-0 left-0 right-0 group px-2 cursor-pointer">
                            <input 
                                type="range" min="0" max="100" value={progress || 0} onChange={handleSeek}
                                className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-primary group-hover:h-2 transition-all rounded-full overflow-hidden"
                                style={{ background: `linear-gradient(to right, #ef4444 ${progress}%, rgba(255,255,255,0.1) ${progress}%)` }}
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4 max-w-[1800px] mx-auto w-full">
                            {/* Track Info (Click to expand) */}
                            <div className="flex items-center gap-5 min-w-0 flex-1 lg:flex-none lg:w-[400px]">
                                <div 
                                    onClick={() => dispatch(setExpanded(true))}
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden relative shadow-2xl group cursor-pointer border border-white/10"
                                >
                                    <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FiMaximize2 className="text-white w-5 h-5" />
                                    </div>
                                </div>
                                <div className="flex flex-col min-w-0 cursor-pointer" onClick={() => dispatch(setExpanded(true))}>
                                    <motion.span 
                                        key={currentTrack.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm md:text-base font-black text-white uppercase tracking-tighter line-clamp-1 italic hover:text-primary transition-colors"
                                    >
                                        {currentTrack.title}
                                    </motion.span>
                                    <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] line-clamp-1 mt-1">
                                        {currentTrack.artist}
                                    </span>
                                </div>
                            </div>

                            {/* Main Controls */}
                            <div className="flex flex-col items-center gap-2 flex-1 max-w-[600px]">
                                <div className="flex items-center gap-8 md:gap-10">
                                    <button onClick={() => dispatch(playPrevious())} className="text-gray-500 hover:text-white transition-colors">
                                        <FiSkipBack className="w-6 h-6" />
                                    </button>
                                    
                                    <button 
                                        onClick={() => dispatch(togglePlay())}
                                        className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {isPlaying ? <FiPause className="w-7 h-7 z-10" /> : <FiPlay className="w-7 h-7 ml-1 z-10" />}
                                    </button>

                                    <button onClick={() => dispatch(playNext())} className="text-gray-500 hover:text-white transition-colors">
                                        <FiSkipForward className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-gray-600 tracking-widest uppercase">
                                    <span>{formatTime(currentTime)}</span>
                                    <div className="w-1 h-1 rounded-full bg-gray-800" />
                                    <span>{formatTime(duration)}</span>
                                    {isYouTube && <span className="ml-4 text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 text-[8px]">YT ENGINE</span>}
                                </div>
                            </div>

                            {/* Volume & Extra */}
                            <div className="hidden lg:flex items-center justify-end gap-6 flex-1 lg:w-[400px]">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsMuted(!isMuted)}>
                                        <FiVolume2 className={`w-5 h-5 ${isMuted ? 'text-gray-600' : 'text-gray-400'} hover:text-white transition-colors`} />
                                    </button>
                                    <input 
                                        type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange}
                                        className="w-24 h-1 bg-white/10 appearance-none rounded-full accent-white"
                                    />
                                </div>
                                <button 
                                    onClick={() => dispatch(clearTrack())}
                                    className="bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 p-3 rounded-2xl transition-all border border-white/5 group"
                                    title="Close player"
                                >
                                     <FiX className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Native Audio Fallback for Saavn */}
            {!isYouTube && (
                <audio 
                    ref={audioRef} 
                    src={currentTrack.streamUrl} 
                    onEnded={() => dispatch(playNext())} 
                />
            )}
        </>
    );
};

export default GlobalAudioPlayer;
