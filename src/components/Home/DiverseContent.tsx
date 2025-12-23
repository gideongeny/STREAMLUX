import React from 'react';
import YouTubeSectionSlider from '../Slider/YouTubeSectionSlider';

interface DiverseContentProps {
  currentTab: "movie" | "tv" | "sports";
}

const DiverseContent: React.FC<DiverseContentProps> = ({ currentTab }) => {
  // We use currentTab to determine whether to fetch movies or tv shows from YouTube via classification
  const ytType = currentTab === "movie" ? "movie" : "tv";

  return (
    <div className="space-y-8 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          🌍 World Cinema <span className="text-xs bg-primary px-2 py-1 rounded">YOUTUBE EDITION</span>
        </h2>
        <p className="text-gray-400 text-lg">
          Discover hand-picked movies and TV shows from around the world, free on YouTube
        </p>
      </div>

      {/* Recommended Global Content */}
      <YouTubeSectionSlider
        title="🔥 Trending Global Cinema"
        category="global"
        type={ytType}
      />

      {/* African Cinema */}
      <YouTubeSectionSlider
        title="✊🏿 African Cinema & Nollywood"
        region="africa"
        type={ytType}
      />

      {/* Asian Cinema */}
      <YouTubeSectionSlider
        title="🌏 Asian Masterpieces"
        region="asia"
        type={ytType}
      />

      {/* Korean Drama / Cinema */}
      <YouTubeSectionSlider
        title="🇰🇷 Korean Wave (K-Drama & Film)"
        region="kr"
        category="drama"
        type={ytType}
      />

      {/* Bollywood */}
      <YouTubeSectionSlider
        title="🎭 Bollywood & Indian Cinema"
        region="in"
        type={ytType}
      />

      {/* Latin American */}
      <YouTubeSectionSlider
        title="💃 Latin American Cinema"
        region="latin"
        type={ytType}
      />

      {/* Middle Eastern */}
      <YouTubeSectionSlider
        title="🕌 Middle Eastern Cinema"
        region="middleeast"
        type={ytType}
      />

      {/* Filipino */}
      <YouTubeSectionSlider
        title="🇵🇭 Filipino Cinema & Shows"
        region="philippines"
        type={ytType}
      />

      {/* Action Categories */}
      <YouTubeSectionSlider
        title="💥 Action & Adventure"
        category="action"
        type={ytType}
      />

      {/* Horror Categories */}
      <YouTubeSectionSlider
        title="👻 Horror & Thriller"
        category="horror"
        type={ytType}
      />

      {/* Documentary */}
      <YouTubeSectionSlider
        title="📹 Documentaries"
        category="documentary"
        type={ytType}
      />
    </div>
  );
};

export default DiverseContent;
