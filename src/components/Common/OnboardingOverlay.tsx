import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdCloudUpload, MdSportsSoccer, MdRefresh, MdClose, MdArrowForward } from "react-icons/md";
import { safeStorage } from "../../utils/safeStorage";

const OnboardingOverlay: React.FC = () => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeen = safeStorage.get("has_seen_onboarding_v2");
        if (!hasSeen) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        safeStorage.set("has_seen_onboarding_v2", "true");
    };

    const steps = [
        {
            title: "Connect Your Universe",
            description: "Start by adding your M3U Provider link in Settings to unlock thousands of live channels and movies.",
            icon: <MdCloudUpload className="text-primary size-16" />,
            color: "from-primary/20 to-transparent"
        },
        {
            title: "The Sports Arena",
            description: "Navigate to the Sports tab for real-time scores and live streaming of EPL, UCL, NBA, and more.",
            icon: <MdSportsSoccer className="text-emerald-400 size-16" />,
            color: "from-emerald-500/20 to-transparent"
        },
        {
            title: "Keep It Fresh",
            description: "Once your Provider is valid, use the Refresh button to instantly update your library without restarting.",
            icon: <MdRefresh className="text-blue-400 size-16" />,
            color: "from-blue-500/20 to-transparent"
        }
    ];

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[11000] bg-dark/95 backdrop-blur-xl flex items-center justify-center p-6"
            >
                <div className="relative max-w-md w-full">
                    {/* Background Glow */}
                    <div className={`absolute -inset-20 bg-gradient-to-b ${steps[step].color} rounded-full blur-[100px] opacity-50`} />

                    <div className="relative bg-dark-lighten border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
                        {/* Progress Dots */}
                        <div className="flex gap-2 justify-center mb-10">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1.5 transition-all duration-300 rounded-full ${i === step ? "w-8 bg-primary" : "w-1.5 bg-white/10"}`} />
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="mb-8 p-6 rounded-full bg-white/5 border border-white/5">
                                    {steps[step].icon}
                                </div>
                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                                    {steps[step].title.split(' ')[0]} <span className="text-primary">{steps[step].title.split(' ').slice(1).join(' ')}</span>
                                </h2>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    {steps[step].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-12 flex gap-4">
                            {step > 0 && (
                                <button 
                                    onClick={() => setStep(s => s - 1)}
                                    className="px-6 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition"
                                >
                                    Back
                                </button>
                            )}
                            <button 
                                onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : handleDismiss()}
                                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
                            >
                                {step < steps.length - 1 ? (
                                    <>Next Step <MdArrowForward size={18} /></>
                                ) : (
                                    "Start Journey"
                                )}
                            </button>
                        </div>

                        <button 
                            onClick={handleDismiss}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition"
                        >
                            <MdClose size={24} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingOverlay;
