import { FC, useState } from "react";
import HeroTrailer from "../Home/HeroTrailer";
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

  // Show skeleton if loading OR if films is empty/undefined
  const shouldShowSkeleton = isLoadingBanner || !films || films.length === 0;

  return (
    <div className="mt-6 relative w-full aspect-[4/5] md:aspect-video lg:aspect-[21/9] max-h-[75vh] md:max-h-[500px] lg:max-h-[600px] tw-banner-slider bg-dark-lighten rounded-lg overflow-hidden shadow-2xl">
      {shouldShowSkeleton ? (
        <Skeleton className="absolute top-0 left-0 w-full h-full !rounded-lg" />
      ) : (
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 8000, disableOnInteraction: false }} // 8s for trailer
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          slidesPerView={1}
          className="!absolute !top-0 !left-0 !w-full !h-full  !rounded-lg"
        >
          {Array.isArray(films) && films.map((film, index) => (
            <SwiperSlide key={film.id}>
              <Link
                to={
                  film.media_type === "movie"
                    ? `/movie/${film.id}`
                    : film.media_type === "tv"
                      ? `/tv/${film.id}`
                      : typeof film.id === 'string' && (film.id as string).includes('/')
                        ? `/sports/${film.id}/watch`
                        : `/sports/all/${film.id}/watch`
                }
                className="group block w-full h-full"
              >
                <img
                  src={resizeImage(film.backdrop_path, "w1280")}
                  alt={film.title || film.name}
                  className="w-full h-full object-cover object-center transition-opacity duration-500"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#1a1a1c',
                    backgroundImage: 'linear-gradient(to bottom, #1a1a1c, #0d0d0f)'
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '1';
                  }}
                  onError={(e) => {
                    // Fallback to a nice gradient if image fails
                    const el = e.target as HTMLImageElement;
                    el.style.backgroundImage = 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)';
                    el.style.opacity = '0.5';
                  }}
                />

                {!isMobile && (
                  <HeroTrailer
                    mediaId={film.id}
                    mediaType={film.media_type as "movie" | "tv"}
                    isActive={index === activeIndex}
                  />
                )}

                {/* Overlays (Backdrop and Metadata) - Must be after Trailer to take precedence */}
                <div className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none tw-black-backdrop group-hover:bg-[#00000026] transition duration-700 z-[5]"></div>

                <div className="absolute top-1/2 -translate-y-1/2 left-[5%] md:max-w-md max-w-[200px] z-10">
                  <h2 className="md:text-5xl text-xl  text-primary font-black tracking-wide md:tw-multiline-ellipsis-2 tw-multiline-ellipsis-3">
                    {film.title || film.name}
                  </h2>

                  {film.media_type === "sports" && (film.homeLogo || film.awayLogo) && (
                    <div className="flex items-center gap-4 md:gap-8 mt-4 md:mt-6 mb-2">
                      {film.homeLogo && (
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-white/10 rounded-full p-2 flex items-center justify-center backdrop-blur-md border border-white/20">
                          <img src={film.homeLogo} alt="Home" className="w-full h-full object-contain drop-shadow-2xl" />
                        </div>
                      )}
                      <span className="text-white font-black text-xl md:text-3xl italic opacity-80">VS</span>
                      {film.awayLogo && (
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-white/10 rounded-full p-2 flex items-center justify-center backdrop-blur-md border border-white/20">
                          <img src={film.awayLogo} alt="Away" className="w-full h-full object-contain drop-shadow-2xl" />
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-white font-semibold md:text-2xl text-base mt-6">
                      {dataDetail?.[index]?.translation?.[0]}
                    </p>
                    <p className="mt-1">
                      {film.release_date &&
                        `Release date: ${film.release_date}`}
                      {film.first_air_date &&
                        `First air date: ${film.first_air_date}`}
                    </p>
                    {!isMobile && (
                      <>
                        <div className="flex gap-2 flex-wrap mt-5">
                          {dataDetail?.[index]?.genre?.map((genre) => (
                            <div
                              className="px-3 py-1 border rounded-full "
                              key={genre.id}
                            >
                              {genre.name}
                            </div>
                          ))}
                        </div>
                        <p className=" mt-3 text-base tw-multiline-ellipsis-3">
                          {film.overview}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="hidden md:flex absolute top-[5%] right-[3%] bg-primary px-3 py-1 rounded-full text-white  items-center gap-1 z-10">
                  <span>{film.vote_average.toFixed(1)}</span>
                  <AiFillStar size={15} />
                </div>

                <div className="tw-absolute-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#c353b4] tw-flex-center z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-700">
                  <BsFillPlayFill size={35} className="text-white" />
                </div>
              </Link>
            </SwiperSlide>
          ))}

          {/* The navigation button is so small that users could miss clicking it and as a result clicking the Link, which is not what the user want (they want to navigate to other films, not choosing the current films on banner slider), so I create this transparent div, put it above the link but below the navigation button, so when the user miss clicking the navigation button, the user click this div instead of the link to the movie, so nothing will happen and the user can try clicking the button again. 
          It's important to note that this div has pointer event set to "auto" instead of "none" for this logic to work*/}
          <div className="absolute top-0 left-0 w-[8%] h-[11%] z-10"></div>
        </Swiper>
      )
      }
    </div >
  );
};

export default BannerSlider;
