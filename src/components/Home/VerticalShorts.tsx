import { FC, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { AiOutlineHeart, AiOutlineMessage, AiOutlineShareAlt, AiFillPlayCircle } from "react-icons/ai";

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

const VerticalShorts: FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const togglePlay = () => setIsPlaying(!isPlaying);

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
                                <iframe
                                    src={`https://www.youtube.com/embed/${short.videoId}?autoplay=${activeIndex === index && isPlaying ? 1 : 0}&controls=0&loop=1&playlist=${short.videoId}&mute=0&rel=0&modestbranding=1&iv_load_policy=3`}
                                    className="w-full h-full pointer-events-none scale-[1.02]"
                                    title={short.title}
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                />

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
