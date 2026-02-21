import React, { useEffect, useState, useRef } from "react";
import { vibeService } from "../../services/vibe";

interface AmbiFlowGlowProps {
    videoRef?: React.RefObject<HTMLVideoElement>;
    poster?: string;
    isActive: boolean;
}

const AmbiFlowGlow: React.FC<AmbiFlowGlowProps> = ({ videoRef, poster, isActive }) => {
    const [glowColor, setGlowColor] = useState<string>("rgba(255, 107, 53, 0.2)");
    const requestRef = useRef<number>();

    useEffect(() => {
        if (!isActive) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const sample = () => {
            if (videoRef?.current && !videoRef.current.paused && !videoRef.current.ended) {
                try {
                    const color = vibeService.extractColorFromVideo(videoRef.current);
                    setGlowColor(color.replace("rgb", "rgba").replace(")", ", 0.4)"));
                } catch (e) {
                    // CORS or other issue
                }
            }
            requestRef.current = requestAnimationFrame(sample);
        };

        if (videoRef?.current) {
            requestRef.current = requestAnimationFrame(sample);
        } else if (poster) {
            vibeService.extractAverageColor(poster).then(color => {
                setGlowColor(color.replace("rgb", "rgba").replace(")", ", 0.2)"));
            });
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [videoRef, poster, isActive]);

    if (!isActive) return null;

    return (
        <div
            className="absolute inset-x-[-20%] inset-y-[-20%] pointer-events-none transition-colors duration-1000 ease-in-out"
            style={{
                zIndex: 0,
                background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
                filter: "blur(80px) saturate(2)",
            }}
        />
    );
};

export default AmbiFlowGlow;
