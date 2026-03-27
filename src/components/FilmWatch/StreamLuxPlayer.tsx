import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaServer, FaClosedCaptioning, FaVolumeUp } from 'react-icons/fa';
import { MdSpeed, MdPictureInPicture, MdFullscreen, MdFullscreenExit, MdMovieFilter } from 'react-icons/md';
import { RiSkipForwardFill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { vibeService } from '../../services/vibe';
import { hapticImpact } from '../../shared/utils';
import { FiVolume2, FiSun, FiChevronsRight, FiChevronsLeft, FiXCircle, FiMessageSquare } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleCinemaMode } from '../../store/slice/uiSlice';
import AmbiFlowGlow from './AmbiFlowGlow';
import VisionCastOverlay from './VisionCastOverlay';
import { resolverService } from '../../services/resolver';
import { HiSparkles } from 'react-icons/hi';
import { safeStorage } from '../../utils/safeStorage';
import { backgroundAudioService } from '../../services/backgroundAudio';
import { setFullscreen } from '../../store/slice/uiSlice';
import { useTranslation } from 'react-i18next';
import LiveBuzz from './LiveBuzz';
import SubtitleSelector from './SubtitleSelector';
import { useSearchParams } from 'react-router-dom';
import { downloadService } from '../../services/download';

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
    id?: number | string;
    mediaType?: "movie" | "tv";
    startAt?: number;
    releaseYear?: string;
    seasonId?: number;
    episodeId?: number;
    selectedSourceIndex?: number;
    onSourceIndexChange?: (index: number) => void;
    externalSubtitle?: any | null;
}

const getSetting = (key: string, defaultValue: boolean): boolean => {
    const val = safeStorage.get(key);
    if (val === null) return defaultValue;
    return val === "true";
};

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

const CLEAN_SOURCES = ['vidlink.pro', 'vidsrc.me', 'vidsrc.to', 'embed.su', 'superembed.stream', '2embed.org'];
const isCleanSource = (url: string) => CLEAN_SOURCES.some((s) => url.includes(s));

const HIDE_CONTROLS_DELAY = 5000; // 5 seconds — fast fade so users can use embedded video controls

