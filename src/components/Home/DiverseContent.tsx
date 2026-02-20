import React from 'react';
import {
  getAfricanContent,
  getAsianContent,
  getLatinAmericanContent,
  getMiddleEasternContent,
  getNollywoodContent,
  getBollywoodContent,
  getKoreanContent,
  getJapaneseContent,
  getChineseContent,
  getEastAfricanContent,
  getSouthAfricanContent,
  getSoutheastAsianContent,
  getFilipinoContent,
  getBrazilianContent,
  getMexicanContent,
  getKenyanTVShows,
  getNigerianTVShows,
  getAfricanTVContent,
  getEnhancedNollywoodContent,
  getEnhancedKenyanContent,
  getTrendingNow,
  getHorrorMovies,
  getActionMovies,
  getComedyMovies,
  getDramaMovies,
  getThrillerMovies,
  getRomanceMovies,
  getSciFiMovies,
  getAnimationMovies,
  getDocumentaryMovies,
  getCrimeMovies,
  getAdventureMovies,
  getFantasyMovies,
  getWarMovies,
  getHistoryMovies,
  getMusicMovies,
  getMysteryMovies,
  getFamilyMovies,
  getWesternMovies,
  getTVMovies,
  getRealityTV,
  getKidsTV,
  getSoapTV,
  getNewsTV,
  getTalkTV,
  getActionAdventureTV,
  getComedyTV,
  getDramaTV,
  getSciFiFantasyTV,
  getWarPoliticsTV,
  getAnimationTV,
  getCrimeTV,
  getDocumentaryTV,
  getMysteryTV,
  getFamilyTV
} from '../../services/home';
import LazySection from '../Common/LazySection';

interface DiverseContentProps {
  currentTab: "movie" | "tv" | "sports";
}

const DiverseContent: React.FC<DiverseContentProps> = ({ currentTab }) => {
  return (
    <div className="flex flex-col gap-2">
      {/* PRIORITY 1: Trending & Top Genres (Immediate Load) */}
      <LazySection fetcher={getTrendingNow} title="Trending Now" isLarge forceLoad />

      {currentTab === 'movie' && (
        <>
          <LazySection fetcher={getActionMovies} title="Action & Adventure" forceLoad />
          <LazySection fetcher={getComedyMovies} title="Comedy Hits" forceLoad />

          {/* PRIORITY 2: Popular Genres (Lazy Load) */}
          <LazySection fetcher={getHorrorMovies} title="Horror & Thriller" />
          <LazySection fetcher={getSciFiMovies} title="Sci-Fi & Fantasy" />
          <LazySection fetcher={getDramaMovies} title="Drama" />
          <LazySection fetcher={getRomanceMovies} title="Romance" />

          {/* PRIORITY 3: Animation & Family */}
          <LazySection fetcher={getAnimationMovies} title="Animation" />
          <LazySection fetcher={getFamilyMovies} title="Family" />

          {/* PRIORITY 4: World Cinema - Major Markets */}
          <LazySection fetcher={getKoreanContent} title="K-Drama & Korean Mvoies" />
          <LazySection fetcher={getNollywoodContent} title="Nollywood (Nigeria)" />
          <LazySection fetcher={getBollywoodContent} title="Bollywood (India)" />

          {/* PRIORITY 5: Niche Genres */}
          <LazySection fetcher={getCrimeMovies} title="Crime" />
          <LazySection fetcher={getMysteryMovies} title="Mystery" />
          <LazySection fetcher={getDocumentaryMovies} title="Documentaries" />
          <LazySection fetcher={getWarMovies} title="War" />
          <LazySection fetcher={getHistoryMovies} title="History" />
          <LazySection fetcher={getMusicMovies} title="Music" />
          <LazySection fetcher={getWesternMovies} title="Western" />
          <LazySection fetcher={getTVMovies} title="TV Movies" />

          {/* PRIORITY 6: World Cinema - Deep Dive */}
          <LazySection fetcher={getAfricanContent} title="African Cinema" />
          <LazySection fetcher={getEnhancedNollywoodContent} title="Best of Nollywood" />
          <LazySection fetcher={getEnhancedKenyanContent} title="Kenyan Cinema" />
          <LazySection fetcher={getSouthAfricanContent} title="South African" />
          <LazySection fetcher={getEastAfricanContent} title="East African" />

          <LazySection fetcher={getChineseContent} title="Chinese Cinema" />
          <LazySection fetcher={getJapaneseContent} title="Japanese Anime & Live Action" />
          <LazySection fetcher={getAsianContent} title="Pan-Asian Hits" />
          <LazySection fetcher={getFilipinoContent} title="Pinoy Movies" />
          <LazySection fetcher={getSoutheastAsianContent} title="Southeast Asian" />

          <LazySection fetcher={getLatinAmericanContent} title="Latin American" />
          <LazySection fetcher={getBrazilianContent} title="Brazilian" />
          <LazySection fetcher={getMexicanContent} title="Mexican" />
          <LazySection fetcher={getMiddleEasternContent} title="Middle Eastern" />
        </>
      )}

      {currentTab === 'tv' && (
        <>
          <LazySection fetcher={getTrendingNow} title="Trending Series" isLarge forceLoad />
          <LazySection fetcher={getActionAdventureTV} title="Action & Adventure" forceLoad />

          <LazySection fetcher={getComedyTV} title="Comedy Series" />
          <LazySection fetcher={getDramaTV} title="Must-Watch Dramas" />
          <LazySection fetcher={getSciFiFantasyTV} title="Sci-Fi & Fantasy" />
          <LazySection fetcher={getAnimationTV} title="Animation" />

          <LazySection fetcher={getCrimeTV} title="Crime & Mystery" />
          <LazySection fetcher={getWarPoliticsTV} title="War & Politics" />
          <LazySection fetcher={getRealityTV} title="Reality TV" />
          <LazySection fetcher={getKidsTV} title="Kids" />

          <LazySection fetcher={getKenyanTVShows} title="Kenyan TV Shows" />
          <LazySection fetcher={getNigerianTVShows} title="Nigerian TV Series" />
          <LazySection fetcher={getAfricanTVContent} title="African Series" />

          <LazySection fetcher={getDocumentaryTV} title="Docuseries" />
          <LazySection fetcher={getSoapTV} title="Soap Operas" />
          <LazySection fetcher={getTalkTV} title="Talk Shows" />
          <LazySection fetcher={getNewsTV} title="News" />
          <LazySection fetcher={getFamilyTV} title="Family" />
        </>
      )}
    </div>
  );
};

export default DiverseContent;
