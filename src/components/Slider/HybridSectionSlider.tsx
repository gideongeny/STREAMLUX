import { FC, useMemo } from "react";
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { useYouTubeVideos } from "../../hooks/useYouTube";
import { useTMDBCollectionQuery } from "../../hooks/useCollectionQuery";
import YouTubeFilmItem from "../Common/YouTubeFilmItem";
import FilmItem from "../Common/FilmItem";
import Skeleton from "../Common/Skeleton";

// Static constant to prevent reference changes
const EMPTY_ARRAY: number[] = [];
const CATEGORY_GENRE_MAP: Record<string, number[]> = {
    "action": [28],
    "horror": [27],
    "documentary": [99],
    "drama": [18],
    "global": [], // Popular
};

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
}: HybridSectionSliderProps) => {
    // 1. Parallelize fetches
    const {
        videos: ytVideos,
        loading: ytLoading,
        error: ytError
    } = useYouTubeVideos({ region, category, type });

    // Map region to TMDB specific codes if needed
    const tmdbRegion = region === "kr" ? "korea" : region === "in" ? "bollywood" : region;

    // Memoize genres to prevent infinite loop in useTMDBCollectionQuery
    const tmdbGenres = useMemo(() =>
        category ? (CATEGORY_GENRE_MAP[category.toLowerCase()] || EMPTY_ARRAY) : EMPTY_ARRAY
        , [category]);

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

    const hasYtVideos = ytVideos && ytVideos.length > 0;
    const hasTmdbVideos = tmdbVideos && tmdbVideos.length > 0;

    // Optimized Loading: Show content as soon as ANY source is ready.
    // If we have TMDB videos, we don't need to wait for YouTube (and vice-versa).
    // Only show loading if BOTH are loading, or if one is loading and the other has no data.
    const isLoading = (ytLoading && tmdbLoading) || (ytLoading && !hasTmdbVideos) || (tmdbLoading && !hasYtVideos);

    // 2. Interleave Results (Moviebox feel - Unified & Forced Parity)
    const combinedData = useMemo(() => {
        const combined: any[] = [];
        const maxLen = Math.max(ytVideos?.length || 0, tmdbVideos?.length || 0);

        for (let i = 0; i < maxLen; i++) {
            // Prioritize TMDB (High Quality)
            if (tmdbVideos && tmdbVideos[i]) {
                combined.push({ ...tmdbVideos[i], sourceType: 'tmdb' });
            }
            // Interleave YouTube (Variety)
            if (ytVideos && ytVideos[i]) {
                combined.push({ ...ytVideos[i], sourceType: 'youtube', poster_path: ytVideos[i].thumbnail });
            }
        }
        return combined;
    }, [ytVideos, tmdbVideos]);

    // If fully loaded and no data, hide section
    if (!ytLoading && !tmdbLoading && combinedData.length === 0) {
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
                    className="w-full tw-section-slider !py-2"
                >
                    {isLoading ? (
                        <>
                            {[...Array(6)].map((_, index) => (
                                <SwiperSlide key={`skeleton-${index}`} className="!w-[160px] md:!w-[200px]">
                                    <div className="animate-pulse">
                                        <Skeleton className="!w-[160px] md:!w-[200px] aspect-[2/3] rounded-md" />
                                        <Skeleton className="h-4 w-3/4 mt-2 mx-auto" />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </>
                    ) : (
                        combinedData.map((item, idx) => (
                            <SwiperSlide key={`${item.sourceType}-${item.id}-${idx}`} className="!w-[160px] md:!w-[200px]">
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
