import { FC } from "react";
import { motion } from "framer-motion";

const AtmosphericBackground: FC = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0a0a0b]">
            {/* SVG Filter for Liquid Effect */}
            <svg className="hidden">
                <defs>
                    <filter id="liquid">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="liquid" />
                    </filter>
                </defs>
            </svg>

            <div className="absolute inset-0" style={{ filter: "url(#liquid)" }}>
                {/* Primary Aura Orb 1 */}
                <motion.div
                    animate={{
                        x: ["-10%", "20%", "-10%"],
                        y: ["-10%", "30%", "-10%"],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute w-[800px] h-[800px] rounded-full bg-primary/20 blur-[120px]"
                    style={{ top: "10%", left: "15%" }}
                />

                {/* Secondary Aura Orb 2 */}
                <motion.div
                    animate={{
                        x: ["30%", "-10%", "30%"],
                        y: ["40%", "10%", "40%"],
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px]"
                    style={{ bottom: "5%", right: "10%" }}
                />

                {/* Accent Orb 3 */}
                <motion.div
                    animate={{
                        x: ["0%", "40%", "0%"],
                        y: ["60%", "20%", "60%"],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[80px]"
                    style={{ bottom: "20%", left: "30%" }}
                />
            </div>

            {/* Fine Grain Overlay for Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
        </div>
    );
};

export default AtmosphericBackground;
