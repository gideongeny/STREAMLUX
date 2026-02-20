import { FC, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { AiOutlineHeart, AiOutlineMessage, AiOutlineShareAlt, AiFillPlayCircle, AiOutlineDownload } from "react-icons/ai";

const shortsData = [
    {
        id: "s1",
        title: "The CEO's Secret Wife",
        creator: "DramaBox",
        videoId: "dQw4w9WgXcQ",
        likes: "1.2M",
        comments: "45K"
    },
    {
        id: "s2",
        title: "Revenge of the Billionaire",
        creator: "ReelShort",
        videoId: "3JZ_D3ELwOQ",
        likes: "890K",
        comments: "12K"
    },
    {
        id: "s3",
        title: "Lost Daughter of the Mogul",
        creator: "ShortMax",
        videoId: "9bZkp7q19f0",
        likes: "2.4M",
        comments: "120K"
    },
    {
        id: "s4",
        title: "The Silent Heir",
        creator: "DramaBox",
        videoId: "L_jWHffIx5E",
        likes: "560K",
        comments: "8.2K"
    },
    {
        id: "s5",
        title: "Undercover Billionaire",
        creator: "ShortMax",
        videoId: "kJQP7kiw5Fk",
        likes: "3.1M",
        comments: "210K"
    }
];

export interface VerticalShortsProps {
    variant?: "vertical" | "horizontal";
}

const VerticalShorts: FC<VerticalShortsProps> = ({ variant = "vertical" }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

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
                    }}
                    className="!pb-10 overflow-visible"
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                >
                    {shortsData.map((short, index) => {
                        // LAZY LOADING: Only load iframe if it's active or adjacent
                        const isNear = Math.abs(index - activeIndex) <= 1;

                        return (
                            <SwiperSlide key={short.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 group bg-black shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
                                {/* Video */}
                                <div className="w-full h-full cursor-pointer relative" onClick={togglePlay}>
                                    {isNear ? (
                                        <iframe
                                            key={`${short.id}-${activeIndex === index}`}
                                            src={`https://www.youtube.com/embed/${short.videoId}?autoplay=1&controls=0&loop=1&playlist=${short.videoId}&mute=${(activeIndex === index && !isMuted) ? 0 : 1}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1`}
                                            className="w-full h-full pointer-events-none scale-[1.05]"
                                            title={short.title}
                                            frameBorder="0"
                                            allow="autoplay; encrypted-media"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#111] animate-pulse flex items-center justify-center">
                                            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        </div>
                                    )}

                                    {/* Overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                                    {/* Mute/Unmute Logic */}
                                    <button
                                        onClick={toggleMute}
                                        className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-primary transition-colors text-white hover:text-black"
                                    >
                                        {isMuted ? (
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

                                    {/* Info */}
                                    <div className="absolute left-4 bottom-4 z-20 pointer-events-none group-hover:translate-y-[-5px] transition-transform duration-300">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[8px] font-black text-black">
                                                {short.creator[0]}
                                            </div>
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">@{short.creator}</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">{short.title}</h3>
                                        <a
                                            href={`https://www.ssyoutube.com/watch?v=${short.videoId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-white transition-colors pointer-events-auto"
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
                    {shortsData.map((short, index) => (
                        <SwiperSlide key={short.id} className="relative bg-black h-full">
                            {/* Video Container */}
                            <div
                                className="w-full h-full cursor-pointer relative"
                                onClick={togglePlay}
                            >
                                {activeIndex === index ? (
                                    <iframe
                                        key={`${short.id}-active`}
                                        src={`https://www.youtube.com/embed/${short.videoId}?autoplay=${isPlaying ? 1 : 0}&controls=0&loop=1&playlist=${short.videoId}&mute=${!isMuted ? 0 : 1}&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
                                        className="w-full h-full pointer-events-none scale-[1.02]"
                                        title={short.title}
                                        frameBorder="0"
                                        allow="autoplay; encrypted-media"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#050505] flex items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    </div>
                                )}

                                {/* Mute Overlay for Vertical */}
                                <button
                                    onClick={toggleMute}
                                    className="absolute top-6 right-16 z-30 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white pointer-events-auto"
                                >
                                    {isMuted ? (
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

                                {/* Play/Pause Indicator Overlay */}
                                {!isPlaying && activeIndex === index && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 transition-opacity">
                                        <AiFillPlayCircle size={80} className="text-white/80 animate-pulse" />
                                    </div>
                                )}
                            </div>

                            {/* Overlay Info */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute right-4 bottom-28 flex flex-col gap-6 items-center z-10">
                                <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-red-500 transition shadow-lg border border-white/5">
                                        <AiOutlineHeart size={24} className="text-white" />
                                    </div>
                                    <span className="text-xs text-white font-bold">{short.likes}</span>
                                </button>

                                <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-primary transition shadow-lg border border-white/5">
                                        <AiOutlineMessage size={24} className="text-white" />
                                    </div>
                                    <span className="text-xs text-white font-bold">{short.comments}</span>
                                </button>

                                <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition shadow-lg pointer-events-auto border border-white/5">
                                    <AiOutlineShareAlt size={24} className="text-white" />
                                </button>

                                <a
                                    href={`https://www.ssyoutube.com/watch?v=${short.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 bg-primary backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:text-primary transition shadow-lg pointer-events-auto border border-white/5 text-black"
                                    title="Download Short"
                                >
                                    <AiOutlineDownload size={24} />
                                </a>
                            </div>

                            <div className="absolute left-6 bottom-12 z-10 pointer-events-none">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xs">
                                        {short.creator[0]}
                                    </div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">@{short.creator}</h3>
                                </div>
                                <p className="text-sm text-gray-200 w-[85%] line-clamp-2 leading-relaxed font-medium">{short.title}</p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                                    </div>
                                    <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Original StreamLux Audio</span>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default VerticalShorts;
