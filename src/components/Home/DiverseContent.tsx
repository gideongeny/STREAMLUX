import React from 'react';
import HybridSectionSlider from '../Slider/HybridSectionSlider';

interface DiverseContentProps {
  currentTab: "movie" | "tv" | "sports";
}

const DiverseContent: React.FC<DiverseContentProps> = ({ currentTab }) => {
  // We use currentTab to determine whether to fetch movies or tv shows
  const mediaType = currentTab === "movie" ? "movie" : "tv";

  return (
    <div className="space-y-8 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          🌍 World Cinema
        </h2>
        <p className="text-gray-400 text-lg">
          Discover hand-picked movies and TV shows from around the world
        </p>
      </div>

      {/* Recommended Global Content */}
      <HybridSectionSlider
        title="🔥 Trending Global Cinema"
        category="global"
        type={mediaType}
      />

      {/* African Cinema */}
      <HybridSectionSlider
        title="✊🏿 African Cinema & Nollywood"
        region="africa"
        type={mediaType}
      />

      {/* Asian Cinema */}
      <HybridSectionSlider
        title="🌏 Asian Masterpieces"
        region="asia"
        type={mediaType}
      />

      {/* Korean Drama / Cinema */}
      <HybridSectionSlider
        title="🇰🇷 Korean Wave (K-Drama & Film)"
        region="kr"
        category="drama"
        type={mediaType}
      />

      {/* Bollywood */}
      <HybridSectionSlider
        title="🎭 Bollywood & Indian Cinema"
        region="in"
        type={mediaType}
      />

      {/* Latin American */}
      <HybridSectionSlider
        title="💃 Latin American Cinema"
        region="latin"
        type={mediaType}
      />

      {/* Middle Eastern */}
      <HybridSectionSlider
        title="Middle Eastern Cinema"
        region="middleeast"
        type={mediaType}
      />

      {/* Filipino */}
      <HybridSectionSlider
        title="🇵🇭 Filipino Cinema & Shows"
        region="philippines"
        type={mediaType}
      />

      {/* Action Categories */}
      <HybridSectionSlider
        title="💥 Action & Adventure"
        category="action"
        type={mediaType}
      />

      {/* Horror Categories */}
      <HybridSectionSlider
        title="👻 Horror & Thriller"
        category="horror"
        type={mediaType}
      />

      {/* Documentary */}
      <HybridSectionSlider
        title="📹 Documentaries"
        category="documentary"
        type={mediaType}
      />
    </div>
  );
};

export default DiverseContent;
