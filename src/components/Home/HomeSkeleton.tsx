import { FC } from "react";

const HomeSkeleton: FC = () => {
  return (
    <div className="space-y-16 animate-pulse">
      {/* Banner Skeleton */}
      <div className="relative w-full h-[60vh] md:h-[75vh] rounded-[3rem] overflow-hidden tw-shimmer opacity-30" />

      {/* Slider Rows */}
      {[1, 2, 3].map((row) => (
        <div key={row} className="space-y-6 px-4">
          <div className="w-48 h-8 rounded-lg tw-shimmer" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="flex-shrink-0 w-32 md:w-48 aspect-[2/3] rounded-2xl tw-shimmer opacity-50"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeSkeleton;
