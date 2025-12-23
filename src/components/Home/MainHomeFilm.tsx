import { FC } from "react";
import { BannerInfo, HomeFilms } from "../../shared/types";
import Skeleton from "../Common/Skeleton";
import BannerSlider from "../Slider/BannerSlider";
import SectionSlider from "../Slider/SectionSlider";

interface MainHomeFilmsProps {
  data: HomeFilms | undefined;
  dataDetail: BannerInfo[] | undefined;
  isLoadingBanner: boolean;
  isLoadingSection: boolean;
}

const MainHomeFilms: FC<MainHomeFilmsProps> = ({
  data,
  dataDetail,
  isLoadingBanner,
  isLoadingSection,
}) => {
  return (
    <>
      <BannerSlider
        films={data?.Trending}
        dataDetail={dataDetail}
        isLoadingBanner={isLoadingBanner}
      />

      <ul className="flex flex-col gap-10 mt-12">
        {isLoadingSection ? (
          <>
            {new Array(2).fill("").map((_, index) => (
              <li key={index}>
                <Skeleton className="mb-3 max-w-[10%] h-8 rounded-md" />
                <SectionSlider films={undefined} />
              </li>
            ))}
          </>
        ) : (
          Object.entries(data as HomeFilms)
            .filter((section) => section[0] !== "Trending")
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
                <li key={index}>
                  <SectionSlider 
                    films={section[1]} 
                    title={section[0]}
                    seeMoreParams={seeMoreParams}
                  />
                </li>
              );
            })
        )}
      </ul>
    </>
  );
};

export default MainHomeFilms;
