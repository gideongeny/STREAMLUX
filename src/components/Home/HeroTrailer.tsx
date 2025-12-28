import { FC, useEffect, useState } from "react";
import { getVideo } from "../../services/home";

interface HeroTrailerProps {
    mediaId: number;
    mediaType: "movie" | "tv";
    isActive: boolean;
}

const HeroTrailer: FC<HeroTrailerProps> = ({ mediaId, mediaType, isActive }) => {
    const [videoKey, setVideoKey] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isActive && !videoKey) {
            getVideo(mediaType, mediaId).then((key) => {
                if (key) setVideoKey(key);
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
