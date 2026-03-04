import { motion, AnimatePresence } from "framer-motion";
import { FC, useEffect, useState } from "react";

const MasterReveal: FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                    transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
                    className="fixed inset-0 z-[10000] bg-dark flex flex-col items-center justify-center p-4 overflow-hidden"
                >
                    {/* Background Ambient Glow */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.3, scale: 1.2 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                        className="absolute w-[80vw] h-[80vw] bg-primary rounded-full blur-[120px] pointer-events-none"
                    />

                    <div className="relative flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="relative"
                        >
                            <img
                                src="/logo.svg"
                                alt="StreamLux Logo"
                                className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_30px_rgba(255,107,53,0.5)]"
                            />
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-20%] border border-primary/20 rounded-full border-dashed"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, letterSpacing: "1em" }}
                            animate={{ opacity: 1, letterSpacing: "0.2em" }}
                            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                            className="mt-8 text-3xl md:text-5xl font-black text-white uppercase tracking-[0.2em]"
                        >
                            Stream<span className="text-primary">Lux</span>
                        </motion.div>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                            className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mt-4 w-48"
                        />

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.6, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.5 }}
                            className="text-white/60 text-xs md:text-sm mt-6 font-medium tracking-widest uppercase"
                        >
                            Elevating your entertainment
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MasterReveal;
