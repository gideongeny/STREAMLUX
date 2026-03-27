import { FC, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { motion, AnimatePresence } from "framer-motion";

interface AmbientGlowProps {
    imageUrl?: string;
    fallbackColor?: string;
    activeBrand?: string | null;
}

const BRAND_COLORS: Record<string, string> = {
  disney: "#1a73e8",
  marvel: "#ed1d24",
  pixar: "#a1c4fd",
  starwars: "#ffe81f",
  natgeo: "#ffcc00",
  dc: "#004de5",
  "007": "#ffffff",
  nickelodeon: "#ff7000",
  cartoonnetwork: "#ffffff",
};

const AmbientGlow: FC<AmbientGlowProps> = ({ imageUrl, fallbackColor = "#ff6b35", activeBrand }) => {
    const [currentGlow, setCurrentGlow] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (activeBrand && BRAND_COLORS[activeBrand]) {
            const color = BRAND_COLORS[activeBrand];
            setCurrentGlow(`radial-gradient(circle at 50% 30%, ${color}33 0%, transparent 70%)`);
            setIsLoaded(true);
            return;
        }

        if (!imageUrl) {
            setCurrentGlow(`radial-gradient(circle at 50% 30%, ${fallbackColor}22 0%, transparent 70%)`);
            setIsLoaded(true);
            return;
        }

        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            setCurrentGlow(`url(${imageUrl})`);
            setIsLoaded(true);
        };
    }, [imageUrl, fallbackColor]);

    if (!Capacitor.isNativePlatform() && window.innerWidth < 768) return null;

    return (
        <AnimatePresence>
            {isLoaded && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: [0.4, 0.6, 0.4],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                    className="tw-ambient-glow"
                    style={{
                        backgroundImage: currentGlow || 'none',
                        backgroundPosition: 'center 20%',
                        backgroundSize: '150% 150%',
                        backgroundRepeat: 'no-repeat',
                        transition: 'background-image 1s ease-in-out'
                    }}
                />
            )}
        </AnimatePresence>
    );
};

export default AmbientGlow;
