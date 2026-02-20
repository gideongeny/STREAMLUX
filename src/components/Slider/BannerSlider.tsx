import { FC, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper";
import { BannerInfo, Item } from "../../shared/types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { resizeImage } from "../../shared/utils";
import { AiFillStar } from "react-icons/ai";
import { Link } from "react-router-dom";
import { BsFillPlayFill } from "react-icons/bs";
import Skeleton from "../Common/Skeleton";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
interface BannerSliderProps {
  films: Item[] | undefined;
  dataDetail: BannerInfo[] | undefined;
  isLoadingBanner: boolean;
}

const BannerSlider: FC<BannerSliderProps> = ({
  films,
  dataDetail,
  isLoadingBanner,
}) => {
  const { isMobile } = useCurrentViewportView();

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="mt-6 relative w-full h-0 md:pb-[35%] pb-[56.25%] tw-banner-slider bg-dark-lighten rounded-lg overflow-hidden max-h-[85vh]">
      {isLoadingBanner || !films ? (
        <Skeleton className="absolute top-0 left-0 w-full h-full !rounded-lg" />
      ) : (
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 30000, disableOnInteraction: false }}
          slidesPerView={1}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="!absolute !top-0 !left-0 !w-full !h-full  !rounded-lg"
        >
          {films.map((film, index) => (
            <SwiperSlide key={film.id}>
              <div className="relative w-full h-full">
                {/* Trailer Video Player - Enhanced with better controls */}
                {activeIndex === index && dataDetail?.[index]?.trailer && (
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${dataDetail[index].trailer}?autoplay=1&mute=1&controls=0&loop=1&playlist=${dataDetail[index].trailer}&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`}
                      className={`absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 scale-125 transition-opacity duration-1000 ${isMobile ? 'opacity-40' : 'opacity-60'
                        }`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen={false}
                      title="Film Trailer"
                      style={{ pointerEvents: 'none' }}
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
                  className="group relative z-10 block w-full h-full"
                >
                  <LazyLoadImage
                    src={resizeImage(film.backdrop_path, "w1280")}
                    alt="Backdrop image"
                    effect="blur"
                    className={`w-full h-full object-cover transition-opacity duration-1000 ${activeIndex === index && dataDetail?.[index]?.trailer && !isMobile ? 'opacity-0' : 'opacity-100'}`}
                    style={{ display: 'block' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.backgroundColor = '#1C1C1E';
                    }}
                  />

                  <div className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none tw-black-backdrop group-hover:bg-[#00000026] transition duration-700"></div>

                  <div className="hidden md:flex absolute top-[5%] right-[3%] bg-primary px-3 py-1 rounded-full text-white  items-center gap-1">
                    <span>{film.vote_average.toFixed(1)}</span>
                    <AiFillStar size={15} />
                  </div>

                  <div className="tw-absolute-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#c353b4] tw-flex-center z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-700">
                    <BsFillPlayFill size={35} className="text-white" />
                  </div>

                  <div className="absolute top-1/2 -translate-y-1/2 left-[5%] md:max-w-2xl max-w-[280px]">
                    {film.media_type === "sports" ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-6 md:gap-10">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 md:w-28 md:h-28 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center justify-center border border-white/20 shadow-2xl">
                              <img src={(film as any).homeLogo} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                            </div>
                            <span className="text-white font-bold text-xs md:text-sm text-center uppercase tracking-tighter">{(film as any).homeTeam || 'Home'}</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <span className="text-primary font-black text-2xl md:text-5xl italic drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">VS</span>
                          </div>

                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 md:w-28 md:h-28 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center justify-center border border-white/20 shadow-2xl">
                              <img src={(film as any).awayLogo} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                            </div>
                            <span className="text-white font-bold text-xs md:text-sm text-center uppercase tracking-tighter">{(film as any).awayTeam || 'Away'}</span>
                          </div>
                        </div>

                        <h2 className="md:text-4xl text-xl text-white font-black tracking-tight drop-shadow-xl mt-2">
                          {film.title || film.name}
                        </h2>
                      </div>
                    ) : (
                      <h2 className="md:text-5xl text-xl  text-primary font-black tracking-wide md:tw-multiline-ellipsis-2 tw-multiline-ellipsis-3 drop-shadow-lg">
                        {film.title || film.name}
                      </h2>
                    )}

                    <div>
                      <p className="text-white font-semibold md:text-2xl text-base mt-6 drop-shadow-md">
                        {dataDetail?.[index].translation[0]}
                      </p>
                      <p className="mt-1 text-primary/90 font-bold uppercase tracking-widest text-xs md:text-sm">
                        {film.release_date && film.release_date}
                      </p>
                      {!isMobile && (
                        <>
                          <div className="flex gap-2 flex-wrap mt-5">
                            {dataDetail?.[index].genre.map((genre) => (
                              <div
                                className="px-3 py-1 border border-primary/40 rounded-full bg-primary/10 backdrop-blur-sm text-xs font-bold text-white uppercase tracking-wider"
                                key={genre.id}
                              >
                                {genre.name}
                              </div>
                            ))}
                          </div>
                          <p className=" mt-3 text-base tw-multiline-ellipsis-3 text-gray-200 drop-shadow-md bg-black/20 p-2 rounded backdrop-blur-xs">
                            {film.overview}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          ))}

          {/* The navigation button is so small that users could miss clicking it and as a result clicking the Link, which is not what the user want (they want to navigate to other films, not choosing the current films on banner slider), so I create this transparent div, put it above the link but below the navigation button, so when the user miss clicking the navigation button, the user click this div instead of the link to the movie, so nothing will happen and the user can try clicking the button again. 
          It's important to note that this div has pointer event set to "auto" instead of "none" for this logic to work*/}
          <div className="absolute top-0 left-0 w-[8%] h-[11%] z-10"></div>
        </Swiper>
      )}
    </div>
  );
};

export default BannerSlider;
