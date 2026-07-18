import { FC, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Item } from "../../shared/types";
import FilmItem from "../Common/FilmItem";
import Skeleton from "../Common/Skeleton";
import { useSidebar } from "../../hooks/useSidebar";

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
  const { isSidebarVisible, isMobile } = useSidebar();
  const displayFilms = limitNumber && films ? films.slice(0, limitNumber) : films;

  // Calculate dynamic card width based on sidebar visibility
  // Larger cards when sidebar is hidden/pinned (meaning we have more space)
  const cardWidth = isMobile ? "135px" : (!isSidebarVisible ? "210px" : "175px");
  const swiperWidthClass = (!isMobile && isSidebarVisible) 
    ? "md:!w-[calc(100vw_-_260px_-_4vw_-_20px)]" 
    : "md:!w-[calc(100vw_-_4vw_-_20px)]";

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
    <div className="mb-12">
      {title && (
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            {BRAND_LOGOS[title.toLowerCase().replace(/\s/g, '')] ? (
              <img
                src={BRAND_LOGOS[title.toLowerCase().replace(/\s/g, '')]}
                alt={title}
                className="h-10 md:h-12 object-contain brightness-110 drop-shadow-xl"
              />
            ) : (
              <h3 className="sl-section-title">{title}</h3>
            )}
          </div>
          {(films && films.length > (limitNumber || 6)) && (
            <button
              onClick={handleSeeMore}
              className="text-[#666] hover:text-white text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 border border-white/[0.06] hover:border-white/[0.15] px-5 py-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06]"
            >
              Explore All →
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView="auto"
          slidesPerGroupAuto
          spaceBetween={16}
          className={`${swiperWidthClass} !w-[calc(100vw-6vw)] tw-section-slider !py-4 overflow-visible`}
        >
          {(displayFilms && displayFilms.length > 0) ? (
            displayFilms.map((film, i) => (
              <SwiperSlide key={film.id} style={{ width: cardWidth }}>
                <motion.div
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <FilmItem item={film} />
                </motion.div>
              </SwiperSlide>
            ))
          ) : (
            <>
              {new Array(6)
                .fill("")
                .map((_, index) => (
                  <SwiperSlide key={index} style={{ width: cardWidth }}>
                    <Skeleton className={`w-full aspect-[2/3] shadow-2xl rounded-[2rem]`} />
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
