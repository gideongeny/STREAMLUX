import { FC } from "react";
import { BannerInfo, HomeFilms } from "../../shared/types";
import Skeleton from "../Common/Skeleton";
import BannerSlider from "../Slider/BannerSlider";
import SectionSlider from "../Slider/SectionSlider";
import HybridSectionSlider from "../Slider/HybridSectionSlider";

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
  // Show loading if banner details are loading OR if main data is still loading (no films yet)
  // Show loading if banner details are loading
  const isBannerLoading = isLoadingBanner || (isLoadingSection && !data?.Trending);

  return (
    <>
      <BannerSlider
        films={data?.Trending}
        dataDetail={dataDetail}
        isLoadingBanner={isBannerLoading}
      />

      <div className="mt-8">
        <HybridSectionSlider
          title="🌟 Featured: Free Full Movies"
          category="popular"
          type="movie"
        />
      </div>

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
        ): data && Object.keys(data).length > 0 ? (
        Object.entries(data)
            .filter((section) => section[0] !== "Trending" && section[1] && section[1].length > 0)
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
        ) : (
        <div className="text-center py-20 bg-dark-lighten rounded-2xl border border-white/5">
          <p className="text-gray-400">No content available at the moment. Please try again later or check your internet connection.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition"
          >
            Refresh Page
          </button>
        </div>
        )}
      </ul>
    </>
  );
};

export default MainHomeFilms;
