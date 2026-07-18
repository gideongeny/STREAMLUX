import React, { FC } from "react";
import { motion } from "framer-motion";
import { BannerInfo, HomeFilms } from "../../shared/types";
import Skeleton from "../Common/Skeleton";
import BannerSlider from "../Slider/BannerSlider";
import SectionSlider from "../Slider/SectionSlider";
import { useTranslation } from "react-i18next";

interface MainHomeFilmsProps {
  data: HomeFilms | undefined;
  dataDetail: BannerInfo[] | undefined;
  isLoadingBanner: boolean;
  isLoadingSection: boolean;
  onActiveImageChange?: (imageUrl: string) => void;
  brandHub?: React.ReactNode;
  topSections?: React.ReactNode;
}

const MainHomeFilms: FC<MainHomeFilmsProps> = ({
  data,
  dataDetail,
  isLoadingBanner,
  isLoadingSection,
  onActiveImageChange,
  brandHub,
  topSections,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col w-full">
      <BannerSlider
        films={data?.Trending?.slice(0, 6)}
        dataDetail={dataDetail}
        isLoadingBanner={isLoadingBanner}
        onActiveImageChange={onActiveImageChange}
      />

      {topSections}

      {/* Render BrandHub unconditionally at the top of the sections */}
      {brandHub && <div className="mt-8">{brandHub}</div>}

      <ul className="flex flex-col gap-10 mt-4 md:mt-12">
        {isLoadingSection || !data ? (
          <>
            {new Array(3).fill("").map((_, index) => (
              <li key={index} className="px-2">
                <Skeleton className="mb-6 w-32 h-8 rounded-lg" />
                <div className="flex gap-4 overflow-hidden">
                   {new Array(6).fill("").map((_, i) => (
                      <Skeleton key={i} className="min-w-[175px] aspect-[2/3] rounded-3xl" />
                   ))}
                </div>
              </li>
            ))}
          </>
        ) : (
          Object.entries(data as HomeFilms)
            .filter(
              (section) =>
                section[0] !== "Trending" &&
                section[0] !== "Top20Today"
            )
            .map((section, index) => {
              // Generate seeMore link based on section name
              const sectionName = section[0].toLowerCase();
              let seeMoreParams: Record<string, string> | undefined;

              // Map common section names to explore filters
              if (sectionName.includes("popular")) {
                seeMoreParams = { sort_by: "popularity.desc" };
              } else if (sectionName.includes("top rated") || sectionName.includes("top-rated")) {
                seeMoreParams = { sort_by: "vote_average.desc" };
              } else if (sectionName.includes("upcoming")) {
                seeMoreParams = { sort_by: "release_date.desc" };
              } else if (sectionName.includes("now playing") || sectionName.includes("on the air")) {
                seeMoreParams = { sort_by: "release_date.desc" };
              }

              return (
                <motion.li 
                  key={section[0]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <SectionSlider
                    films={section[1]}
                    title={
                      section[0] === "YouTubeFree"
                        ? "Free on YouTube"
                        : t(section[0])
                    }
                    seeMoreParams={seeMoreParams}
                  />
                </motion.li>
              );
            })
        )}
      </ul>
    </div>
  );
};


export default MainHomeFilms;
