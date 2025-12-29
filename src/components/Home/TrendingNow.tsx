import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { getTrendingNow } from "../../services/home";
import { Item } from "../../shared/types";
import RightbarFilms from "../Common/RightbarFilms";
import SectionSlider from "../Slider/SectionSlider";

interface TrendingNowProps {
  isMainFlow?: boolean;
}

const TrendingNow: FC<TrendingNowProps> = ({ isMainFlow = false }) => {
  const { isLoading, data, isError, error } = useQuery<Item[], Error>(
    ["trending"],
    getTrendingNow
  );

  if (isError) return null;

  if (isMainFlow) {
    return (
      <div className="px-4 md:px-8">
        <SectionSlider
          films={data}
          title="📈 Trending Today"
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <RightbarFilms
      className="mt-7"
      name="Trending"
      limitNumber={2}
      films={data}
      isLoading={isLoading}
    />
  );
};

export default TrendingNow;
