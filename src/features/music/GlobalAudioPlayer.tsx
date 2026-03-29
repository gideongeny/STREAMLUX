import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store/store';
import { togglePlay, pause, play } from '../../store/slice/musicSlice';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiX, FiMusic, FiSettings, FiMaximize2 } from 'react-icons/fi';

const GlobalAudioPlayer: React.FC = () => {
    const dispatch = useDispatch();
    const { currentTrack, isPlaying } = useSelector((state: RootState) => state.music);
    
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    
    const playerRef = useRef<any>(null); // YouTube Player
    const audioRef = useRef<HTMLAudioElement>(null); // Direct Audio

    const isDirectStream = !!currentTrack?.streamUrl && currentTrack.source === 'saavn';

    // --- SHARED LOGIC ---
    const updateProgress = useCallback(() => {
        if (isDirectStream && audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setCurrentTime(current);
            setDuration(total);
            if (total > 0) setProgress((current / total) * 100);
        } else if (playerRef.current && playerRef.current.getCurrentTime) {
            const current = playerRef.current.getCurrentTime();
            const total = playerRef.current.getDuration();
            setCurrentTime(current);
            setDuration(total);
            if (total > 0) setProgress((current / total) * 100);
        }
    }, [isDirectStream]);

    // Format time (seconds to MM:SS)
    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- DIRECT STREAM ENGINE ---
    useEffect(() => {
        if (!isDirectStream || !audioRef.current || !currentTrack) return;
        
        audioRef.current.src = currentTrack.streamUrl!;
        if (isPlaying) {
            audioRef.current.play().catch(() => dispatch(pause()));
        }

        const interval = setInterval(updateProgress, 500);
        return () => {
            clearInterval(interval);
            if (audioRef.current) audioRef.current.pause();
        };
    }, [currentTrack?.id, isDirectStream]);

    useEffect(() => {
        if (!isDirectStream || !audioRef.current) return;
        if (isPlaying) audioRef.current.play();
        else audioRef.current.pause();
    }, [isPlaying, isDirectStream]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // --- YOUTUBE ENGINE ---
    useEffect(() => {
        if (isDirectStream || !currentTrack) return;

        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const onPlayerReady = (event: any) => {
            if (isPlaying) event.target.playVideo();
            event.target.setVolume(volume * 100);
        };

        const initializePlayer = () => {
             playerRef.current = new (window as any).YT.Player('youtube-audio-bridge', {
                height: '0',
                width: '0',
                videoId: currentTrack.id,
                playerVars: { autoplay: 1, controls: 0, showinfo: 0, rel: 0, modestbranding: 1 },
                events: { onReady: onPlayerReady }
            });
        };

        if ((window as any).YT && (window as any).YT.Player) {
            if (playerRef.current && playerRef.current.loadVideoById) {
                playerRef.current.loadVideoById(currentTrack.id);
            } else {
                initializePlayer();
            }
        } else {
            (window as any).onYouTubeIframeAPIReady = initializePlayer;
        }

        const interval = setInterval(updateProgress, 1000);
        return () => clearInterval(interval);
    }, [currentTrack?.id, isDirectStream]);

    useEffect(() => {
        if (isDirectStream || !playerRef.current || !playerRef.current.playVideo) return;
        if (isPlaying) playerRef.current.playVideo();
        else playerRef.current.pauseVideo();
    }, [isPlaying, isDirectStream]);

    if (!currentTrack) return null;

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newProgress = Number(e.target.value);
        const newTime = (newProgress / 100) * duration;
        if (isDirectStream && audioRef.current) {
            audioRef.current.currentTime = newTime;
        } else if (playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(newTime);
        }
        setProgress(newProgress);
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 h-24 md:h-28 bg-[#0a0a0a]/90 backdrop-blur-3xl border-t border-white/5 px-6 md:px-12 flex flex-col justify-center z-[1000] shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
            >
                {/* Global Progress Bar */}
                <div className="absolute top-0 left-0 right-0 group px-2 cursor-pointer">
                    <input 
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleProgressChange}
                        className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-primary group-hover:h-2 transition-all rounded-full overflow-hidden"
                        style={{
                            background: `linear-gradient(to right, #ef4444 ${progress}%, rgba(255,255,255,0.1) ${progress}%)`
                        }}
                    />
                </div>

                <div className="flex items-center justify-between gap-4 max-w-[1800px] mx-auto w-full">
                    {/* Track Info */}
                    <div className="flex items-center gap-5 min-w-0 flex-1 lg:flex-none lg:w-[400px]">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden relative shadow-2xl group cursor-pointer border border-white/10">
                            <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <FiMaximize2 className="text-white w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <motion.span 
                                key={currentTrack.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm md:text-base font-black text-white uppercase tracking-tighter line-clamp-1 italic"
                            >
                                {currentTrack.title}
                            </motion.span>
                            <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] line-clamp-1 mt-1">
                                {currentTrack.artist} • {currentTrack.album || 'Single'}
                            </span>
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex flex-col items-center gap-2 flex-1 max-w-[600px]">
                        <div className="flex items-center gap-8 md:gap-10">
                            <button className="text-gray-500 hover:text-white transition-colors">
                                <FiSkipBack className="w-6 h-6" />
                            </button>
                            
                            <button 
                                onClick={() => dispatch(togglePlay())}
                                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {isPlaying ? <FiPause className="w-7 h-7 z-10" /> : <FiPlay className="w-7 h-7 ml-1 z-10" />}
                            </button>

                            <button className="text-gray-500 hover:text-white transition-colors">
                                <FiSkipForward className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-gray-600 tracking-widest uppercase">
                            <span>{formatTime(currentTime)}</span>
                            <div className="w-1 h-1 rounded-full bg-gray-800" />
                            <span>{formatTime(duration)}</span>
                            {isDirectStream && (
                                <span className="ml-4 text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 text-[8px]">HQ Lossless</span>
                            )}
                        </div>
                    </div>

                    {/* Volume & Extra */}
                    <div className="hidden lg:flex items-center justify-end gap-6 flex-1 lg:w-[400px]">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsMuted(!isMuted)}>
                                <FiVolume2 className={`w-5 h-5 ${isMuted ? 'text-gray-600' : 'text-gray-400'} hover:text-white transition-colors`} />
                            </button>
                            <input 
                                type="range"
                                min="0" max="1" step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-24 h-1 bg-white/10 appearance-none rounded-full accent-white"
                            />
                        </div>
                        <button className="text-gray-500 hover:text-white transition-colors">
                            <FiSettings className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => dispatch(pause())}
                            className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all border border-white/5"
                        >
                             <FiX className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Hidden Audio Core */}
                <audio ref={audioRef} onEnded={() => dispatch(pause())} />
                <div id="youtube-audio-bridge" className="absolute opacity-0 pointer-events-none w-0 h-0" />
            </motion.div>
        </AnimatePresence>
    );
};

export default GlobalAudioPlayer;
