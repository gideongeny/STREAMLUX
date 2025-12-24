import { FC } from "react";
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { useYouTubeVideos } from "../../hooks/useYouTube";
import { useTMDBCollectionQuery } from "../../hooks/useCollectionQuery";
import YouTubeFilmItem from "../Common/YouTubeFilmItem";
import FilmItem from "../Common/FilmItem";
import Skeleton from "../Common/Skeleton";

interface HybridSectionSliderProps {
    title: string;
    region?: string;
    category?: string;
    type?: "movie" | "tv";
}

const HybridSectionSlider: FC<HybridSectionSliderProps> = ({
    title,
    region,
    category,
    type = "movie"
}) => {
    // 1. Parallelize fetches
    const {
        videos: ytVideos,
        loading: ytLoading,
        error: ytError
    } = useYouTubeVideos({ region, category, type });

    // Map category to TMDB genre IDs
    const categoryGenreMap: Record<string, number[]> = {
        "action": [28],
        "horror": [27],
        "documentary": [99],
        "drama": [18],
        "global": [], // Popular
    };

    // Map region to TMDB specific codes if needed
    const tmdbRegion = region === "kr" ? "korea" : region === "in" ? "bollywood" : region;
    const tmdbGenres = category ? (categoryGenreMap[category.toLowerCase()] || []) : [];

    const {
        data: tmdbVideos,
        isLoading: tmdbLoading
    } = useTMDBCollectionQuery(
        type,
        "popularity.desc",
        tmdbGenres,
        "",
        "",
        tmdbRegion || "" // Always fetch for parallelization
    );

    const isLoading = ytLoading || tmdbLoading; // Wait for both to start populating a rich list
    const hasYtVideos = ytVideos && ytVideos.length > 0;
    const hasTmdbVideos = tmdbVideos && tmdbVideos.length > 0;

    // 2. Interleave Results (Moviebox feel - Unified & Forced Parity)
    const combinedData: any[] = [];
    // Limit to 20 items for a snappy slider
    const maxLen = Math.min(20, Math.max(ytVideos?.length || 0, tmdbVideos?.length || 0));

    for (let i = 0; i < maxLen; i++) {
        // Interleave TMDB and YouTube for true variety
        if (tmdbVideos && tmdbVideos[i]) combinedData.push({ ...tmdbVideos[i], sourceType: 'tmdb' });
        if (ytVideos && ytVideos[i]) combinedData.push({ ...ytVideos[i], sourceType: 'youtube' });
    }

    // If both failed or are empty, hide the section
    if (!isLoading && combinedData.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            {/* Title section */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white mb-2">
                    {title}
                </h3>
            </div>

            {/* Slider */}
            <div className="relative">
                <Swiper
                    modules={[Navigation]}
                    navigation
                    slidesPerView="auto"
                    slidesPerGroupAuto
                    spaceBetween={20}
                    className="md:!w-[calc(100vw_-_260px_-_310px_-_2px_-_4vw_-_10px)] !w-[calc(100vw-8vw-2px)] tw-section-slider !py-2"
                >
                    {isLoading ? (
                        <>
                            {[...Array(6)].map((_, index) => (
                                <SwiperSlide key={index} className="!w-[160px] md:!w-[200px]">
                                    <div className="animate-pulse">
                                        <Skeleton className="!w-[160px] md:!w-[200px] aspect-[2/3] rounded-md" />
                                        <Skeleton className="h-4 w-3/4 mt-2 mx-auto" />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </>
                    ) : (
                        combinedData.map((item, idx) => (
                            <SwiperSlide key={item.id + idx} className="!w-[160px] md:!w-[200px]">
                                {item.sourceType === 'youtube' ? (
                                    <YouTubeFilmItem video={item} />
                                ) : (
                                    <FilmItem item={item} />
                                )}
                            </SwiperSlide>
                        ))
                    )}

                    {!isLoading && combinedData.length > 0 && (
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

export default HybridSectionSlider;
