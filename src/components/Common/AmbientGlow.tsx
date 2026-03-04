import { FC, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

interface AmbientGlowProps {
    imageUrl?: string;
    fallbackColor?: string;
}

const AmbientGlow: FC<AmbientGlowProps> = ({ imageUrl, fallbackColor = "#ff6b35" }) => {
    const [currentGlow, setCurrentGlow] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!imageUrl) {
            setCurrentGlow(`radial-gradient(circle at 50% 30%, ${fallbackColor}22 0%, transparent 70%)`);
            setIsLoaded(true);
            return;
        }

        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            // Create a subtle spread using the image itself
            setCurrentGlow(`url(${imageUrl})`);
            setIsLoaded(true);
        };
    }, [imageUrl, fallbackColor]);

    if (!Capacitor.isNativePlatform() && window.innerWidth < 768) return null; // Save performance on mobile web

    return (
        <div
            className={`tw-ambient-glow ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
                backgroundImage: currentGlow || 'none',
                backgroundPosition: 'center 20%',
                backgroundSize: '150% 150%',
                backgroundRepeat: 'no-repeat',
            }}
        />
    );
};

export default AmbientGlow;
