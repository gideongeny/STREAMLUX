import React, { useEffect, useState } from 'react';
import { Item } from '../../shared/types';
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
  getFantasyMovies
} from '../../services/home';
import SectionSlider from '../Slider/SectionSlider';
import Skeleton from '../Common/Skeleton';

interface DiverseContentProps {
  currentTab: "movie" | "tv" | "sports";
}

const DiverseContent: React.FC<DiverseContentProps> = ({ currentTab }) => {
  const [africanContent, setAfricanContent] = useState<Item[]>([]);
  const [asianContent, setAsianContent] = useState<Item[]>([]);
  const [latinAmericanContent, setLatinAmericanContent] = useState<Item[]>([]);
  const [middleEasternContent, setMiddleEasternContent] = useState<Item[]>([]);
  const [nollywoodContent, setNollywoodContent] = useState<Item[]>([]);
  const [bollywoodContent, setBollywoodContent] = useState<Item[]>([]);
  const [koreanContent, setKoreanContent] = useState<Item[]>([]);
  const [japaneseContent, setJapaneseContent] = useState<Item[]>([]);
  const [chineseContent, setChineseContent] = useState<Item[]>([]);
  const [eastAfricanContent, setEastAfricanContent] = useState<Item[]>([]);
  const [southAfricanContent, setSouthAfricanContent] = useState<Item[]>([]);
  const [southeastAsianContent, setSoutheastAsianContent] = useState<Item[]>([]);
  const [filipinoContent, setFilipinoContent] = useState<Item[]>([]);
  const [brazilianContent, setBrazilianContent] = useState<Item[]>([]);
  const [mexicanContent, setMexicanContent] = useState<Item[]>([]);
  const [kenyanTVShows, setKenyanTVShows] = useState<Item[]>([]);
  const [nigerianTVShows, setNigerianTVShows] = useState<Item[]>([]);
  const [africanTVContent, setAfricanTVContent] = useState<Item[]>([]);
  const [enhancedNollywood, setEnhancedNollywood] = useState<Item[]>([]);
  const [enhancedKenyan, setEnhancedKenyan] = useState<Item[]>([]);
  const [trendingAll, setTrendingAll] = useState<Item[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<Item[]>([]);
  const [actionMovies, setActionMovies] = useState<Item[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Item[]>([]);
  const [dramaMovies, setDramaMovies] = useState<Item[]>([]);
  const [thrillerMovies, setThrillerMovies] = useState<Item[]>([]);
  const [romanceMovies, setRomanceMovies] = useState<Item[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<Item[]>([]);
  const [animationMovies, setAnimationMovies] = useState<Item[]>([]);
  const [documentaryMovies, setDocumentaryMovies] = useState<Item[]>([]);
  const [crimeMovies, setCrimeMovies] = useState<Item[]>([]);
  const [adventureMovies, setAdventureMovies] = useState<Item[]>([]);
  const [fantasyMovies, setFantasyMovies] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDiverseContent = async () => {
      try {
        setIsLoading(true);
        
        // Priority 1: Load ONLY trending first (fastest to show content)
        const trendingResult = await Promise.race([
          getTrendingNow().catch(() => []),
          new Promise<Item[]>((resolve) => setTimeout(() => resolve([]), 3000)), // 3s timeout
        ]);
        
        if (isMounted) {
          setTrendingAll(Array.isArray(trendingResult) ? trendingResult : []);
          setIsLoading(false); // Show content immediately after trending loads
        }

        // Priority 2: Load top 3 genres in parallel (non-blocking)
        Promise.allSettled([
          getHorrorMovies().catch(() => []),
          getActionMovies().catch(() => []),
          getComedyMovies().catch(() => []),
        ]).then((results) => {
          if (!isMounted) return;
          setHorrorMovies(results[0].status === "fulfilled" ? results[0].value : []);
          setActionMovies(results[1].status === "fulfilled" ? results[1].value : []);
          setComedyMovies(results[2].status === "fulfilled" ? results[2].value : []);
        });

        // Priority 3: Load remaining genres in background (delayed by 2 seconds)
        setTimeout(() => {
          if (!isMounted) return;
          Promise.allSettled([
            getDramaMovies().catch(() => []),
            getThrillerMovies().catch(() => []),
            getRomanceMovies().catch(() => []),
            getSciFiMovies().catch(() => []),
          ]).then((results) => {
            if (!isMounted) return;
            setDramaMovies(results[0].status === "fulfilled" ? results[0].value : []);
            setThrillerMovies(results[1].status === "fulfilled" ? results[1].value : []);
            setRomanceMovies(results[2].status === "fulfilled" ? results[2].value : []);
            setSciFiMovies(results[3].status === "fulfilled" ? results[3].value : []);
          });
        }, 2000);

        // Priority 4: Load other genres in background (delayed by 4 seconds)
        setTimeout(() => {
          if (!isMounted) return;
          Promise.allSettled([
            getAnimationMovies().catch(() => []),
            getDocumentaryMovies().catch(() => []),
            getCrimeMovies().catch(() => []),
            getAdventureMovies().catch(() => []),
            getFantasyMovies().catch(() => []),
          ]).then((results) => {
            if (!isMounted) return;
            setAnimationMovies(results[0].status === "fulfilled" ? results[0].value : []);
            setDocumentaryMovies(results[1].status === "fulfilled" ? results[1].value : []);
            setCrimeMovies(results[2].status === "fulfilled" ? results[2].value : []);
            setAdventureMovies(results[3].status === "fulfilled" ? results[3].value : []);
            setFantasyMovies(results[4].status === "fulfilled" ? results[4].value : []);
          });
        }, 4000);

        // Priority 5: Load ONLY top regional content (delayed by 6 seconds) - Reduced from 20 to 6 calls
        setTimeout(() => {
          if (!isMounted) return;
          Promise.allSettled([
            getAfricanContent().catch(() => []),
            getAsianContent().catch(() => []),
            getNollywoodContent().catch(() => []),
            getBollywoodContent().catch(() => []),
            getKoreanContent().catch(() => []),
            getEnhancedNollywoodContent().catch(() => []),
          ]).then((results) => {
            if (!isMounted) return;
            setAfricanContent(results[0].status === "fulfilled" ? results[0].value : []);
            setAsianContent(results[1].status === "fulfilled" ? results[1].value : []);
            setNollywoodContent(results[2].status === "fulfilled" ? results[2].value : []);
            setBollywoodContent(results[3].status === "fulfilled" ? results[3].value : []);
            setKoreanContent(results[4].status === "fulfilled" ? results[4].value : []);
            setEnhancedNollywood(results[5].status === "fulfilled" ? results[5].value : []);
          });
        }, 6000);

        // Priority 6: Load remaining regional content (delayed by 8 seconds) - Only if user scrolls
        setTimeout(() => {
          if (!isMounted) return;
          Promise.allSettled([
            getLatinAmericanContent().catch(() => []),
            getMiddleEasternContent().catch(() => []),
            getJapaneseContent().catch(() => []),
            getChineseContent().catch(() => []),
            getEastAfricanContent().catch(() => []),
            getSouthAfricanContent().catch(() => []),
          ]).then((results) => {
            if (!isMounted) return;
            setLatinAmericanContent(results[0].status === "fulfilled" ? results[0].value : []);
            setMiddleEasternContent(results[1].status === "fulfilled" ? results[1].value : []);
            setJapaneseContent(results[2].status === "fulfilled" ? results[2].value : []);
            setChineseContent(results[3].status === "fulfilled" ? results[3].value : []);
            setEastAfricanContent(results[4].status === "fulfilled" ? results[4].value : []);
            setSouthAfricanContent(results[5].status === "fulfilled" ? results[5].value : []);
          });
        }, 8000);

        // Priority 7: Load TV-specific and less common content (delayed by 10 seconds)
        setTimeout(() => {
          if (!isMounted) return;
          Promise.allSettled([
            getSoutheastAsianContent().catch(() => []),
            getFilipinoContent().catch(() => []),
            getBrazilianContent().catch(() => []),
            getMexicanContent().catch(() => []),
            getKenyanTVShows().catch(() => []),
            getNigerianTVShows().catch(() => []),
            getAfricanTVContent().catch(() => []),
            getEnhancedKenyanContent().catch(() => []),
          ]).then((results) => {
            if (!isMounted) return;
            setSoutheastAsianContent(results[0].status === "fulfilled" ? results[0].value : []);
            setFilipinoContent(results[1].status === "fulfilled" ? results[1].value : []);
            setBrazilianContent(results[2].status === "fulfilled" ? results[2].value : []);
            setMexicanContent(results[3].status === "fulfilled" ? results[3].value : []);
            setKenyanTVShows(results[4].status === "fulfilled" ? results[4].value : []);
            setNigerianTVShows(results[5].status === "fulfilled" ? results[5].value : []);
            setAfricanTVContent(results[6].status === "fulfilled" ? results[6].value : []);
            setEnhancedKenyan(results[7].status === "fulfilled" ? results[7].value : []);
          });
        }, 10000);
        
      } catch (error) {
        console.error('Error fetching diverse content:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDiverseContent();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Show minimal loading state - content loads progressively
  const hasAnyContent = trendingAll.length > 0 || horrorMovies.length > 0 || 
    actionMovies.length > 0 || comedyMovies.length > 0;
  
  if (isLoading && !hasAnyContent) {
    return (
      <div className="space-y-8 mt-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            🌍 World Cinema
          </h2>
          <p className="text-gray-400 text-lg">
            Loading content...
          </p>
        </div>
        {/* Show only 2 skeleton sections instead of 10 */}
        {[...Array(2)].map((_, index) => (
          <div key={index}>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, itemIndex) => (
                <Skeleton key={itemIndex} className="h-0 pb-[150%] rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalContent = africanContent.length + asianContent.length + 
    latinAmericanContent.length + middleEasternContent.length + 
    nollywoodContent.length + bollywoodContent.length + 
    koreanContent.length + japaneseContent.length + chineseContent.length +
    eastAfricanContent.length + southAfricanContent.length +
    southeastAsianContent.length + filipinoContent.length +
    brazilianContent.length + mexicanContent.length +
    kenyanTVShows.length + nigerianTVShows.length +
    africanTVContent.length + enhancedNollywood.length + enhancedKenyan.length +
    trendingAll.length + horrorMovies.length;

  if (totalContent === 0) {
    return (
      <div className="text-center py-12 mt-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🌍 World Cinema
        </h2>
        <h3 className="text-xl text-gray-400 mb-4">No Diverse Content Available</h3>
        <p className="text-gray-500">
          We're working on adding more African, Asian, and international content to our library.
          <br />
          Check back soon for updates!
        </p>
      </div>
    );
  }

  // Derived curated categories similar to MovieBox-style sections
  const latestNollywoodMovies = enhancedNollywood
    .filter((item) => item.media_type === "movie")
    .sort((a, b) => {
      const ad = (a as any).release_date || (a as any).first_air_date || "";
      const bd = (b as any).release_date || (b as any).first_air_date || "";
      return bd.localeCompare(ad);
    });

  const southAfricanDrama = southAfricanContent.filter((item) => {
    const origin = ((item as any).origin_country || []) as string[];
    const genres = ((item as any).genre_ids || []) as number[];
    return origin.includes("ZA") && genres.includes(18);
  });

  const thaiDrama = southeastAsianContent.filter((item) => {
    const origin = ((item as any).origin_country || []) as string[];
    const genres = ((item as any).genre_ids || []) as number[];
    return origin.includes("TH") && genres.includes(18);
  });

  // Combine multiple sources for Must-watch Black Shows
  const mustWatchBlackShows = [
    ...africanTVContent.filter((item) => item.media_type === "tv"),
    ...nigerianTVShows.filter((item) => item.media_type === "tv"),
    ...kenyanTVShows.filter((item) => item.media_type === "tv"),
    ...enhancedKenyan.filter((item) => item.media_type === "tv"),
  ]
    .filter((item, index, self) => 
      index === self.findIndex((t) => t.id === item.id)
    )
    .slice(0, 20);

  // Combine multiple sources for Must-watch Black Movies
  const mustWatchBlackMovies = [
    ...africanContent.filter((item) => item.media_type === "movie"),
    ...enhancedNollywood.filter((item) => item.media_type === "movie"),
    ...eastAfricanContent.filter((item) => item.media_type === "movie"),
    ...southAfricanContent.filter((item) => item.media_type === "movie"),
  ]
    .filter((item, index, self) => 
      index === self.findIndex((t) => t.id === item.id)
    )
    .slice(0, 20);

  // Enhanced African Cinema & TV Shows - combine all African sources
  const enhancedAfricanCinema = [
    ...africanContent,
    ...enhancedNollywood,
    ...enhancedKenyan,
    ...eastAfricanContent,
    ...southAfricanContent,
    ...africanTVContent,
    ...nigerianTVShows,
    ...kenyanTVShows,
  ]
    .filter((item, index, self) => 
      index === self.findIndex((t) => t.id === item.id)
    )
    .slice(0, 20);
  return (
    <div className="space-y-8 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🌍 World Cinema
        </h2>
        <p className="text-gray-400 text-lg">
          Discover amazing movies and TV shows from around the world
        </p>
      </div>

      {/* Most Trending (all media types) - Filter by currentTab */}
      {trendingAll.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🔥 Most Trending ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
          films={trendingAll.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={10}
          isLoading={false}
          seeMoreParams={{ sort_by: "popularity.desc" }}
        />
      )}

      {/* Horror - Filtered by genre ID 27 and media type */}
      {(() => {
        const filtered = horrorMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(27);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
        <SectionSlider
            title={`👻 Horror ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
          limitNumber={10}
          isLoading={false}
          seeMoreParams={{ genre: "27", sort_by: "popularity.desc" }}
        />
        ) : null;
      })()}

      {/* Must-watch Black Shows (derived from African TV content) - Only show on TV tab */}
      {currentTab === "tv" && mustWatchBlackShows.length > 0 && (
        <SectionSlider
          title="✊🏿 Must-watch Black Shows"
          films={mustWatchBlackShows}
          limitNumber={10}
          isLoading={false}
        />
      )}

      {/* Must-watch Black Movies (African cinema) - Only show on Movie tab */}
      {currentTab === "movie" && mustWatchBlackMovies.length > 0 && (
        <SectionSlider
          title="✊🏿 Must-watch Black Movies"
          films={mustWatchBlackMovies}
          limitNumber={10}
          isLoading={false}
        />
      )}
      {/* Enhanced African Content - Filter by media type */}
      {enhancedAfricanCinema.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🌍 African ${currentTab === "movie" ? "Cinema" : "TV Shows"}`}
          films={enhancedAfricanCinema.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={10}
          isLoading={false}
          seeMoreParams={{ region: "NG|ZA|KE|GH|EG", sort_by: "popularity.desc" }}
        />
      )}

      {/* African TV Shows & Series - Enhanced with more sources - Only show on TV tab */}
      {currentTab === "tv" && (() => {
        // Combine all African TV sources for maximum diversity
        const allAfricanTV = [
          ...africanTVContent.filter((item) => item.media_type === "tv"),
          ...nigerianTVShows.filter((item) => item.media_type === "tv"),
          ...kenyanTVShows.filter((item) => item.media_type === "tv"),
          ...enhancedKenyan.filter((item) => item.media_type === "tv"),
          ...eastAfricanContent.filter((item) => item.media_type === "tv"),
          ...southAfricanContent.filter((item) => item.media_type === "tv"),
        ]
          .filter((item, index, self) => 
            index === self.findIndex((t) => t.id === item.id)
          )
          .slice(0, 20);
        
        return allAfricanTV.length > 0 ? (
          <SectionSlider
            title="📺 African TV Shows & Series"
            films={allAfricanTV}
            limitNumber={15}
            isLoading={false}
          />
        ) : null;
      })()}

      {/* Enhanced Nollywood Content - Filter by media type */}
      {enhancedNollywood.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🎬 Enhanced: ${currentTab === "movie" ? "Movies" : "TV Shows"} from the Nollywood industry (Nigeria)`}
          films={enhancedNollywood.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Enhanced Kenyan Content - Filter by media type */}
      {enhancedKenyan.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇰🇪 Enhanced Kenyan ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
          films={enhancedKenyan.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* African TV Content - Only show on TV tab */}
      {currentTab === "tv" && africanTVContent.length > 0 && (
        <SectionSlider
          title="📺 African TV Shows & Series"
          films={africanTVContent}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* East African Content - Filter by media type */}
      {eastAfricanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🌍 East African ${currentTab === "movie" ? "Cinema" : "TV Shows"} (Kenya, Tanzania, Uganda, Ethiopia)`}
          films={eastAfricanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Kenyan TV Shows - Only show on TV tab */}
      {currentTab === "tv" && kenyanTVShows.length > 0 && (
        <SectionSlider
          title="🇰🇪 Kenyan TV Shows (Citizen TV, NTV Kenya, KTN Kenya)"
          films={kenyanTVShows}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* South African Content - Filter by media type */}
      {southAfricanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇿🇦 South African ${currentTab === "movie" ? "Cinema" : "TV Shows"}`}
          films={southAfricanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* South African Drama - Filter by media type */}
      {southAfricanDrama.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇿🇦 SA Drama ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
          films={southAfricanDrama.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={10}
          isLoading={false}
        />
      )}
      {/* Nollywood Content - Filter by media type */}
      {nollywoodContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🎬 ${currentTab === "movie" ? "Movies" : "TV Shows"} from the Nollywood industry (Nigeria)`}
          films={nollywoodContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Latest Nollywood Movies - Only show on Movie tab */}
      {currentTab === "movie" && latestNollywoodMovies.length > 0 && (
        <SectionSlider
          title="🆕 Latest Nollywood Movies"
          films={latestNollywoodMovies}
          limitNumber={10}
          isLoading={false}
        />
      )}
      {/* Nigerian TV Shows - Only show on TV tab */}
      {currentTab === "tv" && nigerianTVShows.length > 0 && (
        <SectionSlider
          title="🇳🇬 Nigerian TV Shows & Series"
          films={nigerianTVShows}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Asian Content - Filter by media type */}
      {asianContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🌏 Asian ${currentTab === "movie" ? "Cinema" : "TV Shows"}`}
          films={asianContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Southeast Asian Content - Filter by media type */}
      {southeastAsianContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🌏 Southeast Asian ${currentTab === "movie" ? "Cinema" : "TV Shows"} (Thailand, Vietnam, Malaysia, Singapore, Indonesia)`}
          films={southeastAsianContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Thai Drama - Filter by media type */}
      {thaiDrama.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇹🇭 Thai Drama ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
          films={thaiDrama.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={10}
          isLoading={false}
        />
      )}
      {/* Filipino Content - Filter by media type */}
      {filipinoContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇵🇭 Filipino ${currentTab === "movie" ? "Cinema" : "TV Shows"}`}
          films={filipinoContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Bollywood Content - Filter by media type */}
      {bollywoodContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🎭 Bollywood (Indian ${currentTab === "movie" ? "Movies" : "TV Shows"})`}
          films={bollywoodContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Korean Content - Filter by media type */}
      {koreanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇰🇷 Korean ${currentTab === "movie" ? "Movies" : "Drama"}`}
          films={koreanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Japanese Content - Filter by media type */}
      {japaneseContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇯🇵 Japanese ${currentTab === "movie" ? "Movies" : "Anime"}`}
          films={japaneseContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Chinese Content - Filter by media type */}
      {chineseContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇨🇳 ${currentTab === "movie" ? "Chinese Cinema" : "C-Drama"}`}
          films={chineseContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Genre Categories from MovieBox.ph - Properly filtered by genre and media type */}
      {(() => {
        const filtered = actionMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(28);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`💥 Action ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
            seeMoreParams={{ genre: "28", sort_by: "popularity.desc" }}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = comedyMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(35);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`😂 Comedy ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
            seeMoreParams={{ genre: "35", sort_by: "popularity.desc" }}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = dramaMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(18);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`🎭 Drama ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
            seeMoreParams={{ genre: "18", sort_by: "popularity.desc" }}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = thrillerMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(53);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`🔪 Thriller ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = romanceMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(10749);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`💕 Romance ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = sciFiMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(878);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`🚀 Sci-Fi ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = animationMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(16);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`🎨 Animation ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = documentaryMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(99);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`📹 Documentary ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = crimeMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(80);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`🔫 Crime ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = adventureMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(12);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`🗺️ Adventure ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
          />
        ) : null;
      })()}

      {(() => {
        const filtered = fantasyMovies.filter((item) => {
          const hasGenre = item.genre_ids && item.genre_ids.includes(14);
          const matchesMediaType = currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv";
          return hasGenre && matchesMediaType;
        });
        return filtered.length > 0 ? (
          <SectionSlider
            title={`✨ Fantasy ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
            films={filtered}
            limitNumber={10}
            isLoading={false}
          />
        ) : null;
      })()}

      {/* Latin American Content - Filter by media type */}
      {latinAmericanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🌎 Latin American ${currentTab === "movie" ? "Cinema" : "TV Shows"}`}
          films={latinAmericanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Brazilian Content - Filter by media type */}
      {brazilianContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇧🇷 Brazilian ${currentTab === "movie" ? "Cinema" : "TV Shows"}`}
          films={brazilianContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Mexican Content - Filter by media type */}
      {mexicanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🇲🇽 Mexican ${currentTab === "movie" ? "Cinema" : "TV Shows"}`}
          films={mexicanContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}

      {/* Middle Eastern Content - Filter by media type */}
      {middleEasternContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv").length > 0 && (
        <SectionSlider
          title={`🕌 Middle Eastern ${currentTab === "movie" ? "Cinema" : "TV Shows"}`}
          films={middleEasternContent.filter((item) => currentTab === "movie" ? item.media_type === "movie" : item.media_type === "tv")}
          limitNumber={8}
          isLoading={false}
        />
      )}
    </div>
  );
};

export default DiverseContent;
