import { FC, useEffect, useState } from "react";
import { getVideo } from "../../services/home";

interface HeroTrailerProps {
    mediaId?: number;
    mediaType?: "movie" | "tv";
    isActive: boolean;
    youtubeId?: string; // Direct key if available
}

const HeroTrailer: FC<HeroTrailerProps> = ({ mediaId, mediaType, isActive, youtubeId }) => {
    const [videoKey, setVideoKey] = useState<string | null>(youtubeId || null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isActive && !videoKey && mediaId && mediaType) {
            getVideo(mediaType, mediaId).then((key) => {
                if (key) {
                    setVideoKey(key);
                    // Fallback: Show video after 2.5s even if onLoad doesn't fire (e.g. network lag)
                    setTimeout(() => setIsLoaded(true), 2500);
                }
            });
        }
    }, [isActive, mediaId, mediaType, videoKey]);

    if (!videoKey || !isActive) return null;

    return (
        <div className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <iframe
                className="w-full h-[150%] -mt-[12%] pointer-events-none scale-125"
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoKey}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
                title="Hero Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                onLoad={() => {
                    setTimeout(() => setIsLoaded(true), 1000);
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-lighten via-transparent to-black/30" />
        </div>
    );
};

export default HeroTrailer;
