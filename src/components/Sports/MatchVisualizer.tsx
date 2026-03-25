import { FC, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchEvent {
    id: string;
    type: 'attack' | 'danger' | 'goal' | 'card' | 'corner';
    team: 'home' | 'away';
    x: number; // 0-100
    y: number; // 0-100
    timestamp: number;
}

interface MatchVisualizerProps {
    className?: string;
    homeTeam: string;
    awayTeam: string;
    events?: MatchEvent[];
    homePossession?: number;
    awayPossession?: number;
    isLive?: boolean;
}

const MatchVisualizer: FC<MatchVisualizerProps> = ({
    className = "",
    homeTeam,
    awayTeam,
    events = [],
    homePossession = 50,
    awayPossession = 50,
    isLive = true
}) => {
    // Current active attack (mocking or derived from events)
    const activeAttack = useMemo(() => {
        if (!isLive) return null;
        const lastEvent = events[events.length - 1];
        if (lastEvent && Date.now() - lastEvent.timestamp < 5000) return lastEvent;
        return null;
    }, [events, isLive]);

    return (
        <div className={`relative w-full aspect-[3/2] bg-[#0A1A0A] rounded-2xl overflow-hidden border border-white/5 shadow-2xl ${className}`}>
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/grass.png')] bg-repeat" />
            </div>

            {/* Pitch Markings */}
            <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full stroke-white/20 fill-none stroke-[0.8]">
                {/* Outer Boundary */}
                <rect x="10" y="10" width="280" height="180" />
                {/* Center Line */}
                <line x1="150" y1="10" x2="150" y2="190" />
                {/* Center Circle */}
                <circle cx="150" cy="100" r="30" />
                <circle cx="150" cy="100" r="1" fill="white" />
                {/* Home Box */}
                <rect x="10" y="55" width="45" height="90" />
                <rect x="10" y="75" width="18" height="50" />
                <path d="M 55 85 Q 70 100 55 115" />
                {/* Away Box */}
                <rect x="245" y="55" width="45" height="90" />
                <rect x="272" y="75" width="18" height="50" />
                <path d="M 245 85 Q 230 100 245 115" />
            </svg>

            {/* Momentum / Heatmap Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 top-0 bottom-0 bg-primary/5 transition-all duration-1000" style={{ width: `${homePossession}%` }} />
                <div className="absolute right-0 top-0 bottom-0 bg-blue-500/5 transition-all duration-1000" style={{ width: `${awayPossession}%` }} />
            </div>

            {/* Active Attack Animations */}
            <AnimatePresence>
                {activeAttack && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute z-10"
                        style={{
                            left: `${activeAttack.x}%`,
                            top: `${activeAttack.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className={`relative w-8 h-8 flex items-center justify-center`}>
                            <motion.div
                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className={`absolute inset-0 rounded-full ${activeAttack.team === 'home' ? 'bg-primary' : 'bg-blue-500'}`}
                            />
                            <div className={`w-3 h-3 rounded-full shadow-lg ${activeAttack.team === 'home' ? 'bg-primary' : 'bg-blue-500'} border border-white/50`} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Labels */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Live Pressure</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-white font-bold text-sm tracking-tight">{homeTeam} attacking</span>
                    </div>
                </div>

                <div className="bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Possession</p>
                        <div className="flex items-center gap-2 text-xs font-black text-white">
                            <span className="text-primary">{homePossession}%</span>
                            <span className="text-gray-600">-</span>
                            <span className="text-blue-400">{awayPossession}%</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Defense</span>
                    <p className="text-white/60 text-xs font-medium">{awayTeam} tracking back</p>
                </div>
            </div>

            {/* Event Log / Ticker */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-4 overflow-x-auto scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {events.slice(-5).reverse().map((event, i) => (
                        <motion.div
                            key={event.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 shrink-0"
                        >
                            <span className={`w-2 h-2 rounded-full ${event.type === 'goal' ? 'bg-yellow-400' : event.type === 'card' ? 'bg-red-500' : 'bg-white/40'}`} />
                            <span className="text-[10px] font-bold text-white uppercase">{event.type}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Interactive Overlay for testing/fun */}
            <div className="absolute inset-0 cursor-crosshair group">
                <div className="absolute inset-0 group-active:bg-white/5 transition-colors" />
            </div>
        </div>
    );
};

export default MatchVisualizer;
