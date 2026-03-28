import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import { sportsService } from './api';
import { SportMatch } from './types';
import SportsSidebar from './SportsSidebar';
import { 
    getFallbackChannel, 
    SportsChannel, 
    ALL_SPORTS_CHANNELS, 
    getDynamicMatchSources,
    getStreamEastSources 
} from '../../utils/sportsChannelMap';

const SportsWatchPage: React.FC = () => {
    const { matchId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [liveMatches, setLiveMatches] = useState<SportMatch[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<SportMatch[]>([]);
    const [currentMatch, setCurrentMatch] = useState<SportMatch | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Multi-source handling
    const [availableSources, setAvailableSources] = useState<SportsChannel[]>([]);
    const [activeSource, setActiveSource] = useState<SportsChannel | null>(null);
    const [showSourceSelector, setShowSourceSelector] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);

    // Fetch sidebar data
    useEffect(() => {
        const fetchSidebarData = async () => {
            const [live, upcoming] = await Promise.all([
                sportsService.getLiveMatches(),
                sportsService.getUpcomingMatches()
            ]);
            if (live.success) setLiveMatches(live.data);
            if (upcoming.success) setUpcomingMatches(upcoming.data);

            const all = [...live.data, ...upcoming.data];
            const found = all.find(m => m.id === matchId);
            if (found) {
                setCurrentMatch(found);
            }
        };

        fetchSidebarData();
    }, [matchId]);

    // NEW: Handle Source Resolution with RiveStream-style Matching & StreamEast Intelligence
    useEffect(() => {
        let sources: SportsChannel[] = [];
        let primaryLink = location.state?.streamUrl;
        
        let headerName = 'Live Event';
        let channelId = '';

        // 1. Prioritize intelligent StreamEast mirrors first (No user input required)
        if (currentMatch) {
            const streamEastMirrors = getStreamEastSources(currentMatch);
            sources.push(...streamEastMirrors);
            
            const dynamicSources = getDynamicMatchSources(currentMatch);
            sources.push(...dynamicSources);
        }

        // 2. Resolve primary link context
        if (matchId && matchId.startsWith('channel-')) {
             channelId = matchId.replace('channel-', '');
             const targetChannel = ALL_SPORTS_CHANNELS.find(c => c.name.toLowerCase().includes(channelId.toLowerCase()) || c.url.toLowerCase().includes(channelId.toLowerCase()));
             if (targetChannel) {
                  primaryLink = targetChannel.url;
                  headerName = targetChannel.name;
             }
        } else if (!primaryLink && currentMatch?.link && !currentMatch.link.includes('espn.com')) {
            primaryLink = currentMatch.link;
        } else if (matchId && matchId.startsWith('http')) {
            primaryLink = decodeURIComponent(matchId);
        }

        // 3. Add primary link (only unshift if it's NOT a generic fallback)
        if (primaryLink) {
             const isGeneric = primaryLink.includes('espn.com') || primaryLink.includes('plus.espn') || primaryLink.includes('generic');
             const existingPrimary = sources.findIndex(s => s.url === primaryLink);
             
             if (existingPrimary !== -1) {
                  const [item] = sources.splice(existingPrimary, 1);
                  if (isGeneric) sources.push(item);
                  else sources.unshift(item);
             } else {
                  const item = { 
                    name: channelId ? headerName : (isGeneric ? 'Network Fallback' : 'Direct Multi-Link'), 
                    type: primaryLink.includes('.m3u8') ? 'hls' : 'iframe', 
                    url: primaryLink 
                  };
                  if (isGeneric) sources.push(item);
                  else sources.unshift(item);
             }
        }

        // 4. Add Fallback Channel based on sport/league
        const leagueContext = currentMatch?.leagueId || currentMatch?.leagueName || (channelId ? headerName : 'network');
        const fallback = getFallbackChannel(leagueContext);
        
        if (!sources.some(s => s.url === fallback.url)) {
             sources.push(fallback);
        }
        
        // 5. Add ESPN as universal fallback if not already there
        const universalFallback = getFallbackChannel('espn null'); // returns espn default
        if (universalFallback.url !== fallback.url && !sources.some(s => s.url === universalFallback.url)) {
             sources.push(universalFallback);
        }

        // 6. Keep catalogue manageable - only add unique channels from the main list
        const fullCatalogue = [...sources];
        ALL_SPORTS_CHANNELS.forEach(channel => {
            if (!fullCatalogue.some(s => s.url === channel.url)) {
                fullCatalogue.push({ ...channel });
            }
        });

        setAvailableSources(fullCatalogue);
        
        // 7. AUTO-SELECT PRIORITY: Always try to default to StreamEast Alpha if available
        if (fullCatalogue.length > 0) {
            const streamEastIdx = fullCatalogue.findIndex(s => s.name.toLowerCase().includes('streameast alpha'));
            const initialSource = streamEastIdx !== -1 ? fullCatalogue[streamEastIdx] : fullCatalogue[0];
            
            if (!activeSource || !fullCatalogue.some(s => s.url === activeSource.url)) {
                setActiveSource(initialSource);
            }
        }
    }, [currentMatch, location.state, matchId]);

    // HLS Support effect
    useEffect(() => {
        let hls: Hls | null = null;
        
        if (activeSource?.type === 'hls' && videoRef.current) {
            const video = videoRef.current;
            if (Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(activeSource.url);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = activeSource.url;
            }
        }
        
        return () => {
            if (hls) hls.destroy();
        };
    }, [activeSource]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden relative">
            {/* Header / Top Bar */}
            <div className="h-20 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-[60]">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition group relative top-1">
                        <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-white uppercase tracking-tight leading-snug">
                            {currentMatch 
                                ? (currentMatch.isCompetition ? currentMatch.homeTeam : `${currentMatch.homeTeam} vs ${currentMatch.awayTeam}`)
                                : 'Sports Live'}
                        </h1>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {currentMatch?.leagueName || activeSource?.name || 'Live Event'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative">
                    {/* Source Selector */}
                    {availableSources.length > 1 && (
                         <div className="relative z-50">
                             <button 
                                 onClick={() => setShowSourceSelector(!showSourceSelector)}
                                 className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] transition-all flex items-center gap-3"
                             >
                                 <span className="text-white">{activeSource?.name}</span>
                                 <svg className={`w-4 h-4 transition-transform ${showSourceSelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                 </svg>
                             </button>
                             
                             <AnimatePresence>
                                 {showSourceSelector && (
                                     <motion.div 
                                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                         animate={{ opacity: 1, y: 0, scale: 1 }}
                                         exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                         className="absolute right-0 top-full mt-3 w-56 max-h-[60vh] overflow-y-auto bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 custom-scrollbar"
                                     >
                                         {availableSources.map((source, idx) => (
                                             <button
                                                 key={idx}
                                                 onClick={() => {
                                                     setActiveSource(source);
                                                     setShowSourceSelector(false);
                                                 }}
                                                 className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all mb-1 last:mb-0 ${
                                                     activeSource?.url === source.url 
                                                         ? 'bg-primary/20 text-white border border-primary/20' 
                                                         : 'text-gray-500 hover:bg-white/5 hover:text-white border border-transparent'
                                                 }`}
                                             >
                                                 {source.name}
                                             </button>
                                         ))}
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                         </div>
                    )}
                    
                     <button 
                        onClick={toggleSidebar}
                        className={`p-2.5 rounded-xl border transition-all ${isSidebarOpen ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex flex-grow overflow-hidden relative z-10 w-full relative h-[calc(100vh-80px)]">
                {/* Main Player Area */}
                <div className={`flex-grow h-full relative bg-black transition-all duration-500`}>
                    {activeSource ? (
                        activeSource.type === 'iframe' ? (
                            <iframe
                                key={activeSource.url}
                                src={activeSource.url}
                                className="w-full h-full border-0 absolute inset-0 z-0 bg-black"
                                allowFullScreen
                                allow="autoplay; encrypted-media; picture-in-picture"
                            />
                        ) : (
                            <video 
                                ref={videoRef}
                                className="w-full h-full object-contain absolute inset-0 z-0 bg-black"
                                controls
                                autoPlay
                            />
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-black">
                             <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                             <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Initialising Secure Stream Player...</p>
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
                                className="absolute right-6 top-6 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl z-40 hover:bg-black/80 hover:border-white/20 transition-all group"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Component directly beside player, overriding mobile with absolute */}
                <motion.div 
                    initial={false}
                    animate={{ width: isSidebarOpen ? '350px' : '0px', opacity: isSidebarOpen ? 1 : 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className={`flex-shrink-0 h-full border-l border-white/5 z-[45] bg-[#0A0A0A] absolute md:relative right-0`}
                    style={{ overflow: isSidebarOpen ? 'visible' : 'hidden' }}
                >
                    <div className="w-[350px] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.8)]">
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
                    {isSidebarOpen && (
                        <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           onClick={toggleSidebar}
                           className="md:hidden absolute inset-0 bg-black/80 backdrop-blur-md z-[40]" 
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SportsWatchPage;
