import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Item } from "../../shared/types";
import FilmItem from "../Common/FilmItem";
import Skeleton from "../Common/Skeleton";
import SkeletonCard from "../Common/SkeletonCard";
import SkeletonSlider from "../Common/SkeletonSlider";

interface SectionSliderProps {
  films: Item[] | undefined;
  title?: string;
  limitNumber?: number;
  isLoading?: boolean;
  seeMoreLink?: string;
  seeMoreParams?: Record<string, string | number>;
}

const SectionSlider: FC<SectionSliderProps> = ({
  films,
  title,
  limitNumber,
  isLoading = false,
  seeMoreLink,
  seeMoreParams
}) => {
  const navigate = useNavigate();
  // Limit the number of films if specified
  const displayFilms = limitNumber && films ? films.slice(0, limitNumber) : films;

  const handleSeeMore = () => {
    if (seeMoreLink) {
      navigate(seeMoreLink);
    } else if (seeMoreParams) {
      const params = new URLSearchParams();
      Object.entries(seeMoreParams).forEach(([key, value]) => {
        // The explore page uses 'genre' and 'region' as query params
        params.append(key, String(value));
      });
      navigate(`/explore?${params.toString()}`);
    } else {
      navigate("/explore");
    }
  };

  return (
    <div className="mb-8">
      {/* Title section */}
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          {films && films.length > (limitNumber || 0) && (
            <button
              onClick={handleSeeMore}
              className="text-primary hover:text-primary/80 text-sm font-medium transition duration-300 mb-2"
            >
              See More →
            </button>
          )}
        </div>
      )}

      {/* Slider */}
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView="auto"
          slidesPerGroupAuto
          spaceBetween={30}
          loop
          // Dynamic width calculation based on viewport and sidebars
          className="w-full tw-section-slider !py-2"
        >
          {displayFilms?.map((film) => (
            <SwiperSlide key={film.id} className="!w-[175px]">
              <FilmItem item={film} />
            </SwiperSlide>
          )) || (
              <>
                {new Array(Math.ceil(window.innerWidth / 200))
                  .fill("")
                  .map((_, index) => (
                    <SwiperSlide key={index} className="!w-[175px]">
                      <SkeletonCard />
                    </SwiperSlide>
                  ))}
              </>
            )}

          {displayFilms !== undefined && (
            <>
              <div className="absolute top-[2%] left-0 right-0 h-[83%] z-10 pointer-events-none tw-black-backdrop-2" />
              {/* It's annoying when you wanna click the navigation but end up clicking the link because the navigation button is so small, so it's easy to miss. I made these 2 transparent box and put them above the slider but behind the navigation  */}
              <div className="absolute top-0 left-0 w-[4%] h-full z-10"></div>
              <div className="absolute top-0 right-0 w-[4%] h-full z-10"></div>
            </>
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default SectionSlider;
