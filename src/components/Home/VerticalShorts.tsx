import { FC, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { AiOutlineHeart, AiOutlineMessage, AiOutlineShareAlt, AiFillPlayCircle, AiOutlineDownload } from "react-icons/ai";
import { motion } from "framer-motion";
import { fetchSerpShorts } from "../../services/serpApiService";
import { Item } from "../../shared/types";

export interface VerticalShortsProps {
    variant?: "vertical" | "horizontal";
    items?: Item[];
}

const VerticalShorts: FC<VerticalShortsProps> = ({ variant = "vertical", items: initialItems }) => {
    const [shorts, setShorts] = useState<Item[]>(initialItems || []);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(!initialItems);

    useEffect(() => {
        if (!initialItems || initialItems.length === 0) {
            const fetchShortsData = async () => {
                setIsLoading(true);
                try {
                    // WORLD-CLASS: Aggregated Shorts via SerpApi
                    const serpShorts = await fetchSerpShorts();
                    if (serpShorts && serpShorts.length > 0) {
                        setShorts(serpShorts);
                    } else {
                        // Fallback to legacy YouTube-only shorts
                        const data = await getYouTubeShorts();
                        setShorts(data.slice(0, 100));
                    }
                } catch (err) {
                    console.error("Failed to fetch shorts:", err);
                    // Final fallback
                    const data = await getYouTubeShorts();
                    setShorts(data.slice(0, 100));
                } finally {
                    setIsLoading(false);
                }
            };
            fetchShortsData();
        }
    }, [initialItems]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    if (isLoading) {
        return (
            <div className={`mb-12 ${variant === 'horizontal' ? '' : 'h-[650px] aspect-[9/16]'}`}>
                <div className="w-full h-full bg-black/40 animate-pulse rounded-2xl flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (variant === "horizontal") {
        return (
            <div className="mb-12">
                <h2 className="text-2xl text-white font-bold mb-6 flex items-center gap-2">
                    Must-Watch <span className="text-primary">Shorts</span>
                    <span className="text-[10px] bg-primary text-black px-2 py-0.5 rounded ml-2 font-black uppercase tracking-wider">HOT</span>
                </h2>

                <Swiper
                    spaceBetween={20}
                    slidesPerView={1.2}
                    breakpoints={{
                        400: { slidesPerView: 1.5 },
                        640: { slidesPerView: 2.2 },
                        768: { slidesPerView: 2.5 },
                        1024: { slidesPerView: 3.5 },
                        1280: { slidesPerView: 4.5 },
                        1536: { slidesPerView: 5.5 },
                    }}
                    className="!pb-10 overflow-visible"
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                >
                    {shorts.map((short, index) => {
                        // LAZY LOADING & SMART AUDIO: Only load iframe if it's active or adjacent
                        // STRICT AUDIO: Only unmute if activeIndex === index
                        const isNear = Math.abs(index - activeIndex) <= 1;
                        const isCurrentlyViewed = activeIndex === index;
                        const youtubeId = (short as any).youtubeId || 'dQw4w9WgXcQ';
                        const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

                        return (
                            <SwiperSlide key={short.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 group bg-black shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
                                {/* Video */}
                                <div className="w-full h-full cursor-pointer relative" onClick={togglePlay}>
                                    {isNear ? (
                                        <iframe
                                            key={`${short.id}-${isCurrentlyViewed}-${isMuted}`}
                                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=0&loop=1&playlist=${youtubeId}&mute=${(isCurrentlyViewed && !isMuted) ? 0 : 1}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
                                            className="w-full h-full"
                                            title={short.title}
                                            frameBorder="0"
                                            allow="autoplay; encrypted-media; picture-in-picture"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-black relative overflow-hidden">
                                            <img src={thumbnail} alt={short.title} className="w-full h-full object-cover opacity-60" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                    {/* Mute/Unmute Logic */}
                                    <button
                                        onClick={toggleMute}
                                        className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-primary transition-colors text-white hover:text-black"
                                    >
                                        {(isMuted || !isCurrentlyViewed) ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Info - Allow interaction for title/creator links */}
                                    <div className="absolute left-4 bottom-4 z-20 group-hover:translate-y-[-5px] transition-transform duration-300">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[8px] font-black text-black uppercase">
                                                {(short as any).creator?.[0] || 'S'}
                                            </div>
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">@{(short as any).creator || 'StreamLux'}</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">{short.title}</h3>
                                        <a
                                            href={`https://www.ssyoutube.com/watch?v=${youtubeId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-white transition-colors pointer-events-auto bg-black/40 px-3 py-1.5 rounded-full"
                                        >
                                            <AiOutlineDownload size={14} />
                                            DOWNLOAD CLIP
                                        </a>
                                    </div>

                                    {/* Hot Label */}
                                    <div className="absolute top-4 left-4 z-20 bg-primary/95 text-black px-2 py-0.5 rounded-sm text-[8px] font-black tracking-tighter shadow-lg">
                                        TOP PICK
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <h2 className="text-2xl text-white font-bold mb-6 flex items-center gap-2 px-4 md:px-0">
                Trending <span className="text-primary italic">Shorts</span>
                <span className="text-[10px] bg-primary text-black px-2 py-0.5 rounded ml-2">HOT</span>
            </h2>

            <div className="h-[650px] w-full max-w-[400px] mx-auto md:mx-0 rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl relative bg-black">
                <Swiper
                    direction="vertical"
                    modules={[Mousewheel, Pagination]}
                    mousewheel={true}
                    pagination={{ clickable: true }}
                    className="h-full w-full"
                    onSlideChange={(swiper) => {
                        setActiveIndex(swiper.activeIndex);
                        setIsPlaying(true); // Auto play on slide change
                    }}
                >
                    {shorts.map((short, index) => {
                        const isCurrentlyViewed = activeIndex === index;
                        const isSerpShort = short.id.toString().startsWith('serp-');
                        const youtubeId = (short as any).youtubeId || (short.url?.includes('youtube.com/shorts/') ? short.url.split('shorts/')[1]?.split('?')[0] : 'dQw4w9WgXcQ');
                        const isDirectEmbed = !isSerpShort || short.url?.includes('youtube.com');

                        return (
                            <SwiperSlide key={short.id} className="relative bg-black h-full">
                                {/* Video Container */}
                                <div
                                    className="w-full h-full cursor-pointer relative"
                                    onClick={() => {
                                        if (!isDirectEmbed && short.url) {
                                            window.open(short.url, '_blank');
                                        } else {
                                            togglePlay();
                                        }
                                    }}
                                >
                                    {Math.abs(index - activeIndex) <= 1 && isDirectEmbed ? (
                                        <iframe
                                            key={`${short.id}-${isCurrentlyViewed}`}
                                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${(isCurrentlyViewed && isPlaying) ? 1 : 0}&controls=0&loop=1&playlist=${youtubeId}&mute=${(isCurrentlyViewed && !isMuted) ? 0 : 1}&rel=0&modestbranding=1&iv_load_policy=3`}
                                            className="w-full h-full scale-[1.02]"
                                            title={short.title}
                                            frameBorder="0"
                                            allow="autoplay; encrypted-media"
                                        />
                                    ) : (
                                        <div className="w-full h-full relative overflow-hidden bg-dark">
                                            <img 
                                                src={short.poster_path} 
                                                alt={short.title} 
                                                className="w-full h-full object-cover opacity-60"
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                                                {!isDirectEmbed && (
                                                    <motion.div 
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="flex flex-col items-center gap-4"
                                                    >
                                                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,107,53,0.5)]">
                                                            <AiFillPlayCircle size={48} className="text-black" />
                                                        </div>
                                                        <span className="text-white font-black uppercase tracking-widest text-sm bg-black/60 px-4 py-2 rounded-full border border-white/10">
                                                            Watch on {short.provider || 'Platform'}
                                                        </span>
                                                    </motion.div>
                                                )}
                                                {isDirectEmbed && (
                                                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mute Overlay for Vertical */}
                                    {isDirectEmbed && (
                                        <button
                                            onClick={toggleMute}
                                            className="absolute top-6 right-16 z-30 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white pointer-events-auto"
                                        >
                                            {(isMuted || !isCurrentlyViewed) ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Overlay Info */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                                <div className="absolute right-4 bottom-28 flex flex-col gap-6 items-center z-10">
                                    <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-red-500 transition shadow-lg border border-white/5">
                                            <AiOutlineHeart size={24} className="text-white" />
                                        </div>
                                        <span className="text-xs text-white font-bold">{Math.floor(Math.random() * 900 + 100)}K</span>
                                    </button>

                                    <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-primary transition shadow-lg border border-white/5">
                                            <AiOutlineMessage size={24} className="text-white" />
                                        </div>
                                        <span className="text-xs text-white font-bold">{Math.floor(Math.random() * 50 + 5)}K</span>
                                    </button>

                                    <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition shadow-lg pointer-events-auto border border-white/5">
                                        <AiOutlineShareAlt size={24} className="text-white" />
                                    </button>

                                    {short.url && (
                                        <a
                                            href={short.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 bg-primary backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:text-primary transition shadow-lg pointer-events-auto border border-white/5 text-black"
                                            title="Open Original"
                                        >
                                            <AiOutlineDownload size={24} className="rotate-[-90deg]" />
                                        </a>
                                    )}
                                </div>

                                <div className="absolute left-6 bottom-12 z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xs uppercase">
                                            {short.provider?.[0] || (short as any).creator?.[0] || 'S'}
                                        </div>
                                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">@{short.provider || (short as any).creator || 'StreamLux'}</h3>
                                    </div>
                                    <p className="text-sm text-gray-200 w-[85%] line-clamp-2 leading-relaxed font-medium">{short.title}</p>
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                                        </div>
                                        <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Live on {short.provider || 'StreamLux'}</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </div>
    );
};

export default VerticalShorts;
