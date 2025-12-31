import React from 'react';
import HybridSectionSlider from '../Slider/HybridSectionSlider';
import { useAppSelector } from '../../store/hooks';
import { FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface DiverseContentProps {
  currentTab: "movie" | "tv" | "sports";
}

const DiverseContent: React.FC<DiverseContentProps> = ({ currentTab }) => {
  // We use currentTab to determine whether to fetch movies or tv shows
  const mediaType = currentTab === "movie" ? "movie" : "tv";
  const currentUser = useAppSelector((state: any) => state.auth.user);

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

      {/* Superheroes */}
      <HybridSectionSlider
        title="🦸 Superheroes & Comic Universes"
        category="superheroes"
        type="movie"
        linkPath="/explore?category=superheroes"
      />

      {/* True Crime */}
      <HybridSectionSlider
        title="🕵️ True Crime & Investigation"
        category="true_crime"
        type="movie"
        linkPath="/explore?category=true_crime"
      />

      {/* Recommended Global Content */}
      <HybridSectionSlider
        title="🔥 Trending Global Cinema"
        category="global"
        type={mediaType}
        linkPath={`/explore?genre=global&type=${mediaType}`}
      />

      {/* Black Shows - New */}
      <HybridSectionSlider
        title="✊🏿 Black Shows"
        category="black_stories"
        type="movie"
        linkPath="/explore?genre=black_stories"
      />

      {/* Premium VIP 4K Access - Login Required */}
      <div className="relative">
        <HybridSectionSlider
          title="👑 Premium VIP 4K Access"
          category="premium_vip"
          type="movie"
          linkPath="/explore?genre=premium_vip"
        />
        {!currentUser && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
            <FaLock className="text-primary text-5xl mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">Premium Content</h3>
            <p className="text-gray-300 mb-4">Sign in to access 4K premium movies</p>
            <Link
              to="/auth"
              className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition"
            >
              Sign In Now
            </Link>
          </div>
        )}
      </div>

      {/* Adventure Movies */}
      <HybridSectionSlider
        title="🗺️ Adventure Movies"
        category="adventure"
        type="movie"
        linkPath="/explore?genre=adventure"
      />

      {/* Teen Romance */}
      <HybridSectionSlider
        title="💓 Teen Romance 💓"
        category="teen_romance"
        type="movie"
        linkPath="/explore?genre=teen_romance"
      />

      {/* Turkish Drama */}
      <HybridSectionSlider
        title="🇹🇷 Turkish Drama"
        category="turkish_drama"
        type="tv"
        linkPath="/explore?genre=turkish_drama"
      />

      {/* Nollywood & African Hits */}
      <HybridSectionSlider
        title="🇳🇬 Nollywood & African Hits"
        category="nollywood"
        type={mediaType}
        linkPath={`/explore?genre=nollywood&type=${mediaType}`}
      />

      {/* African Cinema */}
      <HybridSectionSlider
        title="✊🏿 African Cinema"
        region="africa"
        type={mediaType}
        linkPath={`/explore?region=africa&type=${mediaType}`}
      />

      {/* Asian Cinema */}
      <HybridSectionSlider
        title="🌏 Asian Masterpieces"
        region="asia"
        type={mediaType}
        linkPath={`/explore?region=asia&type=${mediaType}`}
      />

      {/* Korean Drama / Cinema */}
      <HybridSectionSlider
        title="🇰🇷 Korean Wave (K-Drama & Film)"
        region="kr"
        category="drama"
        type={mediaType}
        linkPath={`/explore?region=kr&genre=drama&type=${mediaType}`}
      />

      {/* Bollywood */}
      <HybridSectionSlider
        title="🎭 Bollywood & Indian Cinema"
        region="in"
        type={mediaType}
        linkPath={`/explore?region=in&type=${mediaType}`}
      />

      {/* Award Winners */}
      <HybridSectionSlider
        title="🏆 Award-Winning Masterpieces"
        category="award_winning"
        type="movie"
        linkPath="/explore?category=award_winning"
      />

      {/* Supernatural */}
      <HybridSectionSlider
        title="👻 Supernatural & Paranormal"
        category="supernatural"
        type="movie"
        linkPath="/explore?category=supernatural"
      />

      {/* Cyberpunk & Future */}
      <HybridSectionSlider
        title="🤖 Cyberpunk & Dystopian Future"
        category="cyberpunk"
        type="movie"
        linkPath="/explore?category=cyberpunk"
      />

      {/* Space exploration */}
      <HybridSectionSlider
        title="🚀 Space Exploration & Galaxies"
        category="space"
        type="movie"
        linkPath="/explore?category=space"
      />

      {/* International Showcase */}
      <div className="text-center py-6">
        <h3 className="text-2xl font-black text-primary uppercase tracking-widest">Global Showcase</h3>
      </div>

      <HybridSectionSlider
        title="🇬🇧 British Cinema & TV"
        category="british"
        type={mediaType}
        linkPath={`/explore?category=british&type=${mediaType}`}
      />

      <HybridSectionSlider
        title="🇫🇷 French Cinema & TV"
        category="french"
        type={mediaType}
        linkPath={`/explore?category=french&type=${mediaType}`}
      />

      <HybridSectionSlider
        title="🇪🇸 Spanish Cinema & TV"
        category="spanish"
        type={mediaType}
        linkPath={`/explore?category=spanish&type=${mediaType}`}
      />

      {/* Latin American */}
      <HybridSectionSlider
        title="💃 Latin American Cinema"
        region="latin"
        type={mediaType}
        linkPath={`/explore?region=latin&type=${mediaType}`}
      />

      {/* Middle Eastern */}
      <HybridSectionSlider
        title="Middle Eastern Cinema"
        region="middleeast"
        type={mediaType}
        linkPath={`/explore?region=middleeast&type=${mediaType}`}
      />

      {/* Filipino */}
      <HybridSectionSlider
        title="🇵🇭 Filipino Cinema & Shows"
        region="philippines"
        type={mediaType}
        linkPath={`/explore?region=philippines&type=${mediaType}`}
      />

      {/* Action Categories */}
      <HybridSectionSlider
        title="💥 High Octane Action"
        category="action"
        type={mediaType}
        linkPath={`/explore?genre=action&type=${mediaType}`}
      />

      {/* Horror Categories */}
      <HybridSectionSlider
        title="👻 Spooky Season (Horror)"
        category="horror"
        type={mediaType}
        linkPath={`/explore?genre=horror&type=${mediaType}`}
      />

      {/* Holiday Specials */}
      <HybridSectionSlider
        title="🎄 Holiday Specials"
        category="holiday"
        type={mediaType}
        linkPath={`/explore?genre=holiday&type=${mediaType}`}
      />

      {/* Family & Kids */}
      <HybridSectionSlider
        title="🎈 Family & Kids"
        category="family"
        type={mediaType}
        linkPath={`/explore?genre=family&type=${mediaType}`}
      />

      {/* Sci-Fi & Fantasy */}
      <HybridSectionSlider
        title="🌌 Sci-Fi & Interstellar Fantasy"
        category="scifi_fantasy"
        type="movie"
        linkPath="/explore?category=scifi_fantasy"
      />

      {/* Mystery & Thriller */}
      <HybridSectionSlider
        title="🔍 Mind-Bending Mystery & Thrillers"
        category="mystery_thriller"
        type="movie"
        linkPath="/explore?category=mystery_thriller"
      />

      {/* History & War */}
      <HybridSectionSlider
        title="⚔️ Historical Epics & War Stories"
        category="history_war"
        type="movie"
        linkPath="/explore?category=history_war"
      />

      {/* Musical & Dance */}
      <HybridSectionSlider
        title="💃 Musical, Dance & Rhythm"
        category="musical"
        type="movie"
        linkPath="/explore?category=musical"
      />

      {/* Western & Adventure */}
      <HybridSectionSlider
        title="🤠 Wild West & Epic Adventures"
        category="western"
        type="movie"
        linkPath="/explore?category=western"
      />

      {/* Kids & Animation */}
      <HybridSectionSlider
        title="🎈 Family Fun & Animation"
        category="kids_animation"
        type="movie"
        linkPath="/explore?category=kids_animation"
      />

      {/* Adventure Movies */}
      <HybridSectionSlider
        title="🗺️ Discovery & Exploration"
        category="adventure"
        type="movie"
        linkPath="/explore?genre=adventure"
      />

      {/* Documentary */}
      <HybridSectionSlider
        title="📹 Real Life Stories (Documentaries)"
        category="documentary"
        type={mediaType}
        linkPath={`/explore?genre=documentary&type=${mediaType}`}
      />
    </div>
  );
};

export default DiverseContent;
