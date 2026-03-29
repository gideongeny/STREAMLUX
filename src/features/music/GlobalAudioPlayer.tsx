import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store/store';
import { togglePlay, pause, play } from '../../store/slice/musicSlice';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiX, FiMusic } from 'react-icons/fi';

const GlobalAudioPlayer: React.FC = () => {
    const dispatch = useDispatch();
    const { currentTrack, isPlaying } = useSelector((state: RootState) => state.music);
    const [progress, setProgress] = useState(0);
    const playerRef = useRef<any>(null);

    // YouTube IFrame API Integration
    useEffect(() => {
        if (!currentTrack) return;

        // Load YouTube API if not already present
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const onPlayerReady = (event: any) => {
            if (isPlaying) event.target.playVideo();
        };

        const onPlayerStateChange = (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
                // Handle end of track (e.g., play next in queue)
            }
        };

        const initializePlayer = () => {
             playerRef.current = new (window as any).YT.Player('youtube-audio-bridge', {
                height: '0',
                width: '0',
                videoId: currentTrack.id,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                    modestbranding: 1
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange
                }
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

        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                const current = playerRef.current.getCurrentTime();
                const total = playerRef.current.getDuration();
                if (total > 0) setProgress((current / total) * 100);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentTrack]);

    useEffect(() => {
        if (!playerRef.current || !playerRef.current.playVideo) return;
        if (isPlaying) playerRef.current.playVideo();
        else playerRef.current.pauseVideo();
    }, [isPlaying]);

    if (!currentTrack) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] h-20 bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 flex items-center justify-between z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
            >
                {/* Visualizer/Art */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden relative shadow-lg">
                        <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">

                            <FiMusic className="text-white w-4 h-4 animate-pulse" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tracking-tighter line-clamp-1 w-32 md:w-48 italic">
                            {currentTrack.title}
                        </span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1">
                            {currentTrack.artist}
                        </span>
                    </div>
                </div>

                {/* Progress Mini Bar (Mobile) */}
                <div className="absolute top-0 left-8 right-8 h-[2px] bg-white/5 overflow-hidden rounded-full">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary"
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button className="hidden md:block text-gray-500 hover:text-white transition-colors">
                        <FiSkipBack className="w-5 h-5" />
                    </button>
                    
                    <button 
                        onClick={() => dispatch(togglePlay())}
                        className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                        {isPlaying ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6 ml-1" />}
                    </button>

                    <button className="hidden md:block text-gray-500 hover:text-white transition-colors">
                        <FiSkipForward className="w-5 h-5" />
                    </button>

                    <button className="md:hidden text-gray-500">
                         <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Hidden Bridge */}
                <div id="youtube-audio-bridge" className="absolute opacity-0 pointer-events-none w-0 h-0" />
            </motion.div>
        </AnimatePresence>
    );
};

export default GlobalAudioPlayer;
