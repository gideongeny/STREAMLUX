import { FC } from "react";

// YouTube-style skeleton row with icon placeholder
const SkeletonRow: FC<{ count?: number; delay?: number }> = ({ count = 6, delay = 0 }) => (
  <div className="space-y-4 px-4">
    {/* Section heading skeleton with icon/poster thumb */}
    <div className="flex items-center gap-3">
      <div
        className="sl-skeleton-card flex-shrink-0"
        style={{ width: 44, height: 60, animationDelay: `${delay}s` }}
      />
      <div className="space-y-2">
        <div className="sl-skeleton-title w-36" style={{ animationDelay: `${delay + 0.05}s` }} />
        <div className="sl-skeleton-title w-20" style={{ height: 10, opacity: 0.6, animationDelay: `${delay + 0.1}s` }} />
      </div>
    </div>
    {/* Poster cards row */}
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 space-y-2" style={{ width: 115 }}>
          <div
            className="sl-skeleton-card"
            style={{ width: 115, height: 175, animationDelay: `${delay + i * 0.08}s` }}
          />
          <div
            className="sl-skeleton-title mx-auto"
            style={{ width: "80%", animationDelay: `${delay + i * 0.08 + 0.1}s` }}
          />
        </div>
      ))}
    </div>
  </div>
);

const HomeSkeleton: FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Banner Skeleton */}
      <div className="sl-skeleton-card relative w-full rounded-[3rem] overflow-hidden" style={{ height: "60vh" }}>
        <div className="absolute bottom-8 left-8 space-y-3">
          <div className="sl-skeleton-title w-64" style={{ height: 32 }} />
          <div className="sl-skeleton-title w-48" />
          <div className="flex gap-3 mt-4">
            <div className="sl-skeleton-card rounded-full" style={{ width: 112, height: 40 }} />
            <div className="sl-skeleton-card rounded-full opacity-60" style={{ width: 96, height: 40 }} />
          </div>
        </div>
      </div>

      {/* Section skeleton rows — staggered like YouTube */}
      <SkeletonRow count={6} delay={0} />
      <SkeletonRow count={6} delay={0.15} />
      <SkeletonRow count={6} delay={0.3} />
      <SkeletonRow count={6} delay={0.45} />
    </div>
  );
};

export default HomeSkeleton;

