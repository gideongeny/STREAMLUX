import { FC, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Item } from "../../shared/types";
import FilmItem from "../Common/FilmItem";
import Skeleton from "../Common/Skeleton";

interface SectionSliderProps {
  films: Item[] | undefined;
  title?: string;
  limitNumber?: number;
  isLoading?: boolean;
  seeMoreLink?: string;
  seeMoreParams?: Record<string, string | number>;
}

const BRAND_LOGOS: Record<string, string> = {
  disney: "/logos/Walt-Disney-Logo-1.png",
  pixar: "/logos/Pixar-emblem.jpg",
  marvel: "/logos/Marvel_Studios_logo.jpg",
  starwars: "/logos/Star-wars-logo-new-tall.jpg",
  natgeo: "/logos/Natgeologo.svg",
  dc: "/logos/DC_Comics_2024.svg.png",
  "007": "/logos/png-clipart-logo-brand-white-james-bond-miscellaneous-angle.png",
  nickelodeon: "/logos/Nickelodeon_2023_logo.png",
  cartoonnetwork: "/logos/Cartoon-Network-logo.jpg",
};

const SectionSlider: FC<SectionSliderProps> = ({
  films,
  title,
  limitNumber,
  isLoading = false,
  seeMoreLink,
  seeMoreParams
}) => {
  const navigate = useNavigate();
  const displayFilms = limitNumber && films ? films.slice(0, limitNumber) : films;

  const handleSeeMore = () => {
    if (seeMoreLink) {
      navigate(seeMoreLink);
    } else if (seeMoreParams) {
      const params = new URLSearchParams();
      Object.entries(seeMoreParams).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      navigate(`/explore?${params.toString()}`);
    } else {
      navigate("/explore");
    }
  };

  if ((!films || films.length === 0) && !isLoading) return null;

  return (
    <div className="mb-8">

      {/* Title section */}
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {BRAND_LOGOS[title.toLowerCase().replace(/\s/g, '')] ? (
              <img 
                src={BRAND_LOGOS[title.toLowerCase().replace(/\s/g, '')]} 
                alt={title} 
                className="h-8 md:h-10 object-contain brightness-110 drop-shadow-lg"
              />
            ) : (
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            )}
          </div>
          {(films && films.length > (limitNumber || 6)) && (
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
          spaceBetween={15}
          className="md:!w-[calc(100vw_-_260px_-_310px_-_2px_-_4vw_-_10px)] !w-[calc(100vw-8vw-2px)] tw-section-slider !py-2"
        >
          {(displayFilms && displayFilms.length > 0) ? (
            displayFilms.map((film) => (
              <SwiperSlide key={film.id} className="!w-[170px]">
                <FilmItem item={film} />
              </SwiperSlide>
            ))
          ) : (
            <>
              {new Array(6)
                .fill("")
                .map((_, index) => (
                  <SwiperSlide key={index} className="!w-[170px]">
                    <Skeleton className="!w-[170px] !h-[250px] shadow-sm rounded-lg" />
                  </SwiperSlide>
                ))}
            </>
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default memo(SectionSlider);
