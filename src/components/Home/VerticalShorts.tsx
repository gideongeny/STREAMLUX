import { FC } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { AiOutlineHeart, AiOutlineMessage, AiOutlineShareAlt } from "react-icons/ai";

const shortsData = [
    {
        id: "s1",
        title: "The CEO's Secret Wife",
        creator: "DramaBox",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&loop=1&playlist=dQw4w9WgXcQ", // Placeholder
        likes: "1.2M",
        comments: "45K"
    },
    {
        id: "s2",
        title: "Revenge of the Billionaire",
        creator: "ReelShort",
        videoUrl: "https://www.youtube.com/embed/3JZ_D3ELwOQ?autoplay=0&controls=0&loop=1&playlist=3JZ_D3ELwOQ", // Placeholder
        likes: "890K",
        comments: "12K"
    },
    {
        id: "s3",
        title: "Lost Daughter of the Mogul",
        creator: "ShortMax",
        videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0?autoplay=0&controls=0&loop=1&playlist=9bZkp7q19f0", // Placeholder
        likes: "2.4M",
        comments: "120K"
    }
];

const VerticalShorts: FC = () => {
    return (
        <div className="mb-12">
            <h2 className="text-2xl text-white font-bold mb-6 flex items-center gap-2 px-4 md:px-0">
                Trending <span className="text-primary italic">Shorts</span>
                <span className="text-[10px] bg-primary text-black px-2 py-0.5 rounded ml-2">HOT</span>
            </h2>

            <div className="h-[600px] w-full max-w-[400px] mx-auto md:mx-0 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative">
                <Swiper
                    direction="vertical"
                    modules={[Mousewheel, Pagination]}
                    mousewheel={true}
                    pagination={{ clickable: true }}
                    className="h-full w-full"
                >
                    {shortsData.map((short) => (
                        <SwiperSlide key={short.id} className="relative bg-black">
                            <iframe
                                src={short.videoUrl}
                                className="w-full h-full pointer-events-none"
                                title={short.title}
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                            />

                            {/* Overlay Info */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
                                <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-red-500 transition shadow-lg">
                                        <AiOutlineHeart size={24} className="text-white" />
                                    </div>
                                    <span className="text-xs text-white font-bold">{short.likes}</span>
                                </button>

                                <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-primary transition shadow-lg">
                                        <AiOutlineMessage size={24} className="text-white" />
                                    </div>
                                    <span className="text-xs text-white font-bold">{short.comments}</span>
                                </button>

                                <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition shadow-lg pointer-events-auto">
                                    <AiOutlineShareAlt size={24} className="text-white" />
                                </button>
                            </div>

                            <div className="absolute left-6 bottom-10 z-10 pointer-events-none">
                                <h3 className="text-xl font-bold text-white mb-1">@{short.creator}</h3>
                                <p className="text-sm text-gray-300 w-2/3 line-clamp-2">{short.title}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-4 h-4 bg-primary rounded-full animate-spin" />
                                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Original Audio</span>
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
