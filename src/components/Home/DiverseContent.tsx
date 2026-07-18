import React from 'react';
import {
  getAfricanContent, getAsianContent, getLatinAmericanContent, getMiddleEasternContent,
  getNollywoodContent, getBollywoodContent, getKoreanContent, getJapaneseContent,
  getChineseContent, getEastAfricanContent, getSouthAfricanContent, getSoutheastAsianContent,
  getFilipinoContent, getBrazilianContent, getMexicanContent, getKenyanTVShows,
  getNigerianTVShows, getAfricanTVContent, getEnhancedNollywoodContent, getEnhancedKenyanContent,
  getTrendingNow, getHorrorMovies, getActionMovies, getComedyMovies, getDramaMovies,
  getThrillerMovies, getRomanceMovies, getSciFiMovies, getAnimationMovies, getDocumentaryMovies,
  getCrimeMovies, getAdventureMovies, getFantasyMovies, getWarMovies, getHistoryMovies,
  getMusicMovies, getMysteryMovies, getFamilyMovies, getWesternMovies, getTVMovies,
  getRealityTV, getKidsTV, getSoapTV, getNewsTV, getTalkTV, getActionAdventureTV,
  getComedyTV, getDramaTV, getSciFiFantasyTV, getWarPoliticsTV, getAnimationTV,
  getCrimeTV, getDocumentaryTV, getMysteryTV, getFamilyTV, getIndieAndRareContent,
  getNicheAnimeContent, getGenreContent
} from '../../services/home';
import LazySection from '../Common/LazySection';

interface DiverseContentProps {
  currentTab: "movie" | "tv" | "sports";
}

