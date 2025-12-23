import { FC, useState } from "react";
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { useYouTubeVideos } from "../../hooks/useYouTube";
import YouTubeFilmItem from "../Common/YouTubeFilmItem";
import Skeleton from "../Common/Skeleton";
import VideoPlayerModal from "../Explore/VideoPlayerModal";

interface YouTubeSectionSliderProps {
    title: string;
    region?: string;
    category?: string;
    type?: "movie" | "tv";
}

const YouTubeSectionSlider: FC<YouTubeSectionSliderProps> = ({
    title,
    region,
    category,
    type = "movie"
}) => {
    const { videos, loading, error } = useYouTubeVideos({ region, category, type });

    if (error && !loading) return null; // Hide if error and no data

    return (
        <div className="mb-8">
            {/* Title section */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    {title}
                    <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-wider">Free on YouTube</span>
                </h3>
            </div>

            {/* Slider */}
            <div className="relative">
                <Swiper
                    modules={[Navigation]}
                    navigation
                    slidesPerView="auto"
                    slidesPerGroupAuto
                    spaceBetween={30}
                    loop={videos && videos.length > 5}
                    className="md:!w-[calc(100vw_-_260px_-_310px_-_2px_-_4vw_-_10px)] !w-[calc(100vw-8vw-2px)] tw-section-slider !py-2"
                >
                    {loading ? (
                        <>
                            {[...Array(6)].map((_, index) => (
                                <SwiperSlide key={index} className="!w-[220px]">
                                    <div className="animate-pulse">
                                        <Skeleton className="!w-[220px] aspect-video rounded-md" />
                                        <Skeleton className="h-4 w-3/4 mt-2 mx-auto" />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </>
                    ) : (
                        videos?.map((video) => (
                            <SwiperSlide key={video.id} className="!w-[220px]">
                                <YouTubeFilmItem video={video} />
                            </SwiperSlide>
                        ))
                    )}

                    {!loading && videos && (
                        <>
                            <div className="absolute top-[2%] left-0 right-0 h-[83%] z-10 pointer-events-none tw-black-backdrop-2" />
                            <div className="absolute top-0 left-0 w-[4%] h-full z-10"></div>
                            <div className="absolute top-0 right-0 w-[4%] h-full z-10"></div>
                        </>
                    )}
                </Swiper>
            </div>

        </div>
    );
};

export default YouTubeSectionSlider;
