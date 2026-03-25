import { FC } from "react";

const SportsCardSkeleton: FC = () => {
  return (
    <div className="relative group rounded-[2.5rem] bg-dark-lighten/40 border border-white/5 overflow-hidden shadow-2xl animate-pulse">
      <div className="p-8">
        {/* League Icon & Status Shimmer */}
        <div className="flex justify-between items-center mb-10">
          <div className="w-10 h-10 rounded-full tw-shimmer" />
          <div className="w-20 h-6 rounded-full tw-shimmer" />
        </div>

        {/* Teams Row */}
        <div className="flex items-center justify-between gap-6 mb-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full tw-shimmer" />
            <div className="w-24 h-4 rounded-md tw-shimmer" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-6 rounded-md tw-shimmer mb-2" />
            <div className="w-16 h-8 rounded-lg bg-primary/20 tw-shimmer" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full tw-shimmer" />
            <div className="w-24 h-4 rounded-md tw-shimmer" />
          </div>
        </div>

        {/* Kickoff / Venue Shimmer */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-32 h-4 rounded-md tw-shimmer" />
          <div className="w-48 h-3 rounded-md tw-shimmer opacity-50" />
        </div>

        {/* Action Button Shimmer */}
        <div className="w-full h-14 rounded-2xl tw-shimmer" />
      </div>
    </div>
  );
};

export default SportsCardSkeleton;
