import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface VideoPlayerProps {
    source: string;
    sourceName: string;
    onError: () => void;
    onLoad: () => void;
    isLoading: boolean;
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
    source,
    sourceName,
    onError,
    onLoad,
    isLoading
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isDirect, setIsDirect] = useState(false);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        setIsDirect(isDirectVideoUrl(source));
        setVideoError(false);
    }, [source]);

    const handleVideoError = () => {
        console.error(`Video error for source: ${sourceName}`);
        setVideoError(true);
        onError();
    };

    const handleVideoLoad = () => {
        console.log(`Video loaded successfully: ${sourceName}`);
        onLoad();
    };

    // For direct video URLs, use HTML5 video player
    if (isDirect) {
        return (
            <div className="absolute w-full h-full top-0 left-0 bg-black">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                        <AiOutlineLoading3Quarters className="animate-spin text-primary" size={48} />
                    </div>
                )}

                {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                        <div className="text-center p-6">
                            <p className="text-red-400 text-lg mb-2">Failed to load video</p>
                            <p className="text-gray-400 text-sm">Source: {sourceName}</p>
                        </div>
                    </div>
                )}

                <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    autoPlay
                    playsInline
                    onError={handleVideoError}
                    onLoadedData={handleVideoLoad}
                    onCanPlay={handleVideoLoad}
                >
                    <source src={source} type="video/mp4" />
                    <source src={source} type="video/webm" />
                    <source src={source} type="application/x-mpegURL" />
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    // For iframe embeds (VidSrc, YouTube, etc.)
    return (
        <>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                    <AiOutlineLoading3Quarters className="animate-spin text-primary" size={48} />
                </div>
            )}

            <iframe
                className="absolute w-full h-full top-0 left-0"
                src={source}
                title={`Video Player - ${sourceName}`}
                style={{ border: 0 }}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onError={handleVideoError}
                onLoad={handleVideoLoad}
            />
        </>
    );
};

export default VideoPlayer;
