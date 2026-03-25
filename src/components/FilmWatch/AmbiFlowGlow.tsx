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
                    // World Class: Dynamic opacity based on luminance would be cool, but fixed 0.4 is safe
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
                setGlowColor(color.replace("rgb", "rgba").replace(")", ", 0.3)"));
            });
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [videoRef, poster, isActive]);

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Volumetric Layer 1: Core Glow */}
            <div
                className="absolute inset-[-10%] transition-colors duration-1000 ease-in-out"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 60%)`,
                    filter: "blur(40px) saturate(1.5)",
                    opacity: 0.6
                }}
            />
            {/* Volumetric Layer 2: Wide Atmospheric Wash */}
            <div
                className="absolute inset-[-40%] transition-colors duration-1000 ease-in-out"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 80%)`,
                    filter: "blur(120px) saturate(2)",
                    opacity: 0.4
                }}
            />
            {/* Volumetric Layer 3: Edge Bloom Accent */}
            <div
                className="absolute inset-[-20%] transition-colors duration-1000 ease-in-out"
                style={{
                    background: `conic-gradient(from 0deg at 50% 50%, transparent, ${glowColor}, transparent)`,
                    filter: "blur(100px)",
                    opacity: 0.2,
                    animation: "spin 20s linear infinite"
                }}
            />
        </div>
    );
};

export default AmbiFlowGlow;
