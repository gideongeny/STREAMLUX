import { FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FiX, FiPlay } from "react-icons/fi";
import "swiper/css";
import { resizeImage } from "../../shared/utils";
import axios from "../../shared/axios";
import { Item } from "../../shared/types";

const CinematicMoments: FC = () => {
    const [activeStory, setActiveStory] = useState<any>(null);
    const [trending, setTrending] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await axios.get("/trending/all/day");
                const results = (res.data.results as Item[]).filter(i =>
                    i.poster_path || i.backdrop_path || i.profile_path
                );
                setTrending(results.slice(0, 10));
            } catch (err) {
                console.error("Failed to fetch moments:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeStory) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        const nextIdx = (currentIndex + 1) % trending.length;
                        handleOpenStory(nextIdx);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 100); // 10 seconds per story (100 * 100ms)
        }
        return () => clearInterval(interval);
    }, [activeStory, currentIndex, trending.length]);

    const handleOpenStory = async (index: number) => {
        const item = trending[index];
        setCurrentIndex(index);
        try {
            const res = await axios.get(`/${item.media_type}/${item.id}/videos`);
            const trailer = res.data.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
            setActiveStory({ ...item, videoId: trailer?.key || "dQw4w9WgXcQ" });
        } catch (err) {
            setActiveStory({ ...item, videoId: "dQw4w9WgXcQ" });
        }
    };

    if (isLoading) return (
        <div className="my-8 flex gap-4 overflow-hidden px-1">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-20 h-20 rounded-full bg-white/5 animate-pulse shrink-0" />
            ))}
        </div>
    );

    return (
        <div className="my-8 overflow-hidden">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-1">Cinematic <span className="text-primary">Moments</span></h2>

            <Swiper
                spaceBetween={15}
                slidesPerView="auto"
                className="!overflow-visible"
            >
                {trending.map((item, index) => (
                    <SwiperSlide key={item.id} className="!w-20">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleOpenStory(index)}
                            className="relative group"
                        >
                            <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-primary via-blue-500 to-purple-600 animate-pulse transition-all group-hover:shadow-[0_0_20px_rgba(255,107,53,0.5)]">
                                <div className="w-full h-full rounded-full border-2 border-dark overflow-hidden bg-dark">
                                    <img
                                        src={resizeImage(item.profile_path || item.poster_path || item.backdrop_path || "", "w154")}
                                        alt=""
                                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                                    />
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:animate-pulse">
                                <FiPlay size={18} className="text-white drop-shadow-md" />
                            </div>
                        </motion.button>
                        <p className="text-[10px] text-center mt-2 text-gray-500 font-bold uppercase truncate max-w-full">{item.title?.split(" ")[0] || item.name?.split(" ")[0]}</p>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Story Modal */}
            <AnimatePresence>
                {activeStory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl"
                    >
                        <button
                            onClick={() => setActiveStory(null)}
                            className="absolute top-8 right-8 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                        >
                            <FiX size={24} />
                        </button>

                        <div className="relative w-full max-w-[450px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                            {/* Progress Bars */}
                            <div className="absolute top-4 left-0 right-0 z-50 px-4 flex gap-1.5">
                                {trending.map((_, i) => (
                                    <div key={i} className="h-1 flex-grow rounded-full bg-white/20 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary"
                                            initial={{ width: 0 }}
                                            animate={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? "100%" : "0%" }}
                                            transition={{ ease: "linear", duration: 0.1 }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <iframe
                                src={`https://www.youtube.com/embed/${activeStory.videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&iv_load_policy=3`}
                                className="w-full h-full scale-[1.05]"
                                allow="autoplay; encrypted-media"
                            />

                            <div className="absolute top-6 left-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                                    <img src={resizeImage(activeStory.poster_path || "", "w92")} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase text-sm tracking-tight">{activeStory.title || activeStory.name}</h3>
                                    <p className="text-primary text-[10px] font-bold">LIVE ON STREAMLUX</p>
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-0 right-0 px-8">
                                <button className="w-full py-4 bg-white text-black font-black uppercase tracking-tighter rounded-2xl hover:bg-primary transition shadow-xl"
                                    onClick={() => window.location.href = `/${activeStory.media_type}/${activeStory.id}`}
                                >
                                    Watch Full Feature
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CinematicMoments;
