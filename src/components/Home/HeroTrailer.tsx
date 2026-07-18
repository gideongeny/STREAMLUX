import { FC, useEffect, useState, useRef } from "react";
import { getVideo } from "../../services/home";
import { resizeImage } from "../../shared/utils";

interface HeroTrailerProps {
    mediaId?: number;
    mediaType?: "movie" | "tv";
    isActive: boolean;
    youtubeId?: string;   // Direct key if already known
    muted?: boolean;
    fallbackImageUrl?: string; // Poster or backdrop to show if trailer fails
}

const TRAILER_PLAY_TIMEOUT_MS = 5000;

const HeroTrailer: FC<HeroTrailerProps> = ({
    mediaId,
    mediaType,
    isActive,
    youtubeId,
    muted = true,
    fallbackImageUrl,
}) => {
    const [videoKey, setVideoKey] = useState<string | null>(youtubeId || null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLoadedRef = useRef(false);

    useEffect(() => {
        isLoadedRef.current = isLoaded;
    }, [isLoaded]);

    const clearWatchdog = () => {
        if (watchdogRef.current) {
            clearTimeout(watchdogRef.current);
            watchdogRef.current = null;
        }
    };

    const startWatchdog = () => {
        clearWatchdog();
        watchdogRef.current = setTimeout(() => {
            if (!isLoadedRef.current) setHasFailed(true);
        }, TRAILER_PLAY_TIMEOUT_MS);
    };

    useEffect(() => {
        if (youtubeId) {
            setVideoKey(youtubeId);
            setIsLoaded(false);
            setHasFailed(false);
            isLoadedRef.current = false;
        }
    }, [youtubeId]);

    useEffect(() => {
        if (!isActive) {
            clearWatchdog();
            setIsLoaded(false);
            setHasFailed(false);
            isLoadedRef.current = false;
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive) {
            clearWatchdog();
            return;
        }
        if (videoKey) startWatchdog();
        return clearWatchdog;
    }, [isActive, videoKey]);

    // Fetch videoKey from TMDB if not injected
    useEffect(() => {
        if (isActive && !videoKey && mediaId && mediaType) {
            getVideo(mediaId, mediaType).then((videos: any[]) => {
                // getVideo returns an array of video objects from TMDB
                // We pick the best YouTube trailer available
                const trailer = videos.find(
                    (v: any) => v.type === "Trailer" && v.site === "YouTube"
                );

                if (trailer?.key) {
                    setVideoKey(trailer.key);
                } else {
                    setHasFailed(true);
                }
            }).catch(() => setHasFailed(true));
        }
    }, [isActive, mediaId, mediaType, videoKey, youtubeId]);

    const handleLoad = () => {
        clearWatchdog();
        setTimeout(() => {
            setIsLoaded(true);
            isLoadedRef.current = true;
        }, 200);
    };

    const handleError = () => {
        clearWatchdog();
        setHasFailed(true);
    };

    if (!isActive) return null;

    if (hasFailed) {
        if (!fallbackImageUrl) return null;
        return (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                    src={resizeImage(fallbackImageUrl, "w780")}
                    alt="Poster"
                    className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-lighten via-transparent to-black/30" />
            </div>
        );
    }

    if (!videoKey) return null;

    return (
        <div
            className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-1000 ${
                isLoaded ? "opacity-100" : "opacity-0"
            }`}
        >
            <iframe
                className="w-full h-[150%] -mt-[12%] pointer-events-none scale-125"
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${
                    muted ? 1 : 0
                }&controls=0&loop=1&playlist=${videoKey}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1`}
                title="Hero Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                onLoad={handleLoad}
                onError={handleError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-lighten via-transparent to-black/30" />
        </div>
    );
};

export default HeroTrailer;