const StreamLuxPlayer: React.FC<VideoPlayerProps> = ({
    sources,
    poster,
    title,
    onError,
    subtitleTracks = [],
    id,
    mediaType,
    startAt = 0,
    releaseYear,
    seasonId,
    episodeId,
    selectedSourceIndex,
    onSourceIndexChange,
    externalSubtitle,
}) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { isCinemaMode } = useAppSelector((state) => state.ui);
    const [searchParams] = useSearchParams();

    const normalizedSources: VideoSource[] = sources.map((s) =>
        typeof s === 'string' ? { name: 'Default', url: s } : s
    );

    const [currentIndex, setCurrentIndex] = useState(selectedSourceIndex ?? 0);

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
    const [showClickShield, setShowClickShield] = useState(true);
    const controlsHideTimer = useRef<NodeJS.Timeout | null>(null);
    const [audioTracks, setAudioTracks] = useState<AudioTrackInfo[]>([]);
    const [activeAudio, setActiveAudio] = useState<string>('');
    const [showAudioMenu, setShowAudioMenu] = useState(false);
    const [activeSubtitle, setActiveSubtitle] = useState<string>('off');
    const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
    const [selectedSubtitle, setSelectedSubtitle] = useState<any>(null);
    const [showAdSkip, setShowAdSkip] = useState(false);
    const [showVisionCast, setShowVisionCast] = useState(false);
    const [showMagicMenu, setShowMagicMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [showLockHint, setShowLockHint] = useState(false);
    const lockTimerRef = useRef<NodeJS.Timeout | null>(null);
    const adTimerRef = useRef<NodeJS.Timeout | null>(null);
    const bufferCheckTimer = useRef<NodeJS.Timeout | null>(null);
    const retryCount = useRef(0);
    const [indicator, setIndicator] = useState<{ type: 'volume' | 'brightness' | 'seek', value: string | number, icon: any } | null>(null);
    const indicatorTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastTapTime = useRef<number>(0);
    const swipeStart = useRef<{ x: number, y: number } | null>(null);

    // Sync with external selectedSourceIndex prop
    useEffect(() => {
        if (selectedSourceIndex !== undefined) {
            setCurrentIndex(selectedSourceIndex);
        }
    }, [selectedSourceIndex]);

    // Apply external subtitle from the FilmWatch external bar to the HTML5 video element
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isDirect) return;

        const existing = video.querySelectorAll('track[data-external="true"]');
        existing.forEach(el => el.remove());

        if (!externalSubtitle) {
            for (let i = 0; i < video.textTracks.length; i++) {
                video.textTracks[i].mode = 'hidden';
            }
            return;
        }

        const applySubtitle = async () => {
            try {
                const { resolveSubtitleUrl } = await import('../../services/subtitles');
                const url = await resolveSubtitleUrl(externalSubtitle);
                if (!url) return;

                const track = document.createElement('track');
                track.kind = 'subtitles';
                track.label = externalSubtitle.language;
                track.srclang = externalSubtitle.lang || 'en';
                track.src = url;
                track.default = true;
                track.setAttribute('data-external', 'true');
                video.appendChild(track);

                setTimeout(() => {
                    for (let i = 0; i < video.textTracks.length; i++) {
                        video.textTracks[i].mode =
                            video.textTracks[i].label === externalSubtitle.language
                                ? 'showing' : 'hidden';
                    }
                }, 300);
            } catch (err) {
                console.warn('[SubtitleApply] Failed to apply external subtitle:', err);
            }
        };

        applySubtitle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [externalSubtitle, isDirect]);

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
            dispatch(setFullscreen(true));
        } else {
            setControlsVisible(true);
            dispatch(setFullscreen(false));
            if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
        }
        return () => {
            if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
            dispatch(setFullscreen(false));
        };
    }, [isFullscreen, resetHideTimer, dispatch]);

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
        const doc = document as any;
        const playerRoot = playerRootRef.current;
        const video = videoRef.current;

        try {
            if (!isFullscreen) {
                // Try standard API first
                if (doc.documentElement.requestFullscreen) {
                    await doc.documentElement.requestFullscreen();
                } else if (doc.documentElement.webkitRequestFullscreen) {
                    await doc.documentElement.webkitRequestFullscreen();
                } else if (video && (video as any).webkitEnterFullscreen) {
                    // For iPhone native player take-over (standard behavior)
                    (video as any).webkitEnterFullscreen();
                    return; // The browser handles FS now
                }

                // If no native FS or to ensure custom controls stay visible (Pseudo-Fullscreen fallback)
                // We ALWAYS set this state to trigger the fixed layout in fsOverride
                setIsFullscreen(true);
                if (playerRoot) {
                    playerRoot.scrollIntoView({ behavior: 'auto' as ScrollBehavior });
                }
            } else {
                if (doc.exitFullscreen) {
                    await doc.exitFullscreen();
                } else if (doc.webkitExitFullscreen) {
                    await doc.webkitExitFullscreen();
                }
                setIsFullscreen(false);
            }
        } catch (err) {
            console.warn('Fullscreen handling fallback triggered:', err);
            // Even if native FS fails/is rejected, we enable our Pseudo-Fullscreen for World Class UX
            setIsFullscreen(!isFullscreen);
        }
    }, [isFullscreen]);

    // Sync fullscreen state with actual browser events
    useEffect(() => {
        const onFSChange = () => {
            const doc = document as any;
            const inFS = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
            setIsFullscreen(inFS);
            if (!inFS) setControlsVisible(true);
        };
        document.addEventListener('fullscreenchange', onFSChange);
        document.addEventListener('webkitfullscreenchange', onFSChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFSChange);
            document.removeEventListener('webkitfullscreenchange', onFSChange);
        };
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
            setShowClickShield(!isCleanSource(currentSource.url)); // Smart Click-Shield
            if (adTimerRef.current) clearTimeout(adTimerRef.current);
            adTimerRef.current = setTimeout(() => setShowAdSkip(true), 5000);
        }

        // Handle Background Audio Initialization
        if (direct && videoRef.current && getSetting('background_audio_enabled', false)) {
            backgroundAudioService.initialize(videoRef.current);
            backgroundAudioService.enableBackgroundPlayback();
            if (title) {
                backgroundAudioService.updateMetadata({ title });
            }
        }

        // Handle Resume Anywhere for direct videos
        if (direct && videoRef.current && startAt > 0) {
            const handleMetadata = () => {
                if (videoRef.current && videoRef.current.duration > startAt) {
                    videoRef.current.currentTime = startAt;
                    videoRef.current.removeEventListener('loadedmetadata', handleMetadata);
                }
            };
            videoRef.current.addEventListener('loadedmetadata', handleMetadata);
            // Fallback if metadata already loaded
            if (videoRef.current.readyState >= 1) {
                 handleMetadata();
            }
        }

        return () => {
            if (adTimerRef.current) clearTimeout(adTimerRef.current);
        };
    }, [currentIndex, currentSource?.url, title, startAt]);

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

    const handleVideoError = () => { 
        setVideoError(true); 
        setIsLoading(false); 
        if (currentSource?.name) resolverService.reportPlaybackFailure(currentSource.name);
        if (onError) onError(); 
    };
    
    const handleVideoLoad = () => { 
        setIsLoading(false); 
        setAutoplayBlocked(false);
        retryCount.current = 0;
        if (bufferCheckTimer.current) clearTimeout(bufferCheckTimer.current);

        if (currentSource?.name) resolverService.reportPlaybackSuccess(currentSource.name);
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate; 
            // Attempt autoplay and catch block
            videoRef.current.play().catch((err) => {
                if (err.name === "NotAllowedError" || err.name === "AbortError") {
                    setAutoplayBlocked(true);
                }
            });
        }
    };

    const handleBuffering = () => {
        setIsLoading(true);
        if (bufferCheckTimer.current) clearTimeout(bufferCheckTimer.current);
        
        // If buffering for more than 7 seconds, try another source
        bufferCheckTimer.current = setTimeout(() => {
            if (isLoading && retryCount.current < 3) {
                toast.warning(t("Optimizing connection for slow internet..."), { position: "top-center" });
                retryCount.current++;
                setCurrentIndex((prev) => (prev + 1) % normalizedSources.length);
            }
        }, 7000);
    };
    const handleSpeedChange = (rate: number) => { setPlaybackRate(rate); if (videoRef.current) videoRef.current.playbackRate = rate; setShowSpeedMenu(false); };

    const handlePiPToggle = async () => {
        if (!videoRef.current || !document.pictureInPictureEnabled) return;
        try {
            if (document.pictureInPictureElement) { 
                await document.exitPictureInPicture(); 
            } else { 
                await videoRef.current.requestPictureInPicture(); 
            }
        } catch (error) { 
            console.error('PiP error:', error); 
        }
    };

    const handleToggleLock = () => {
        setIsLocked(!isLocked);
        if (!isLocked) {
            setControlsVisible(false);
            toast.info(t("Controls Locked"), { position: "top-center", autoClose: 1000 });
        } else {
            setControlsVisible(true);
            toast.success(t("Controls Unlocked"), { position: "top-center", autoClose: 1000 });
        }
        hapticImpact();
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

    const handleDownloadCurrentSource = async () => {
        if (!currentSource) return;
        hapticImpact();
        
        const s = searchParams.get('s');
        const e = searchParams.get('e');
        const sNum = s ? Number(s) : undefined;
        const eNum = e ? Number(e) : undefined;
        
        // Import Capacitor dynamically if not at top of file
        const { Capacitor } = await import('@capacitor/core');

        if (Capacitor.isNativePlatform()) {
            toast.info(t('Added to Offline Downloads'), { position: "top-center" });
            try {
                const { offlineDownloadService } = await import('../../services/offlineDownload');
                await offlineDownloadService.addToQueue({
                    id: String(id || Date.now()),
                    title: title || "Unknown Title",
                    type: (mediaType as 'movie' | 'tv') || 'movie',
                    thumbnail: poster || "https://images.unsplash.com/photo-1485846234645-a62644f84728",
                    url: currentSource.url,
                    quality: currentSource.quality as any || '720p',
                    size: 0, // Capacitor calculates this
                    seasonNumber: sNum,
                    episodeNumber: eNum
                });
            } catch (err) {
                console.error("Native download failed:", err);
                toast.error(t('Failed to queue download'));
            }
        } else {
            toast.info(t('Starting Elite Download...'), { position: "top-center" });
            downloadService.downloadSource(
                id || "unknown",
                title || "Unknown Title", 
                currentSource.url, 
                (mediaType as 'movie' | 'tv') || 'movie', 
                sNum,
                eNum
            );
        }
    };

    const showIndicator = (type: 'volume' | 'brightness' | 'seek', value: string | number, icon: any) => {
        setIndicator({ type, value, icon });
        if (indicatorTimerRef.current) clearTimeout(indicatorTimerRef.current);
        indicatorTimerRef.current = setTimeout(() => setIndicator(null), 1000);
    };

    const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
        const now = Date.now();
        const video = videoRef.current;
        if (!video || !isDirect) return;

        if (now - lastTapTime.current < 300) {
            const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
            const rect = playerRootRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = clientX - rect.left;
            const isRightSide = x > rect.width / 2;

            if (isRightSide) {
                video.currentTime += 10;
                showIndicator('seek', '+10s', <FiChevronsRight />);
            } else {
                video.currentTime -= 10;
                showIndicator('seek', '-10s', <FiChevronsLeft />);
            }
            hapticImpact();
        }
        lastTapTime.current = now;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        if (!controlsVisible) resetHideTimer();
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!swipeStart.current || !isDirect || !videoRef.current) return;
        const deltaY = swipeStart.current.y - e.touches[0].clientY;
        const rect = playerRootRef.current?.getBoundingClientRect();
        if (!rect) return;

        const isLeftSide = swipeStart.current.x < rect.width / 2;

        if (Math.abs(deltaY) > 20) {
            if (isLeftSide) {
                showIndicator('brightness', `${Math.min(100, Math.max(0, 50 + Math.round(deltaY / 2)))}%`, <FiSun />);
            } else {
                const currentVol = videoRef.current.volume;
                const newVol = Math.min(1, Math.max(0, currentVol + (deltaY / 200)));
                videoRef.current.volume = newVol;
                showIndicator('volume', `${Math.round(newVol * 100)}%`, <FiVolume2 />);
            }
        }
    };

    const handleTouchEnd = () => {
        swipeStart.current = null;
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
        const handler = () => {
            setShowSourceMenu(false);
            setShowSpeedMenu(false);
            setShowAudioMenu(false);
            setShowSubtitleMenu(false);
            setShowMagicMenu(false);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const getAutoplayUrl = (url: string) => {
        // Elite Experience: Always enable autoplay for embedded sources
        if (url.includes('?')) return `${url}&autoplay=1`;
        return `${url}?autoplay=1`;
    };

    if (!currentSource) {
        return (
            <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
                <p>No video sources available.</p>
            </div>
        );
    }

    const fsOverride = isFullscreen
        ? { position: 'fixed' as const, inset: 0, zIndex: 9999, background: 'black' }
        : {};

    return (
        <div
            ref={playerRootRef}
            className="player-root relative w-full h-full bg-black group overflow-hidden"
            style={fsOverride}
            onMouseMove={() => !controlsVisible && resetHideTimer()}
            onTouchStart={() => !controlsVisible && resetHideTimer()}
        >
            {/* AmbiFlowGlow disabled by default for better performance on TV/Low-end devices */}
            {/* <AmbiFlowGlow videoRef={videoRef} poster={poster} isActive={isCinemaMode || isFullscreen} /> */}

            {/* Playback Lock Overlay */}
            <AnimatePresence>
                {isLocked && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[200] flex items-center justify-center bg-black/5"
                        onClick={() => {
                            setShowLockHint(true);
                            if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
                            lockTimerRef.current = setTimeout(() => setShowLockHint(false), 2000);
                        }}
                    >
                        {showLockHint && (
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={(e) => { e.stopPropagation(); handleToggleLock(); }}
                                className="p-6 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <MdFullscreenExit size={32} className="text-primary rotate-45" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('Unlock Controls')}</span>
                                </div>
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Indicator Overlay */}
            <AnimatePresence>
                {indicator && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="tw-absolute-center z-[100] flex flex-col items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl"
                    >
                        <div className="text-primary text-4xl">{indicator.icon}</div>
                        <span className="text-white font-bold text-xl">{indicator.value}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 pointer-events-none">
                    <AiOutlineLoading3Quarters className="animate-spin text-primary" size={48} />
                </div>
            )}

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


            {isDirect ? (
                <div className="relative w-full h-full z-10">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay={true} // Hard-coded for "Elite" experience
                        playsInline
                        webkit-playsinline="true"
                        muted={false} 
                        poster={poster}
                        onError={handleVideoError}
                        onLoadedData={(e) => {
                            handleVideoLoad();
                            // Aggressive Autoplay attempt
                            try { e.currentTarget.play().catch(() => {}); } catch {}
                        }}
                        onCanPlay={(e) => {
                            handleVideoLoad();
                            try { e.currentTarget.play().catch(() => {}); } catch {}
                        }}
                        onWaiting={handleBuffering}
                        onStalled={handleBuffering}
                        onPlaying={() => { setIsLoading(false); setAutoplayBlocked(false); if (bufferCheckTimer.current) clearTimeout(bufferCheckTimer.current); }}
                        src={currentSource.url}
                        crossOrigin="anonymous"
                        onClick={handleDoubleTap}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {subtitleTracks.map((track) => (
                            <track key={track.language} kind="subtitles" src={track.src} srcLang={track.language} label={track.label} default={track.language === 'en'} />
                        ))}
                    </video>

                    {/* Autoplay Policy Fallback Overlay */}
                    <AnimatePresence>
                        {autoplayBlocked && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center cursor-pointer group/overlay"
                                onClick={() => {
                                    videoRef.current?.play();
                                    setAutoplayBlocked(false);
                                    hapticImpact();
                                }}
                            >
                                <div className="text-center">
                                    <motion.div 
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="w-20 h-20 rounded-full bg-primary/20 border border-primary flex items-center justify-center mb-4 mx-auto group-hover/overlay:bg-primary group-hover/overlay:text-black transition-all"
                                    >
                                        <RiSkipForwardFill size={40} className="ml-1" />
                                    </motion.div>
                                    <p className="text-white font-black uppercase tracking-[0.2em] text-sm">{t('Tap to Start Cinema')}</p>
                                    <p className="text-gray-400 text-[10px] mt-2 tracking-widest uppercase">{title}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div
                        className="absolute bottom-12 right-2 z-30 transition-opacity duration-500 flex gap-1.5 flex-wrap justify-end"
                        style={{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {audioTracks.length > 0 && (
                            <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setShowAudioMenu(!showAudioMenu); }} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur border border-white/10 rounded-lg text-white hover:bg-black/90 transition text-xs font-medium">
                                    <FaVolumeUp size={13} />
                                    <span>{audioTracks.find(t => t.id === activeAudio)?.label || 'Audio'}</span>
                                </button>
                                <AnimatePresence>
                                    {showAudioMenu && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="absolute bottom-full right-0 mb-3 w-48 bg-[#0a0a1a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-3 z-[100]"
                                        >
                                            <div className="px-4 pb-2 text-[10px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-2 border-b border-white/5 mb-2">
                                                <FaVolumeUp className="text-primary" /> {t('Audio Tracks')}
                                            </div>
                                            {audioTracks.map((track) => (
                                                <button 
                                                    key={track.id} 
                                                    onClick={() => handleAudioChange(track.id)} 
                                                    className={`w-full text-left px-4 py-3 text-xs transition-all flex items-center justify-between ${activeAudio === track.id ? 'text-primary bg-primary/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                                                >
                                                    {track.label}
                                                    {activeAudio === track.id && <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,255,255,0.5)]" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}


                    </div>
                </div>
            ) : (
                <div className="relative w-full h-full z-10">
                    <iframe
                        ref={iframeRef}
                        key={`${currentSource.url}`}
                        className="w-full h-full border-0"
                        src={getAutoplayUrl(currentSource.url)}
                        title={title || `Video Player`}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        referrerPolicy="origin"
                        onError={handleVideoError}
                        onLoad={handleVideoLoad}
                    />

                    {/* Click-Shield Overlay for Embeds */}
                    {showClickShield && !isLoading && (
                        <div
                            className="absolute inset-0 z-50 bg-transparent cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowClickShield(false);
                                toast.info("Ad blocked! Enjoy your stream.", { position: "top-center", autoClose: 2000 });
                            }}
                        />
                    )}

                </div>
            )}



            <VisionCastOverlay
                mediaId={id || ""}
                mediaType={mediaType || "movie"}
                isOpen={showVisionCast}
                onClose={() => setShowVisionCast(false)}
            />

            {/* Elite Feature: Social Collective (LiveBuzz) */}
            {id && mediaType && (
                <LiveBuzz 
                    mediaId={id} 
                    mediaType={mediaType} 
                    isVisible={showReactions && controlsVisible && !isPiP} 
                />
            )}
        </div>
    );
};

export default StreamLuxPlayer;
