import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { safeStorage } from "../../utils/safeStorage";

// A selection of highly recognizable premium backdrops
const BACKDROPS = [
    "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", // Inception
    "https://image.tmdb.org/t/p/w1280/x2RS3uTcsJJ9CpnjFA3c2cqr6zQ.jpg", // Interstellar
    "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", // Avengers Endgame
    "https://image.tmdb.org/t/p/w1280/4q2hz2m8hubgvijz8Ez0T2Os2Yv.jpg", // Avatar 2
    "https://image.tmdb.org/t/p/w1280/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg", // Spider-Verse
    "https://image.tmdb.org/t/p/w1280/mdfZQILvYAR5G9qO380m1tG14XQ.jpg"  // Oppenheimer
];

const OnboardingOverlay: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const hasSeen = safeStorage.get("has_seen_onboarding_v3");
        // Also do not show if user is signed in
        const isSignedIn = localStorage.getItem("isSignedIn");
        if (!hasSeen && isSignedIn !== "true") {
            setIsVisible(true);
        }
    }, []);

    const handleGetStarted = () => {
        setIsVisible(false);
        safeStorage.set("has_seen_onboarding_v3", "true");
        navigate("/auth");
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-[12000] bg-cinema-black flex items-center justify-center overflow-hidden"
            >
                {/* Cinematic Image Collage Background */}
                <div className="absolute inset-0 opacity-40">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-[120%] h-[120%] -translate-x-[10%] -translate-y-[10%] -rotate-6 scale-110">
                        {BACKDROPS.map((src, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1, duration: 1.5, ease: "easeOut" }}
                                className="relative rounded-2xl overflow-hidden shadow-2xl"
                            >
                                <img src={src} alt="Movie Backdrop" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Heavy Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/90 via-transparent to-cinema-black/90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-end h-full w-full max-w-2xl px-6 pb-24 md:pb-32 text-center">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4 drop-shadow-2xl">
                            Stream<span className="text-primary">Lux</span>
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl font-medium tracking-wide max-w-md mx-auto mb-12 drop-shadow-md">
                            Your portal to endless cinematic adventures. Watch the biggest movies, live sports, and exclusive shows in breathtaking quality.
                        </p>

                        <button 
                            onClick={handleGetStarted}
                            className="group relative inline-flex items-center justify-center gap-4 px-12 py-5 rounded-full bg-primary text-black font-black uppercase tracking-[0.2em] text-lg hover:scale-105 transition-all duration-500 shadow-neon-primary overflow-hidden"
                        >
                            <span className="relative z-10">Get Started</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingOverlay;
