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
    // 1. Attempt YouTube load
    const {
        videos: ytVideos,
        loading: ytLoading,
        error: ytError
    } = useYouTubeVideos({ region, category, type });

    // 2. Load TMDB as fallback (always prepare it if YouTube is sparse or failing)
    // We only trigger loading TMDB if YouTube returns few/no results or an error
    const shouldFetchTMDB = !ytLoading && (ytError || !ytVideos || ytVideos.length < 3);

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
        shouldFetchTMDB ? (tmdbRegion || "") : "" // Triggers fetch only if needed
    );

    const isLoading = ytLoading || (shouldFetchTMDB && tmdbLoading);
    const hasYtVideos = ytVideos && ytVideos.length > 0;
    const hasTmdbVideos = tmdbVideos && tmdbVideos.length > 0;

    // If both failed or are empty, hide the section
    if (!isLoading && !hasYtVideos && !hasTmdbVideos) {
        return null;
    }

    return (
        <div className="mb-8">
            {/* Title section */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    {title}
                    {hasYtVideos && !ytError ? (
                        <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-wider">Free on YouTube</span>
                    ) : (
                        <span className="bg-primary text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-wider">Global Choice</span>
                    )}
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
                    className="md:!w-[calc(100vw_-_260px_-_310px_-_2px_-_4vw_-_10px)] !w-[calc(100vw-8vw-2px)] tw-section-slider !py-2"
                >
                    {isLoading ? (
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
                    ) : hasYtVideos ? (
                        ytVideos.map((video) => (
                            <SwiperSlide key={video.id} className="!w-[220px]">
                                <YouTubeFilmItem video={video} />
                            </SwiperSlide>
                        ))
                    ) : (
                        tmdbVideos.map((item) => (
                            <SwiperSlide key={item.id} className="!w-[160px] md:!w-[200px]">
                                <FilmItem item={item} />
                            </SwiperSlide>
                        ))
                    )}

                    {!isLoading && (hasYtVideos || hasTmdbVideos) && (
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