const DiverseContent: React.FC<DiverseContentProps> = ({ currentTab }) => {
  return (
    <div className="flex flex-col gap-2">
      <LazySection fetcher={getTrendingNow} title="Trending Now" isLarge forceLoad seeMoreParams={{ sort_by: "popularity.desc", type: "movie" }} />

      {currentTab === 'movie' && (
        <>
          <LazySection fetcher={getActionMovies} title="Action & Adventure" seeMoreParams={{ genre: 28, type: "movie" }} />
          <LazySection fetcher={getComedyMovies} title="Comedy Hits" seeMoreParams={{ genre: 35, type: "movie" }} />
          <LazySection fetcher={getHorrorMovies} title="Horror & Thriller" seeMoreParams={{ genre: 27, type: "movie" }} />
          <LazySection fetcher={getSciFiMovies} title="Sci-Fi & Fantasy" seeMoreParams={{ genre: 878, type: "movie" }} />
          <LazySection fetcher={getDramaMovies} title="Drama" seeMoreParams={{ genre: 18, type: "movie" }} />
          <LazySection fetcher={getRomanceMovies} title="Romance" seeMoreParams={{ genre: 10749, type: "movie" }} />
          <LazySection fetcher={getAnimationMovies} title="Animation" seeMoreParams={{ genre: 16, type: "movie" }} />
          <LazySection fetcher={getFamilyMovies} title="Family" seeMoreParams={{ genre: 10751, type: "movie" }} />

          <LazySection fetcher={getIndieAndRareContent} title="Indie & Rare Discoveries" isLarge />
          <LazySection fetcher={getNicheAnimeContent} title="Classic Anime Gems" />
          <LazySection fetcher={() => getGenreContent(10749, 'movie')} title="Arthouse & Cult" />
          <LazySection fetcher={() => getGenreContent(80, 'movie')} title="Grindhouse Cinema" />

          <LazySection fetcher={getKoreanContent} title="K-Drama & Korean Movies" seeMoreParams={{ region: "korea", type: "movie" }} />
          <LazySection fetcher={getNollywoodContent} title="Nollywood (Nigeria)" seeMoreParams={{ region: "nollywood", type: "movie" }} />
          <LazySection fetcher={getBollywoodContent} title="Bollywood (India)" seeMoreParams={{ region: "bollywood", type: "movie" }} />

          <LazySection fetcher={getCrimeMovies} title="Crime" seeMoreParams={{ genre: 80, type: "movie" }} />
          <LazySection fetcher={getMysteryMovies} title="Mystery" seeMoreParams={{ genre: 9648, type: "movie" }} />
          <LazySection fetcher={getDocumentaryMovies} title="Documentaries" seeMoreParams={{ genre: 99, type: "movie" }} />
          <LazySection fetcher={getWarMovies} title="War" seeMoreParams={{ genre: 10752, type: "movie" }} />
          <LazySection fetcher={getHistoryMovies} title="History" seeMoreParams={{ genre: 36, type: "movie" }} />
          <LazySection fetcher={getMusicMovies} title="Music" seeMoreParams={{ genre: 10402, type: "movie" }} />
          <LazySection fetcher={getWesternMovies} title="Western" seeMoreParams={{ genre: 37, type: "movie" }} />
          <LazySection fetcher={getTVMovies} title="TV Movies" seeMoreParams={{ genre: 10770, type: "movie" }} />

          <LazySection fetcher={getAfricanContent} title="African Cinema" seeMoreParams={{ region: "africa", type: "movie" }} />
          <LazySection fetcher={getEnhancedNollywoodContent} title="Best of Nollywood" seeMoreParams={{ region: "nollywood", type: "movie" }} />
          <LazySection fetcher={getEnhancedKenyanContent} title="Kenyan Cinema" seeMoreParams={{ region: "kenya", type: "movie" }} />
          <LazySection fetcher={getSouthAfricanContent} title="South African" seeMoreParams={{ region: "south africa", type: "movie" }} />
          <LazySection fetcher={getEastAfricanContent} title="East African" seeMoreParams={{ region: "africa", type: "movie" }} />

          <LazySection fetcher={getChineseContent} title="Chinese Cinema" seeMoreParams={{ region: "china", type: "movie" }} />
          <LazySection fetcher={getJapaneseContent} title="Japanese Anime & Live Action" seeMoreParams={{ region: "japan", type: "movie" }} />
          <LazySection fetcher={getAsianContent} title="Pan-Asian Hits" seeMoreParams={{ region: "asia", type: "movie" }} />
          <LazySection fetcher={getFilipinoContent} title="Pinoy Movies" seeMoreParams={{ region: "philippines", type: "movie" }} />
          <LazySection fetcher={getSoutheastAsianContent} title="Southeast Asian" />

          <LazySection fetcher={getLatinAmericanContent} title="Latin American" seeMoreParams={{ region: "latin", type: "movie" }} />
          <LazySection fetcher={getBrazilianContent} title="Brazilian" seeMoreParams={{ region: "brazil", type: "movie" }} />
          <LazySection fetcher={getMexicanContent} title="Mexican" seeMoreParams={{ region: "mexico", type: "movie" }} />
          <LazySection fetcher={getMiddleEasternContent} title="Middle Eastern" seeMoreParams={{ region: "middleeast", type: "movie" }} />
        </>
      )}

      {currentTab === 'tv' && (
        <>
          <LazySection fetcher={getTrendingNow} title="Trending Series" isLarge forceLoad seeMoreParams={{ sort_by: "popularity.desc", type: "tv" }} />
          <LazySection fetcher={getActionAdventureTV} title="Action & Adventure" seeMoreParams={{ genre: 10759, type: "tv" }} />
          <LazySection fetcher={getComedyTV} title="Comedy Series" seeMoreParams={{ genre: 35, type: "tv" }} />
          <LazySection fetcher={getDramaTV} title="Must-Watch Dramas" seeMoreParams={{ genre: 18, type: "tv" }} />
          <LazySection fetcher={getSciFiFantasyTV} title="Sci-Fi & Fantasy" seeMoreParams={{ genre: 10765, type: "tv" }} />
          <LazySection fetcher={getAnimationTV} title="Animation" seeMoreParams={{ genre: 16, type: "tv" }} />
          <LazySection fetcher={getCrimeTV} title="Crime & Mystery" seeMoreParams={{ genre: 80, type: "tv" }} />
          <LazySection fetcher={getWarPoliticsTV} title="War & Politics" seeMoreParams={{ genre: 10768, type: "tv" }} />
          <LazySection fetcher={getRealityTV} title="Reality TV" seeMoreParams={{ genre: 10764, type: "tv" }} />
          <LazySection fetcher={getKidsTV} title="Kids" seeMoreParams={{ genre: 10762, type: "tv" }} />
          <LazySection fetcher={getKenyanTVShows} title="Kenyan TV Shows" seeMoreParams={{ region: "kenya", type: "tv" }} />
          <LazySection fetcher={getNigerianTVShows} title="Nigerian TV Series" seeMoreParams={{ region: "nollywood", type: "tv" }} />
          <LazySection fetcher={getAfricanTVContent} title="African Series" seeMoreParams={{ region: "africa", type: "tv" }} />
          <LazySection fetcher={getDocumentaryTV} title="Docuseries" seeMoreParams={{ genre: 99, type: "tv" }} />
          <LazySection fetcher={getSoapTV} title="Soap Operas" seeMoreParams={{ genre: 10766, type: "tv" }} />
          <LazySection fetcher={getTalkTV} title="Talk Shows" seeMoreParams={{ genre: 10767, type: "tv" }} />
          <LazySection fetcher={getNewsTV} title="News" seeMoreParams={{ genre: 10763, type: "tv" }} />
          <LazySection fetcher={getFamilyTV} title="Family" seeMoreParams={{ genre: 10751, type: "tv" }} />
        </>
      )}
    </div>
  );
};

export default DiverseContent;

