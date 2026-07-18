import { FC, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper";
import { BannerInfo, Item } from "../../shared/types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { resizeImage } from "../../shared/utils";
import { AiFillStar } from "react-icons/ai";
import { Link } from "react-router-dom";
import { BsFillPlayFill, BsVolumeMuteFill, BsVolumeUpFill, BsDownload } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../Common/Skeleton";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { downloadService } from "../../services/download";
import HeroTrailer from "../Home/HeroTrailer";

interface BannerSliderProps {
  films: Item[] | undefined;
  dataDetail: BannerInfo[] | undefined;
  isLoadingBanner: boolean;
  onActiveImageChange?: (imageUrl: string) => void;
}

const BannerSlider: FC<BannerSliderProps> = ({
  films,
  dataDetail,
  isLoadingBanner,
  onActiveImageChange,
}) => {
  const { isMobile } = useCurrentViewportView();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [trailerReadyIndex, setTrailerReadyIndex] = useState<number | null>(null);

  // Elite Optimization: Preload backdrops for next slides
  useEffect(() => {
    if (!films || films.length === 0) return;

    // Preload next 2 slides for instant switching
    const nextIndices = films.length > 0 ? [(activeIndex + 1) % films.length, (activeIndex + 2) % films.length] : [];
    nextIndices.forEach(idx => {
      if (films[idx]?.backdrop_path) {
        const img = new Image();
        img.src = resizeImage(films[idx].backdrop_path, "w1280");
      }
    });
  }, [activeIndex, films]);

  useEffect(() => {
    // Hide the trailer immediately when slide changes
    setTrailerReadyIndex(null);
    
    // If a trailer exists for this slide, reveal it after 2 seconds to allow buffer/autoplay
    // This provides a smooth "still image -> video" cinematic transition
    const currentFilm = films?.[activeIndex];
    const currentDetail = dataDetail?.find(d => Number(d.id) === Number(currentFilm?.id));

    if (currentDetail?.trailer) {
      const timer = setTimeout(() => {
        setTrailerReadyIndex(activeIndex);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, dataDetail, films]);

  return (
    <div className="relative w-full h-0 md:pb-[42%] pb-[110%] tw-banner-slider bg-cinema-black overflow-hidden max-h-[90vh] -mx-[4vw] md:-mx-[2vw] !w-[calc(100%+8vw)] md:!w-[calc(100%+4vw)]">
      {isLoadingBanner || !films ? (
        <Skeleton className="absolute top-0 left-0 w-full h-full !rounded-lg" />
      ) : (
        <>
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 30000, disableOnInteraction: false }}
            slidesPerView={1}
            onSlideChange={(swiper) => {
              const index = swiper.activeIndex;
              setActiveIndex(index);
              if (onActiveImageChange && films[index]) {
                onActiveImageChange(resizeImage(films[index].backdrop_path, "w1280"));
              }
            }}
            className="!absolute !top-0 !left-0 !w-full !h-full !rounded-none md:!rounded-lg"
          >
            {films.map((film, index) => (
              <SwiperSlide key={film.id}>
                <div className="relative w-full h-full">
                  {/* Poster image - always visible as base layer */}
                  <LazyLoadImage
                    src={resizeImage(film.backdrop_path, "w1280")}
                    alt="Backdrop image"
                    effect="blur"
                    className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
                    style={{ display: 'block', zIndex: 1 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.backgroundColor = '#1C1C1E';
                    }}
                  />

                  {/* Dark gradient overlay (always on) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" style={{ zIndex: 2 }} />
                  {/* Bottom cinematic fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-[60%] md:h-[40%] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" style={{ zIndex: 2 }} />

                  {/* Trailer Video Player - Using fixed HeroTrailer with watchdog & fallback */}
                  {activeIndex === index && (
                    <div className="absolute inset-0 overflow-hidden hidden md:block" style={{ zIndex: 1.5 }}>
                      <HeroTrailer
                        isActive={trailerReadyIndex === index}
                        mediaId={Number(film.id)}
                        mediaType={film.media_type as "movie" | "tv"}
                        youtubeId={dataDetail?.find(d => Number(d.id) === Number(film.id))?.trailer}
                        muted={isMuted}
                        fallbackImageUrl={film.poster_path || film.backdrop_path}
                      />
                    </div>
                  )}

                  <Link
                    to={
                      film.media_type === "movie"
                        ? `/movie/${film.id}`
                        : film.media_type === "tv"
                          ? `/tv/${film.id}`
                          : `/sports/${film.id}/watch`
                    }
                    className="group absolute inset-0 block"
                    style={{ zIndex: 3 }}
                  >
                    {/* Rating badge */}
                    {film.vote_average != null && film.vote_average > 0 && (
                      <div className="absolute top-[5%] right-[5%] md:right-[3%] bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full text-white flex items-center gap-1 shadow-lg" style={{ zIndex: 4 }}>
                        <span className="font-bold">{(film.vote_average || 0).toFixed(1)}</span>
                        <AiFillStar size={15} className="text-yellow-400" />
                      </div>
                    )}

                    {/* Play button */}
                    <div className="tw-absolute-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary via-primary to-accent-ember tw-flex-center z-10 md:opacity-0 md:invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 shadow-neon-primary hover:scale-110">
                      <BsFillPlayFill size={30} className="text-white md:w-9 md:h-9" />
                    </div>

                    <div className="absolute bottom-[10%] md:bottom-auto md:top-1/2 md:-translate-y-1/2 left-[5%] right-[5%] md:right-auto md:max-w-2xl">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${film.id}-${activeIndex}`}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="flex flex-col items-center text-center md:items-start md:text-left"
                        >
                          {film.media_type === "sports" ? (
                            <div className="flex flex-col gap-4 w-full">
                              <div className="flex items-center justify-center md:justify-start gap-4 md:gap-10">
                                <div className="flex flex-col items-center gap-2">
                                  <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-16 h-16 md:w-28 md:h-28 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center justify-center border border-white/20 shadow-2xl"
                                  >
                                    <img src={(film as any).homeLogo} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                                  </motion.div>
                                  <span className="text-white font-bold text-xs md:text-sm text-center uppercase tracking-tighter">{(film as any).homeTeam || 'Home'}</span>
                                </div>

                                <div className="flex flex-col items-center">
                                  <span className="text-primary font-black text-2xl md:text-5xl italic drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">VS</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <motion.div
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                    className="w-16 h-16 md:w-28 md:h-28 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center justify-center border border-white/20 shadow-2xl"
                                  >
                                    <img src={(film as any).awayLogo} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                                  </motion.div>
                                  <span className="text-white font-bold text-xs md:text-sm text-center uppercase tracking-tighter">{(film as any).awayTeam || 'Away'}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-col items-center md:items-start mb-4 md:mb-6 w-full">
                              {(() => {
                                const currentDetail = dataDetail?.find(d => Number(d.id) === Number(film.id));
                                return currentDetail?.logo ? (
                                  <motion.img
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    src={resizeImage(currentDetail.logo, "w500")}
                                    alt="Film Logo"
                                    className="h-16 sm:h-20 md:h-28 object-contain mb-2 md:mb-4 drop-shadow-[0_0_25px_rgba(0,0,0,0.5)]"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'block';
                                    }}
                                  />
                                ) : null;
                              })()}
                              <h2 
                                className={`text-4xl sm:text-5xl md:text-8xl text-white font-black tracking-tighter uppercase italic leading-none sl-text-gradient ${dataDetail?.find(d => Number(d.id) === Number(film.id))?.logo ? 'hidden' : 'block'}`}
                              >
                                {film.title || film.name}
                              </h2>
                            </div>
                              {/* MovieBox Style Meta info overlay */}
                              <div className="flex items-center gap-3 text-gray-300 font-bold text-sm mb-4">
                                <img src="/icons/tmdb.svg" alt="" className="w-5 h-5 grayscale opacity-70" />
                                <span>{film.release_date?.split('-')[0] || film.first_air_date?.split('-')[0] || "2026"}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                <span className="text-xs uppercase tracking-widest">{dataDetail?.find(d => Number(d.id) === Number(film.id))?.genre?.[0]?.name || "Premium"}</span>

                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const info = downloadService.generateDownloadInfo(film as any, film.media_type as "movie" | "tv");
                                    downloadService.smartRedirect(info);
                                  }}
                                  className="ml-4 w-10 h-10 rounded-full bg-primary/20 backdrop-blur-xl flex items-center justify-center text-primary border border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 shadow-lg shadow-primary/20"
                                >
                                  <BsDownload size={20} />
                                </button>
                              </div>
                            </>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="hidden md:block" // Keep description on desktop only for clean mobile look
                          >
                            <p className="text-white font-semibold text-lg mt-2 drop-shadow-md tw-multiline-ellipsis-2">
                              {film.overview}
                            </p>
                          </motion.div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}

            {/* Navigation Overlay Safety */}
            <div className="absolute top-0 left-0 w-[8%] h-[11%] z-10"></div>
          </Swiper>

          {/* Mute/Unmute Toggle Button */}
          <div className="absolute bottom-[5%] right-[3%] z-[50]">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMuted(!isMuted)}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-[40px] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white hover:bg-primary/80 hover:border-primary/30 transition-all duration-500 shadow-cinema-card"
              title={isMuted ? "Unmute Trailer" : "Mute Trailer"}
            >
              {isMuted ? <BsVolumeMuteFill size={22} /> : <BsVolumeUpFill size={22} />}
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSlider;
