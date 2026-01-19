import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaServer } from 'react-icons/fa';

export interface VideoSource {
    name: string;
    url: string;
    quality?: string;
    type?: 'embed' | 'direct';
}

interface VideoPlayerProps {
    sources: VideoSource[] | string[]; // Backwards compatibility for string[] if needed, but prefer objects
    poster?: string;
    title?: string;
    onError?: () => void;
}

// Detect if source is a direct video URL or an iframe embed
const isDirectVideoUrl = (url: string): boolean => {
    const directVideoPatterns = [
        /\.(mp4|webm|ogg|m3u8)$/i,
        /\/video\//i,
        /\/stream\//i,
        /\/download\//i,
        /fzmovies\.ng.*download/i,
        /netnaija\.net.*download/i,
        /o2tvseries\.com.*download/i,
    ];

    return directVideoPatterns.some(pattern => pattern.test(url));
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    sources,
    poster,
    title,
    onError
}) => {
    // Normalize sources to VideoSource object array
    const normalizedSources: VideoSource[] = sources.map(s =>
        typeof s === 'string' ? { name: 'Default', url: s } : s
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isDirect, setIsDirect] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSourceMenu, setShowSourceMenu] = useState(false);

    const currentSource = normalizedSources[currentIndex];

    // Reset player when sources change (new episode/season)
    useEffect(() => {
        if (normalizedSources.length > 0) {
            setCurrentIndex(0);
            setVideoError(false);
            setIsLoading(true);
            setIsDirect(isDirectVideoUrl(normalizedSources[0].url));
        }
    }, [normalizedSources.length, normalizedSources[0]?.url]);

    useEffect(() => {
        if (!currentSource) return;
        setIsDirect(isDirectVideoUrl(currentSource.url));
        setVideoError(false);
        setIsLoading(true);
    }, [currentIndex, currentSource]);

    const handleVideoError = () => {
        console.error(`Video error for source: ${currentSource?.name}`);
        setVideoError(true);
        setIsLoading(false);
        if (onError) onError();

        // Auto-switch if next source available? 
        // For now, let user switch manually to avoid infinite loops
    };

    const handleVideoLoad = () => {
        console.log(`Video loaded successfully: ${currentSource?.name}`);
        setIsLoading(false);
    };

    if (!currentSource) {
        return (
            <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
                <p>No video sources available.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black group overflow-hidden">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 pointer-events-none">
                    <AiOutlineLoading3Quarters className="animate-spin text-primary" size={48} />
                </div>
            )}

            {/* Error Overlay */}
            {videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                    <p className="text-red-400 text-lg mb-4">Playback failed for {currentSource.name}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setVideoError(false);
                                setIsLoading(true);
                                // Force reload logic if needed
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                        >
                            Retry
                        </button>
                        {normalizedSources.length > 1 && (
                            <button
                                onClick={() => {
                                    setCurrentIndex((prev) => (prev + 1) % normalizedSources.length);
                                }}
                                className="px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-white transition"
                            >
                                Try Next Source
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Player */}
            {isDirect ? (
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                    poster={poster}
                    onError={handleVideoError}
                    onLoadedData={handleVideoLoad}
                    onCanPlay={handleVideoLoad}
                    src={currentSource.url}
                >
                    Your browser does not support the video tag.
                </video>
            ) : (
                <iframe
                    key={`${currentSource.url}-${Date.now()}`} // Force reload when URL changes
                    className="w-full h-full border-0"
                    src={currentSource.url}
                    title={title || `Video Player - ${currentSource.name}`}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onError={handleVideoError}
                    onLoad={handleVideoLoad}
                />
            )}

            {/* Source Switcher UI - Visible on Hover */}
            {normalizedSources.length > 1 && (
                <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="relative">
                        <button
                            onClick={() => setShowSourceMenu(!showSourceMenu)}
                            className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-black/80 transition shadow-lg"
                        >
                            <FaServer className={currentSource.name.includes('VidSrc') ? 'text-primary' : 'text-gray-400'} />
                            <span className="text-sm font-medium max-w-[100px] truncate">{currentSource.name}</span>
                            {currentSource.quality && (
                                <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-300">{currentSource.quality}</span>
                            )}
                        </button>

                        {showSourceMenu && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-dark-lighten border border-white/10 rounded-xl shadow-xl overflow-hidden py-2 max-h-[300px] overflow-y-auto no-scrollbar">
                                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Select Source</div>
                                {normalizedSources.map((src, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setCurrentIndex(idx);
                                            setShowSourceMenu(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/5 transition ${currentIndex === idx ? 'text-primary bg-white/5' : 'text-gray-300'}`}
                                    >
                                        <div className='flex items-center gap-2 overflow-hidden'>
                                            <span className="truncate">{src.name}</span>
                                        </div>
                                        {src.quality && (
                                            <span className="text-xs bg-black/40 px-1.5 py-0.5 rounded border border-white/5">{src.quality}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
