import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import { SportMatch } from './types';
import SportsSidebar from './SportsSidebar';
import { streamEngine } from './services/streamEngine';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { useCurrentViewportView } from '../../hooks/useCurrentViewportView';

const SportsWatchPage: React.FC = () => {
    const { matchId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const searchParams = new URLSearchParams(location.search);
    const hasMatchParams = searchParams.has('home') && searchParams.has('away');
    
    const [liveMatches, setLiveMatches] = useState<SportMatch[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<SportMatch[]>([]);
    const [currentMatch, setCurrentMatch] = useState<SportMatch | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [availableSources, setAvailableSources] = useState<any[]>([]);
    const [activeSource, setActiveSource] = useState<any>(null);
    const [showSourceSelector, setShowSourceSelector] = useState(false);
    
    // Anti-Hijack: Prevent iframe ads from redirecting the main StreamLux window
    useEffect(() => {
        if (activeSource?.type === 'iframe') {
            const preventHijack = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? This might be an ad redirect.';
                return e.returnValue;
            };
            window.addEventListener('beforeunload', preventHijack);
            return () => window.removeEventListener('beforeunload', preventHijack);
        }
    }, [activeSource]);
    
    const [retryCount, setRetryCount] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [playbackError, setPlaybackError] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const failoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = useCallback(() => {
        const el = playerContainerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen().catch(console.warn);
        } else {
            document.exitFullscreen().catch(console.warn);
        }
    }, []);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // Handle match/player state resets on matchId change
    useEffect(() => {
        setAvailableSources([]);
        setActiveSource(null);
        setRetryCount(0);
        setPlaybackError(false);
        setIsBuffering(true);

        const initMatch = async () => {
            if (!matchId) return;
            try {
                const { getWatchFootyMatchById, watchfootyToSportMatch } = await import(
                    '../../services/watchfootyAPI'
                );
                const fresh = await getWatchFootyMatchById(matchId);
                if (fresh) {
                    setCurrentMatch(watchfootyToSportMatch(fresh) as SportMatch);
                }
            } catch (err) {
                console.error("Error initializing match:", err);
            }
        };

        initMatch();
    }, [matchId]);

    // Periodic sidebar data refresh (every 5 minutes)
    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const { getWatchFootyFixtures, watchfootyToSportMatch } = await import(
                    '../../services/watchfootyAPI'
                );
                const fixtures = await getWatchFootyFixtures();
                const all = fixtures.map((f) => watchfootyToSportMatch(f) as SportMatch);
                setLiveMatches(all.filter((m) => m.isLive));
                setUpcomingMatches(all.filter((m) => !m.isLive && m.status !== 'finished'));

                // Also update currentMatch if it exists in the fetched list (to update live score/minute)
                if (matchId) {
                    const found = all.find((m) => m.id === matchId);
                    if (found) {
                        setCurrentMatch(prev => {
                            // Only update if score, status, or minute changed to avoid re-triggering resolution
                            if (!prev || prev.homeScore !== found.homeScore || prev.awayScore !== found.awayScore || prev.minute !== found.minute || prev.status !== found.status) {
                                return found;
                            }
                            return prev;
                        });
                    }
                }
            } catch (err) {
                console.error("Error refreshing sidebar data:", err);
            }
        };

        fetchSidebarData();
        const interval = setInterval(fetchSidebarData, 300000); // 5 minutes
        return () => clearInterval(interval);
    }, [matchId]);

    // NEW: Resolve Sources via StreamEngine (NTV, SS99, WatchFooty)
    useEffect(() => {
        const resolveAllSources = async () => {
            const queryParams = new URLSearchParams(location.search);
            const home = queryParams.get("home") || "";
            const away = queryParams.get("away") || "";
            const sport = queryParams.get("sport") || "soccer";

            let matchObj = currentMatch || location.state?.matchData;
            if (!matchObj && home && away) {
                matchObj = {
                    id: matchId || `manual-${home}-${away}`,
                    homeTeam: home,
                    awayTeam: away,
                    sport: sport,
                    isLive: true,
                    status: 'live',
                    leagueName: 'Live Sports'
                } as any;
            }

            if (matchObj && !matchObj.streamUrl) {
                const stateStreamUrl = location.state?.streamUrl || location.state?.matchData?.link || location.state?.matchData?.streamUrl;
                if (stateStreamUrl) {
                    matchObj = { ...matchObj, streamUrl: stateStreamUrl };
                }
            }

            if (matchObj) {
                setIsBuffering(true);
                const resolved = await streamEngine.resolveSources(matchObj, (newSources) => {
                    setAvailableSources(newSources);
                    // Automatically auto-switch to the newly resolved bypass stream if it appears!
                    if (newSources.length > 0) {
                        setActiveSource(newSources[0]);
                    }
                });
                setAvailableSources(resolved);
                if (resolved.length > 0 && !activeSource) {
                    setActiveSource(resolved[0]);
                }
                setIsBuffering(false);
            }
        };

        resolveAllSources();
    }, [currentMatch?.id, location.search, matchId, location.state]);

    // Auto-Failover Logic
    const handleFailover = useCallback(() => {
        if (!activeSource || availableSources.length <= 1) return;
        
        const currentIndex = availableSources.findIndex(s => s.url === activeSource.url);
        const nextIndex = (currentIndex + 1) % availableSources.length;
        
        if (nextIndex !== currentIndex) {
            console.log(`[StreamEngine] Failover triggered: switching from ${activeSource.name} to ${availableSources[nextIndex].name}`);
            setActiveSource(availableSources[nextIndex]);
            setRetryCount(prev => prev + 1);
            setPlaybackError(false);
            setIsBuffering(false);
        }
    }, [activeSource, availableSources]);

    // HLS Support effect with error detection
    useEffect(() => {
        let hls: Hls | null = null;
        setPlaybackError(false);
        setIsBuffering(true);
        
        if (activeSource?.type === 'hls' && videoRef.current) {
            const video = videoRef.current;
            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hls.loadSource(activeSource.url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsBuffering(false);
                    video.play().catch(e => console.warn("Autoplay blocked:", e));
                });
                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (data.fatal) {
                        console.error("[HLS] Fatal error:", data);
                        handleFailover();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = activeSource.url;
                video.onloadedmetadata = () => {
                    setIsBuffering(false);
                    video.play().catch(() => {});
                };
                video.onerror = () => handleFailover();
            }
        } else {
            setIsBuffering(false);
        }
        
        return () => {
            if (hls) hls.destroy();
        };
    }, [activeSource, handleFailover]);

    // Buffering & Death detection for Iframe/HTML5
    useEffect(() => {
        if (failoverTimeoutRef.current) clearTimeout(failoverTimeoutRef.current);
        
        if (isBuffering && !playbackError) {
            failoverTimeoutRef.current = setTimeout(() => {
                if (isBuffering) {
                    console.log("[StreamEngine] Stale buffer detected, switching...");
                    handleFailover();
                }
            }, 10000); // 10s threshold
        }

        return () => {
            if (failoverTimeoutRef.current) clearTimeout(failoverTimeoutRef.current);
        };
    }, [isBuffering, playbackError, handleFailover]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const { isMobile } = useCurrentViewportView();
    const sidebarWidth = isMobile ? '85vw' : '350px';

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden relative">
            {/* Header / Top Bar */}
            <div className="h-16 md:h-20 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-[60]">
                <div className="flex items-center gap-3 md:gap-6">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition group relative top-1">
                        <svg className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex flex-col max-w-[200px] md:max-w-md">
                        <h1 className="text-sm md:text-lg font-bold text-white uppercase tracking-tight leading-snug truncate">
                            {currentMatch 
                                ? (currentMatch.isCompetition ? currentMatch.homeTeam : `${currentMatch.homeTeam} vs ${currentMatch.awayTeam}`)
                                : 'Sports Live'}
                        </h1>
                        <p className="text-[9px] md:text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 mt-0.5 truncate">
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                            {currentMatch?.leagueName || activeSource?.name || 'Live Event'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 relative">
                    {/* Source Selector */}
                    {availableSources.length > 0 && (
                         <div className="relative z-50">
                             <button 
                                 onClick={() => setShowSourceSelector(!showSourceSelector)}
                                 className="px-2 md:px-4 py-2 md:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] md:tracking-[0.15em] transition-all flex items-center gap-2 md:gap-3 group"
                             >
                                 <div className="flex items-center gap-1.5 md:gap-2">
                                     <span className="text-white group-hover:text-primary transition-colors max-w-[50px] md:max-w-none truncate">{activeSource?.name}</span>
                                     <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[8px] border border-primary/20 font-black">
                                         Ch.{availableSources.findIndex(s => s.url === activeSource?.url) + 1}
                                     </span>
                                 </div>
                                 <svg className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform ${showSourceSelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                 </svg>
                             </button>
                             
                             <AnimatePresence>
                                  {showSourceSelector && (
                                      <motion.div 
                                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                          className="absolute right-0 top-full mt-3 w-56 md:w-64 max-h-[60vh] overflow-y-auto bg-[#0F0F0F]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 custom-scrollbar"
                                      >
                                          <div className="px-3 py-2 text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 mb-2">📡 Channels ({availableSources.length})</div>
                                          {availableSources.map((source, idx) => (
                                              <button
                                                  key={idx}
                                                  onClick={() => {
                                                      setActiveSource(source);
                                                      setShowSourceSelector(false);
                                                      setRetryCount(0);
                                                  }}
                                                  className={`w-full text-left px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all mb-1 last:mb-0 flex items-center justify-between group ${
                                                      activeSource?.url === source.url 
                                                          ? 'bg-primary/20 text-white border border-primary/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                                                          : 'text-gray-500 hover:bg-white/5 hover:text-white border border-transparent'
                                                  }`}
                                              >
                                                  <span className="flex items-center gap-2">
                                                      <div className={`w-1.5 h-1.5 rounded-full ${activeSource?.url === source.url ? 'bg-primary animate-pulse' : 'bg-gray-700'}`} />
                                                      {source.name}
                                                  </span>
                                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${
                                                      activeSource?.url === source.url ? 'bg-primary/30 text-white' : 'bg-white/5 text-gray-600'
                                                  }`}>
                                                      Ch.{idx + 1}
                                                  </span>
                                              </button>
                                          ))}
                                      </motion.div>
                                  )}
                             </AnimatePresence>
                         </div>
                    )}
                    
                     <button 
                        onClick={toggleFullscreen}
                        className="p-2 md:p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:bg-white/10 transition-all"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                     >
                        {isFullscreen ? <FiMinimize2 className="w-4 h-4 md:w-5 md:h-5" /> : <FiMaximize2 className="w-4 h-4 md:w-5 md:h-5" />}
                     </button>

                     <button 
                        onClick={toggleSidebar}
                        className={`p-2 md:p-2.5 rounded-xl border transition-all ${isSidebarOpen ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'}`}
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex flex-grow overflow-hidden relative z-10 w-full relative h-[calc(100vh-64px)] md:h-[calc(100vh-80px)]">
                {/* Main Player Area */}
                <div 
                    ref={playerContainerRef} 
                    className={`flex-grow h-full relative bg-black transition-all duration-500`}
                    onDoubleClick={toggleFullscreen}
                >
                    {(activeSource || hasMatchParams) ? (
                        <>
                            {(activeSource?.type === 'iframe' || (!activeSource && hasMatchParams)) ? (
                                activeSource?.url ? (
                                    <iframe
                                        key={activeSource?.url}
                                        src={activeSource?.url}
                                        className="w-full h-full border-0 absolute inset-0 z-0 bg-black"
                                        allowFullScreen
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        onLoad={() => setIsBuffering(false)}
                                    />
                                ) : !isBuffering && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505] p-6 md:p-8 text-center">
                                         <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 md:mb-8">
                                             <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                             </svg>
                                         </div>
                                         <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-3 md:mb-4 italic">Stream <span className="text-red-500">Temporarily</span> Offline</h2>
                                         <p className="text-gray-400 max-w-md text-[10px] md:text-xs leading-relaxed mb-6 md:mb-8">This match is not currently being broadcasted on our premium servers. Please check back later or try another server.</p>
                                    </div>
                                )
                            ) : (
                                <video 
                                    ref={videoRef}
                                    className="w-full h-full object-contain absolute inset-0 z-0 bg-black"
                                    controls
                                    muted
                                    autoPlay
                                    playsInline
                                    onWaiting={() => setIsBuffering(true)}
                                    onPlaying={() => setIsBuffering(false)}
                                    onError={() => handleFailover()}
                                />
                            )}

                            {/* Buffering Overlay */}
                            <AnimatePresence>
                                {isBuffering && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4 md:mb-6" />
                                            <div className="absolute inset-0 border-4 border-transparent border-b-primary/40 rounded-full animate-ping opacity-30" />
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5 md:gap-2">
                                            <p className="text-white font-black uppercase tracking-[0.2em] md:tracking-[0.25em] text-[8px] md:text-[10px]">Optimizing Connection...</p>
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[7px] md:text-[8px]">Trying to bypass bottlenecks</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Playback Error / Offline UI */}
                            {retryCount > availableSources.length && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505] p-6 md:p-8 text-center">
                                     <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 md:mb-8">
                                         <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                         </svg>
                                     </div>
                                     <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-3 md:mb-4 italic">Stream <span className="text-red-500">Temporarily</span> Offline</h2>
                                     <p className="text-gray-400 max-w-md text-[10px] md:text-xs leading-relaxed mb-6 md:mb-8">We've tried all available servers but the broadcaster is currently silent. Please try again in a few minutes or check another match.</p>
                                     <button 
                                        onClick={() => { setRetryCount(0); handleFailover(); }}
                                        className="px-6 py-3 md:px-8 md:py-4 bg-white text-black font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] rounded-xl hover:scale-105 transition-all"
                                     >
                                         Hard Refresh Link
                                     </button>
                                </div>
                            )}

                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 md:p-10 bg-black">
                             <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4 md:mb-6" />
                             <p className="text-gray-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Initialising Secure Stream Player...</p>
                        </div>
                    )}
                    
                    {/* Floating Expand Control */}
                    <AnimatePresence>
                        {!isSidebarOpen && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={toggleSidebar}
                                className="absolute right-4 top-4 md:right-6 md:top-6 bg-black/60 backdrop-blur-md border border-white/10 p-2.5 md:p-3 rounded-xl shadow-2xl z-40 hover:bg-black/80 hover:border-white/20 transition-all group"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Component directly beside player, overriding mobile with absolute */}
                <motion.div 
                    initial={false}
                    animate={isMobile ? { x: isSidebarOpen ? 0 : '100%' } : { width: isSidebarOpen ? '350px' : '0px' }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    className={`flex-shrink-0 h-full border-l border-white/5 z-[45] bg-[#0A0A0A] absolute md:relative right-0 ${isMobile ? 'top-0' : ''}`}
                    style={{ overflow: isSidebarOpen ? 'visible' : 'hidden', width: sidebarWidth }}
                >
                    <div className="w-full h-full shadow-[-20px_0_50px_rgba(0,0,0,0.8)]">
                        <SportsSidebar 
                            liveMatches={liveMatches}
                            upcomingMatches={upcomingMatches}
                            currentMatchId={matchId}
                            onClose={toggleSidebar}
                        />
                    </div>
                </motion.div>
                
                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isSidebarOpen && isMobile && (
                        <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           onClick={toggleSidebar}
                           className="md:hidden absolute inset-0 bg-black/80 backdrop-blur-sm z-[40]" 
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SportsWatchPage;
