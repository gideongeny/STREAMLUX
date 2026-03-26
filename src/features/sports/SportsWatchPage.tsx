import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sportsService } from './api';
import { SportMatch } from './types';
import SportsSidebar from './SportsSidebar';

const SportsWatchPage: React.FC = () => {
    const { matchId } = useParams();
    const location = useLocation();
    const [liveMatches, setLiveMatches] = useState<SportMatch[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<SportMatch[]>([]);
    const [currentMatch, setCurrentMatch] = useState<SportMatch | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeSource, setActiveSource] = useState<string>('');

    // Fetch sidebar data
    useEffect(() => {
        const fetchSidebarData = async () => {
            const [live, upcoming] = await Promise.all([
                sportsService.getLiveMatches(),
                sportsService.getUpcomingMatches()
            ]);
            if (live.success) setLiveMatches(live.data);
            if (upcoming.success) setUpcomingMatches(upcoming.data);

            // Find current match from lists if not provided via state
            const all = [...live.data, ...upcoming.data];
            const found = all.find(m => m.id === matchId);
            if (found) {
                setCurrentMatch(found);
                setActiveSource(found.link);
            }
        };

        fetchSidebarData();
    }, [matchId]);

    // Handle initial state from navigation or direct match find
    useEffect(() => {
        if (location.state?.streamUrl) {
            setActiveSource(location.state.streamUrl);
        } else if (matchId && matchId.startsWith('http')) {
            // Fallback for when ID itself is the link (rare)
            setActiveSource(decodeURIComponent(matchId));
        }
    }, [location.state, matchId]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden">
            {/* Header / Top Bar */}
            <div className="h-20 bg-[#0F0F0F] border-b border-white/5 flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-6">
                    <Link to="/sports" className="text-gray-400 hover:text-white transition">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-white uppercase tracking-tight">
                            {currentMatch ? `${currentMatch.homeTeam} vs ${currentMatch.awayTeam}` : 'Sports Live'}
                        </h1>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {currentMatch?.leagueName || 'Premier League'} • Live Streaming
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                     <button 
                        onClick={toggleSidebar}
                        className={`p-3 rounded-xl border transition-all ${isSidebarOpen ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-gray-500'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex flex-grow overflow-hidden">
                {/* Main Player Area */}
                <div className={`flex-grow relative bg-black transition-all duration-500 ${isSidebarOpen ? 'mr-0' : ''}`}>
                    {activeSource ? (
                        <iframe
                            src={activeSource}
                            className="w-full h-full border-0"
                            allowFullScreen
                            allow="autoplay; encrypted-media"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-10">
                             <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                             <p className="text-gray-500 font-bold uppercase tracking-widest">Initialising Secure Stream Player...</p>
                        </div>
                    )}
                    
                    {/* Floating Controls Overlay (Visible only when sidebar is closed) */}
                    <AnimatePresence>
                        {!isSidebarOpen && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={toggleSidebar}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-primary p-4 rounded-full shadow-2xl z-20 hover:scale-110 active:scale-90 transition-all"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar */}
                <motion.div 
                    initial={false}
                    animate={{ width: isSidebarOpen ? '350px' : '0px' }}
                    className="flex-shrink-0 overflow-hidden relative"
                >
                    <div className="w-[350px] h-full overflow-hidden">
                        <SportsSidebar 
                            liveMatches={liveMatches}
                            upcomingMatches={upcomingMatches}
                            currentMatchId={matchId}
                            onClose={toggleSidebar}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SportsWatchPage;
