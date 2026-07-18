import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reaction {
    id: string;
    emoji: string;
    x: number;
    delay: number;
}

const EMOJIS = ['🔥', '⚽', '🙌', '😱', '🤩', '👏', '💔'];

const LiveBuzz: FC<{ matchId?: string }> = ({ matchId }) => {
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [viewerCount, setViewerCount] = useState(1240);

    // Mock Viewer Count Fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setViewerCount(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const addReaction = (emoji: string) => {
        const newReaction: Reaction = {
            id: Math.random().toString(),
            emoji,
            x: Math.random() * 80 + 10, // 10% to 90%
            delay: 0
        };
        setReactions(prev => [...prev, newReaction]);

        // Auto-remove after animation
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 3000);
    };

    return (
        <div className="relative w-full h-full pointer-events-none">
            {/* Viewer Count Badge */}
            <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    {viewerCount.toLocaleString()} Watching Now
                </span>
            </div>

            {/* Reaction Stream */}
            <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence>
                    {reactions.map((r) => (
                        <motion.div
                            key={r.id}
                            initial={{ y: '100%', opacity: 0, x: `${r.x}%`, scale: 0.5 }}
                            animate={{ y: '-10%', opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.5, 2] }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="absolute bottom-0 text-3xl md:text-5xl"
                        >
                            {r.emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Reaction Controls */}
            <div className="absolute bottom-6 right-6 z-40 flex flex-col md:flex-row gap-2 pointer-events-auto">
                <div className="flex gap-2 bg-black/40 backdrop-blur-3xl p-2 rounded-[2rem] border border-white/10">
                    {EMOJIS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => addReaction(emoji)}
                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-all hover:scale-125 active:scale-90"
                        >
                            <span className="text-xl md:text-2xl">{emoji}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveBuzz;
