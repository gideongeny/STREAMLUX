import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaServer, FaClosedCaptioning, FaVolumeUp } from 'react-icons/fa';
import { MdSpeed, MdPictureInPicture, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { RiSkipForwardFill } from 'react-icons/ri';

export interface VideoSource {
    name: string;
    url: string;
    quality?: string;
    type?: 'embed' | 'direct';
}

interface AudioTrackInfo {
    id: string;
    label: string;
    language: string;
}

interface SubtitleTrack {
    src: string;
    label: string;
    language: string;
}

interface VideoPlayerProps {
    sources: VideoSource[] | string[];
    poster?: string;
    title?: string;
    onError?: () => void;
    subtitleTracks?: SubtitleTrack[];
}

const isDirectVideoUrl = (url: string): boolean => {
    const directVideoPatterns = [
        /\.(mp4|webm|ogg|m3u8|mkv)(\?.*)?$/i,
        /\/video\//i,
        /\/stream\//i,
        /\/download\//i,
        /fzmovies\.ng.*download/i,
        /netnaija\.net.*download/i,
        /o2tvseries\.com.*download/i,
    ];
    return directVideoPatterns.some((pattern) => pattern.test(url));
};

const CLEAN_SOURCES = ['vidsrc.to', 'embed.su', 'superembed.stream', '2embed.org'];
const isCleanSource = (url: string) => CLEAN_SOURCES.some((s) => url.includes(s));

const HIDE_CONTROLS_DELAY = 30000; // 30 seconds

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    sources,
    poster,
    title,
    onError,
    subtitleTracks = [],
}) => {
    const normalizedSources: VideoSource[] = sources.map((s) =>
        typeof s === 'string' ? { name: 'Default', url: s } : s
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const playerRootRef = useRef<HTMLDivElement>(null);
    const [isDirect, setIsDirect] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSourceMenu, setShowSourceMenu] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isPiP, setIsPiP] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const controlsHideTimer = useRef<NodeJS.Timeout | null>(null);

    // Audio/Subtitle state
    const [audioTracks, setAudioTracks] = useState<AudioTrackInfo[]>([]);
    const [activeAudio, setActiveAudio] = useState<string>('');
    const [showAudioMenu, setShowAudioMenu] = useState(false);
    const [activeSubtitle, setActiveSubtitle] = useState<string>('off');
    const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

    // Ad-skip overlay state
    const [showAdSkip, setShowAdSkip] = useState(false);
    const adTimerRef = useRef<NodeJS.Timeout | null>(null);

    const currentSource = normalizedSources[currentIndex];

    // ── Fullscreen controls auto-hide ──────────────────────────────
    const resetHideTimer = useCallback(() => {
        setControlsVisible(true);
        if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
        if (isFullscreen) {
            controlsHideTimer.current = setTimeout(() => {
                setControlsVisible(false);
            }, HIDE_CONTROLS_DELAY);
        }
    }, [isFullscreen]);

    useEffect(() => {
        if (isFullscreen) {
            resetHideTimer();
        } else {
            setControlsVisible(true);
            if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
        }
        return () => {
            if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
        };
    }, [isFullscreen, resetHideTimer]);

    // Track pointer/touch movement to reveal controls
    useEffect(() => {
        const handler = () => { if (isFullscreen) resetHideTimer(); };
        window.addEventListener('mousemove', handler);
        window.addEventListener('touchstart', handler);
        return () => {
            window.removeEventListener('mousemove', handler);
            window.removeEventListener('touchstart', handler);
        };
    }, [isFullscreen, resetHideTimer]);

    // ── True document-level fullscreen toggle ──────────────────────
    const handleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                // Request fullscreen on the entire page so the video covers everything
                await document.documentElement.requestFullscreen();
                // Scroll player into top so it fills the viewport
                playerRootRef.current?.scrollIntoView({ behavior: 'auto' as ScrollBehavior });
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.warn('Fullscreen error:', err);
        }
    }, []);

    // Sync fullscreen state with actual browser events
    useEffect(() => {
        const onFSChange = () => {
            const inFS = !!document.fullscreenElement;
            setIsFullscreen(inFS);
            if (!inFS) setControlsVisible(true);
        };
        document.addEventListener('fullscreenchange', onFSChange);
        return () => document.removeEventListener('fullscreenchange', onFSChange);
    }, []);

    // Escape key exits fullscreen
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                document.exitFullscreen().catch(() => { });
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isFullscreen]);

    // ── Detect direct vs embed ─────────────────────────────────────
    useEffect(() => {
        if (!currentSource) return;
        const direct = isDirectVideoUrl(currentSource.url);
        setIsDirect(direct);
        setVideoError(false);
        setIsLoading(true);

        if (!direct) {
            setShowAdSkip(false);
            if (adTimerRef.current) clearTimeout(adTimerRef.current);
            adTimerRef.current = setTimeout(() => setShowAdSkip(true), 5000);
        }

        return () => {
            if (adTimerRef.current) clearTimeout(adTimerRef.current);
        };
    }, [currentIndex, currentSource?.url]);

    useEffect(() => {
        if (normalizedSources.length > 0) {
            setCurrentIndex(0);
            setVideoError(false);
            setIsLoading(true);
            setAudioTracks([]);
            setActiveAudio('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [normalizedSources[0]?.url]);

    // ── Audio track detection ──────────────────────────────────────
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isDirect) return;
        const detectTracks = () => {
            const tracks = (video as any).audioTracks;
            if (tracks && tracks.length > 0) {
                const detected: AudioTrackInfo[] = [];
                for (let i = 0; i < tracks.length; i++) {
                    detected.push({ id: String(i), label: tracks[i].label || `Audio ${i + 1}`, language: tracks[i].language || 'unknown' });
                }
                setAudioTracks(detected);
                setActiveAudio(detected[0]?.id ?? '');
            }
        };
        video.addEventListener('loadedmetadata', detectTracks);
        return () => video.removeEventListener('loadedmetadata', detectTracks);
    }, [isDirect]);

    const handleAudioChange = (id: string) => {
        const video = videoRef.current;
        if (!video) return;
        const tracks = (video as any).audioTracks;
        if (tracks) {
            for (let i = 0; i < tracks.length; i++) tracks[i].enabled = String(i) === id;
        }
        setActiveAudio(id);
        setShowAudioMenu(false);
    };

    const handleSubtitleChange = (lang: string) => {
        const video = videoRef.current;
        if (!video) return;
        const textTracks = video.textTracks;
        for (let i = 0; i < textTracks.length; i++) {
            textTracks[i].mode = textTracks[i].language === lang ? 'showing' : 'hidden';
        }
        setActiveSubtitle(lang);
        setShowSubtitleMenu(false);
    };

    const handleVideoError = () => { setVideoError(true); setIsLoading(false); if (onError) onError(); };
    const handleVideoLoad = () => { setIsLoading(false); if (videoRef.current) videoRef.current.playbackRate = playbackRate; };
    const handleSpeedChange = (rate: number) => { setPlaybackRate(rate); if (videoRef.current) videoRef.current.playbackRate = rate; setShowSpeedMenu(false); };

    const handlePiPToggle = async () => {
        if (!videoRef.current || !document.pictureInPictureEnabled) return;
        try {
            if (isPiP) { await document.exitPictureInPicture(); setIsPiP(false); }
            else { await videoRef.current.requestPictureInPicture(); setIsPiP(true); }
        } catch (error) { console.error('PiP error:', error); }
    };

    const handleSkipAd = () => {
        setShowAdSkip(false);
        if (iframeRef.current) {
            const src = iframeRef.current.src;
            iframeRef.current.src = '';
            setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 100);
        }
    };

    const handleCleanSource = () => {
        const cleanIdx = normalizedSources.findIndex((s) => isCleanSource(s.url));
        if (cleanIdx !== -1 && cleanIdx !== currentIndex) { setCurrentIndex(cleanIdx); }
        else { setCurrentIndex((prev) => (prev + 1) % normalizedSources.length); }
        setShowAdSkip(false);
    };

    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const handlePiPChange = () => setIsPiP(document.pictureInPictureElement === video);
        video.addEventListener('enterpictureinpicture', handlePiPChange);
        video.addEventListener('leavepictureinpicture', handlePiPChange);
        return () => {
            video.removeEventListener('enterpictureinpicture', handlePiPChange);
            video.removeEventListener('leavepictureinpicture', handlePiPChange);
        };
    }, [isDirect]);

    useEffect(() => {
        const handler = () => { setShowSourceMenu(false); setShowSpeedMenu(false); setShowAudioMenu(false); setShowSubtitleMenu(false); };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    if (!currentSource) {
        return (
            <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
                <p>No video sources available.</p>
            </div>
        );
    }

    // In fullscreen: make player cover the entire screen
    const fsOverride = isFullscreen
        ? { position: 'fixed' as const, inset: 0, zIndex: 9999, background: 'black' }
        : {};

    return (
        <div
            ref={playerRootRef}
            className="player-root relative w-full h-full bg-black group overflow-hidden"
            style={fsOverride}
        >
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 pointer-events-none">
                    <AiOutlineLoading3Quarters className="animate-spin text-primary" size={48} />
                </div>
            )}

            {/* Error Overlay */}
            {videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                    <p className="text-red-400 text-lg mb-4">Playback failed for {currentSource.name}</p>
                    <div className="flex gap-4">
                        <button onClick={() => { setVideoError(false); setIsLoading(true); }} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition">Retry</button>
                        {normalizedSources.length > 1 && (
                            <button onClick={() => setCurrentIndex((prev) => (prev + 1) % normalizedSources.length)} className="px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-white transition">Try Next Source</button>
                        )}
                    </div>
                </div>
            )}

            {/* Ad-Skip Overlay */}
            {!isDirect && showAdSkip && (
                <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
                    <button onClick={handleSkipAd} className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur border border-white/20 rounded-xl text-white text-sm hover:bg-primary hover:border-primary transition shadow-lg font-bold">
                        <RiSkipForwardFill size={18} /> Skip Ad →
                    </button>
                    {normalizedSources.length > 1 && (
                        <button onClick={handleCleanSource} className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur border border-white/20 rounded-xl text-white text-sm hover:bg-green-600 transition shadow-lg text-xs">
                            🚫 Switch to Clean Source
                        </button>
                    )}
                </div>
            )}

            {/* ── FULLSCREEN BUTTON (always visible bottom-right, even on iframe) ── */}
            <div
                className="absolute bottom-3 right-3 z-50 transition-opacity duration-500"
                style={{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Immersive Fullscreen'}
                    className="flex items-center gap-1.5 px-3 py-2 bg-black/80 backdrop-blur border border-white/20 rounded-xl text-white hover:bg-primary hover:border-primary transition shadow-xl font-bold text-xs"
                >
                    {isFullscreen ? <MdFullscreenExit size={18} /> : <MdFullscreen size={18} />}
                    {isFullscreen ? 'Exit' : 'Fullscreen'}
                </button>
            </div>

            {/* Player Body */}
            {isDirect ? (
                <div className="relative w-full h-full">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        playsInline
                        poster={poster}
                        onError={handleVideoError}
                        onLoadedData={handleVideoLoad}
                        onCanPlay={handleVideoLoad}
                        src={currentSource.url}
                        crossOrigin="anonymous"
                    >
                        {subtitleTracks.map((track) => (
                            <track key={track.language} kind="subtitles" src={track.src} srcLang={track.language} label={track.label} default={track.language === 'en'} />
                        ))}
                        Your browser does not support the video tag.
                    </video>

                    {/* Premium Controls Overlay (bottom-right) */}
                    <div
                        className="absolute bottom-12 right-2 z-30 transition-opacity duration-500 flex gap-1.5 flex-wrap justify-end"
                        style={{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Audio Language */}
                        {audioTracks.length > 0 && (
                            <div className="relative">
                                <button onClick={() => setShowAudioMenu(!showAudioMenu)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur border border-white/10 rounded-lg text-white hover:bg-black/90 transition text-xs font-medium" title="Audio Language">
                                    <FaVolumeUp size={13} />
                                    <span>{audioTracks.find(t => t.id === activeAudio)?.label || 'Audio'}</span>
                                </button>
                                {showAudioMenu && (
                                    <div className="absolute bottom-full right-0 mb-1 w-36 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1">
                                        <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider font-bold">Audio</div>
                                        {audioTracks.map((track) => (
                                            <button key={track.id} onClick={() => handleAudioChange(track.id)} className={`w-full text-left px-3 py-2 text-xs transition flex items-center gap-2 ${activeAudio === track.id ? 'text-primary bg-white/5' : 'text-gray-300 hover:bg-white/5'}`}>
                                                {activeAudio === track.id && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                                                {track.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Subtitles */}
                        {subtitleTracks.length > 0 && (
                            <div className="relative">
                                <button onClick={() => setShowSubtitleMenu(!showSubtitleMenu)} className={`flex items-center gap-1.5 px-2.5 py-1.5 ${activeSubtitle !== 'off' ? 'bg-primary text-black' : 'bg-black/70 text-white'} backdrop-blur border border-white/10 rounded-lg hover:bg-primary hover:text-black transition text-xs font-medium`} title="Subtitles">
                                    <FaClosedCaptioning size={14} />
                                    <span>{activeSubtitle === 'off' ? 'Sub' : activeSubtitle.toUpperCase()}</span>
                                </button>
                                {showSubtitleMenu && (
                                    <div className="absolute bottom-full right-0 mb-1 w-40 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1">
                                        <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase font-bold">Subtitles</div>
                                        <button onClick={() => handleSubtitleChange('off')} className={`w-full text-left px-3 py-2 text-xs transition ${activeSubtitle === 'off' ? 'text-primary bg-white/5' : 'text-gray-300 hover:bg-white/5'}`}>Off</button>
                                        {subtitleTracks.map((track) => (
                                            <button key={track.language} onClick={() => handleSubtitleChange(track.language)} className={`w-full text-left px-3 py-2 text-xs transition ${activeSubtitle === track.language ? 'text-primary bg-white/5' : 'text-gray-300 hover:bg-white/5'}`}>{track.label}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quality badge */}
                        {currentSource.quality && (
                            <div className="flex items-center px-2.5 py-1.5 bg-black/70 backdrop-blur border border-white/10 rounded-lg text-white text-xs font-bold">{currentSource.quality}</div>
                        )}

                        {/* Speed Control */}
                        <div className="relative">
                            <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur border border-white/10 rounded-lg text-white hover:bg-black/90 transition text-xs font-medium" title="Playback Speed">
                                <MdSpeed size={15} />
                                <span>{playbackRate}x</span>
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-1 w-24 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                        <button key={rate} onClick={() => handleSpeedChange(rate)} className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition ${playbackRate === rate ? 'text-primary bg-white/5' : 'text-gray-300'}`}>{rate}x</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PiP */}
                        {document.pictureInPictureEnabled && (
                            <button onClick={handlePiPToggle} className="flex items-center px-2.5 py-1.5 bg-black/70 backdrop-blur border border-white/10 rounded-lg text-white hover:bg-black/90 transition" title="Picture-in-Picture">
                                <MdPictureInPicture size={15} />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                /* Iframe embed */
                <div className="relative w-full h-full">
                    <iframe
                        ref={iframeRef}
                        key={`${currentSource.url}`}
                        className="w-full h-full border-0"
                        src={currentSource.url}
                        title={title || `Video Player - ${currentSource.name}`}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        onError={handleVideoError}
                        onLoad={handleVideoLoad}
                    />
                    {/* Iframe Controls Bar */}
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-2 z-30 flex items-center justify-between transition-opacity duration-500"
                        style={{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-white text-xs font-medium bg-white/10 px-2 py-1 rounded">{currentSource.name}</span>
                            {currentSource.quality && <span className="text-white text-xs bg-primary/80 px-2 py-1 rounded font-bold">{currentSource.quality}</span>}
                        </div>
                        <div className="text-xs text-gray-400 italic">Streaming</div>
                    </div>
                </div>
            )}

            {/* Source Switcher - Top Left */}
            {normalizedSources.length > 1 && (
                <div
                    className="absolute top-3 left-3 z-30 transition-opacity duration-500"
                    style={{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative">
                        <button onClick={() => setShowSourceMenu(!showSourceMenu)} className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur border border-white/10 rounded-full text-white hover:bg-black/90 transition shadow-lg text-xs">
                            <FaServer className="text-primary" size={12} />
                            <span className="font-medium max-w-[90px] truncate">{currentSource.name}</span>
                            {currentSource.quality && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">{currentSource.quality}</span>}
                        </button>
                        {showSourceMenu && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden py-2 max-h-[300px] overflow-y-auto no-scrollbar">
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Source</div>
                                {normalizedSources.map((src, idx) => (
                                    <button key={idx} onClick={() => { setCurrentIndex(idx); setShowSourceMenu(false); }} className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/5 transition text-sm ${currentIndex === idx ? 'text-primary bg-white/5' : 'text-gray-300'}`}>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FaServer size={12} className={currentIndex === idx ? 'text-primary' : 'text-gray-500'} />
                                            <span className="truncate">{src.name}</span>
                                            {isCleanSource(src.url) && <span className="text-[9px] text-green-400 bg-green-400/10 px-1 rounded flex-shrink-0">CLEAN</span>}
                                        </div>
                                        {src.quality && <span className="text-xs bg-black/40 px-1.5 py-0.5 rounded border border-white/5 flex-shrink-0">{src.quality}</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
