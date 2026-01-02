import { FC, useState, useEffect, useMemo, lazy, Suspense, useCallback } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Common/Sidebar";
import Title from "../components/Common/Title";
import MainHomeFilm from "../components/Home/MainHomeFilm";
import ErrorBoundary from "../components/Common/ErrorBoundary";
import SectionErrorBoundary from "../components/Common/SectionErrorBoundary";
import { useHomeData } from "../hooks/useHomeData";
import { useAppSelector } from "../store/hooks";
import { useWatchProgress } from "../hooks/useWatchProgress";
import { useQuery } from "@tanstack/react-query";
import { getTop10Movies, getTop10TVs, getEnhancedKenyanContent } from "../services/home";
import { getEnrichedScrapedContent } from "../services/scrapedContent";
// Lazy load non-critical components for performance (Android TV & Slow Web optimization)
const AdBanner = lazy(() => import("../components/Common/AdBanner"));
const ContinueWatching = lazy(() => import("../components/Home/ContinueWatching"));
const ContinueWatchingRail = lazy(() => import("../components/Home/ContinueWatchingRail"));
const Top10Slider = lazy(() => import("../components/Home/Top10Slider"));
const TrendingNow = lazy(() => import("../components/Home/TrendingNow"));
const BecauseYouWatched = lazy(() => import("../components/Home/BecauseYouWatched"));
const NewReleases = lazy(() => import("../components/Home/NewReleases"));
const UpcomingCalendar = lazy(() => import("../components/Home/UpcomingCalendar"));
const SectionSlider = lazy(() => import("../components/Slider/SectionSlider"));
const VerticalShorts = lazy(() => import("../components/Home/VerticalShorts"));
const DiverseNavigation = lazy(() => import("../components/Common/DiverseNavigation"));
const DiverseContent = lazy(() => import("../components/Home/DiverseContent"));
const Footer = lazy(() => import("../components/Footer/Footer"));
const LiveSportsAlert = lazy(() => import("../components/Sports/LiveSportsAlert"));
const SearchBox = lazy(() => import("../components/Common/SearchBox"));
const RecommendGenres = lazy(() => import("../components/Home/RecommendGenres"));
const SportsMainContent = lazy(() => import("../components/Sports/SportsMainContent"));

const Home: FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentProfile = useAppSelector((state) => state.auth.currentProfile);
  const { watchHistory, clearProgress } = useWatchProgress();
  const navigate = useNavigate();

  // Kid Mode Filter Logic
  const filterContent = useCallback((items: any[]) => {
    if (!items) return [];
    if (!currentProfile?.isKid) return items;
    // Allow Animation (16) and Family (10751)
    return items.filter(item =>
      item?.genre_ids?.includes(16) ||
      item?.genre_ids?.includes(10751) ||
      item?.genres?.some((g: any) => g.id === 16 || g.id === 10751)
    );
  }, [currentProfile?.isKid]);


  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [showLowerSections, setShowLowerSections] = useState(false);

  useEffect(() => {
    // Delay non-critical components to speed up initial mount and interaction
    const timer = setTimeout(() => {
      setShowLowerSections(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);


  const getInitialTab = () => {
    try {
      const stored = localStorage.getItem("currentTab");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed === "movie" || parsed === "tv" || parsed === "sports") return parsed;
        } catch {
          if (stored === "movie" || stored === "tv" || stored === "sports") return stored as any;
        }
      }
    } catch (error) {
      console.warn("Error reading currentTab from localStorage:", error);
    }
    return "movie";
  };

  const [currentTab, setCurrentTab] = useState<"movie" | "tv" | "sports">(() => getInitialTab());

  // Sync to localStorage when currentTab changes
  useEffect(() => {
    try {
      localStorage.setItem("currentTab", JSON.stringify(currentTab));
    } catch (error) {
      console.warn("Error saving currentTab to localStorage:", error);
    }
  }, [currentTab]);

  const handleTabChange = (tab: "movie" | "tv" | "sports") => {
    setCurrentTab(tab);
  };

  const { data: top10Data } = useQuery(["top10", currentTab], () => {
    if (currentTab === "movie") return getTop10Movies();
    if (currentTab === "tv") return getTop10TVs();
    return getTop10Movies(); // Default
  }, {
    select: (data: any) => filterContent(data as any[])
  });

  // Fetch Kenyan content
  const { data: kenyanContent } = useQuery(["kenyanContent"], getEnhancedKenyanContent, {
    staleTime: 1000 * 60 * 30, // 30 minutes
    select: (data: any) => filterContent(data as any[])
  });

  // Fetch enriched scraped content (with TMDB posters)
  const { data: scrapedContent } = useQuery(["scrapedContent"], getEnrichedScrapedContent, {
    staleTime: 1000 * 60 * 60, // 1 hour (expensive operation)
    select: (data: any) => filterContent(data as any[])
  });

  const {
    data: dataMovie,
    isLoading: isLoadingMovie,
    isError: isErrorMovie,
    detailQuery: detailQueryMovie,
    bannerData: bannerDataMovie,
  } = useHomeData("movies", currentTab === "movie");
  const {
    data: dataTV,
    isLoading: isLoadingTV,
    isError: isErrorTV,
    detailQuery: detailQueryTV,
    bannerData: bannerDataTV,
  } = useHomeData("tvs", currentTab === "tv");

  // Helper to merge scraped content into TMDB sliders
  const mergeScrapedContent = (tmdbData: any, scrapedItems: any[]) => {
    if (!tmdbData || !scrapedItems || scrapedItems.length === 0) return tmdbData;

    const merged = { ...tmdbData };

    // 1. Distribute into specific categories
    Object.keys(merged).forEach(category => {
      if (!Array.isArray(merged[category])) return;

      const catLower = category.toLowerCase();

      // Filter appropriate items for this category
      const relevantScraped = scrapedItems.filter((item: any) => {
        // Trending/Hot/Top: Take high-rated items
        if (['trending', 'hot', 'top', 'popular'].some(k => catLower.includes(k))) {
          return item.vote_average > 6.0;
        }
        // Genre matching
        return item.genres?.some((g: any) => catLower.includes(g.name.toLowerCase()));
      });

      // 2. Aggressive Injection: Interleave or Prepend
      if (relevantScraped.length > 0) {
        // Strategy: Add relevant scraped items to the BEGINNING of the list to ensure visibility
        // But keep the very first item as TMDB for banner consistency if needed, or just mix top 5.

        // Take up to 10 relevant scraped items
        const itemsToInject = relevantScraped.slice(0, 15);

        // Remove duplicates based on ID or Title
        const existingIds = new Set(merged[category].map((i: any) => i.id));
        const uniqueInjects = itemsToInject.filter((i: any) => !existingIds.has(i.id));

        // SPLICE them in at varied positions for "filling" effect
        // Inject 2 scraped items for every 3 existing items
        uniqueInjects.forEach((item: any, idx: number) => {
          // Insert at index 1, 3, 5, etc.
          const insertPos = Math.min((idx * 2) + 1, merged[category].length);
          merged[category].splice(insertPos, 0, item);
        });
      }
    });

    return merged;
  };

  // Apply filters and merge scraped content
  const filteredDataMovie = useMemo(() => {
    if (!dataMovie) return undefined;

    let processed = { ...dataMovie };

    // Merge scraped movies
    if (scrapedContent) {
      const scrapedMovies = scrapedContent.filter((item: any) => item.media_type === "movie");
      processed = mergeScrapedContent(processed, scrapedMovies);
    }

    const filtered: any = {};
    Object.entries(processed).forEach(([key, value]) => {
      filtered[key] = filterContent(value as any[]);
    });

    const hasAnyData = Object.values(filtered).some(section => Array.isArray(section) && section.length > 0);
    return hasAnyData ? filtered : processed;
  }, [dataMovie, filterContent, scrapedContent]);

  const filteredDataTV = useMemo(() => {
    if (!dataTV) return undefined;

    let processed = { ...dataTV };

    // Merge scraped TV shows
    if (scrapedContent) {
      const scrapedTV = scrapedContent.filter((item: any) => item.media_type === "tv");
      processed = mergeScrapedContent(processed, scrapedTV);
    }

    const filtered: any = {};
    Object.entries(processed).forEach(([key, value]) => {
      filtered[key] = filterContent(value as any[]);
    });

    const hasAnyData = Object.values(filtered).some(section => Array.isArray(section) && section.length > 0);
    return hasAnyData ? filtered : processed;
  }, [dataTV, filterContent, scrapedContent]);

  const filteredBannerMovie = useMemo(() => {
    // Also inject into banner if popular
    let banners = bannerDataMovie ? [...bannerDataMovie] : [];
    if (scrapedContent && banners.length > 0) {
      const topScraped = scrapedContent
        .filter((item: any) => item.media_type === 'movie' && item.vote_average > 7.5)
        .slice(0, 3);
      banners = [...topScraped, ...banners];
    }
    return filterContent(banners);
  }, [bannerDataMovie, filterContent, scrapedContent]);

  const filteredBannerTV = useMemo(() => {
    let banners = bannerDataTV ? [...bannerDataTV] : [];
    if (scrapedContent && banners.length > 0) {
      const topScraped = scrapedContent
        .filter((item: any) => item.media_type === 'tv' && item.vote_average > 7.5)
        .slice(0, 3);
      banners = [...topScraped, ...banners];
    }
    return filterContent(banners);
  }, [bannerDataTV, filterContent, scrapedContent]);

  // Debug state monitoring
  useEffect(() => {
    console.log(`%c[StreamLux] %cActive Tab: ${currentTab}`, "color:#10b981;font-weight:bold", "color:gray");
  }, [currentTab]);

  return (
    <>
      <Title value="StreamLux | Free Movies, TV Shows & Live Sports" />

      <div className="flex md:hidden justify-between items-center px-5 my-5">
        <Link to="/" className="flex gap-2 items-center">
          <img
            src="/logo.png"
            alt="StreamLux Logo"
            className="h-10 w-10"
          />
          <p className="text-xl text-white font-medium tracking-wider uppercase">
            Stream<span className="text-primary">Lux</span>
          </p>
        </Link>
        <button onClick={() => setIsSidebarActive((prev) => !prev)}>
          <GiHamburgerMenu size={25} />
        </button>
      </div>

      <div className="flex items-start relative">
        <Sidebar
          onCloseSidebar={() => setIsSidebarActive(false)}
          isSidebarActive={isSidebarActive}
        />

        <div
          className="flex-grow md:pt-7 pt-0 pb-7 border-x md:px-[2vw] px-[4vw] border-gray-darken min-h-screen bg-dark relative z-0 min-w-0"
        >
          <div className="flex justify-between md:items-end items-center">
            <div className="inline-flex gap-[40px] pb-[14px] border-b border-gray-darken relative">
              <FilmTypeButton
                buttonType="tv"
                currentTab={currentTab}
                onSetCurrentTab={handleTabChange}
              />
              <FilmTypeButton
                buttonType="movie"
                currentTab={currentTab}
                onSetCurrentTab={handleTabChange}
              />
              <FilmTypeButton
                buttonType="sports"
                currentTab={currentTab}
                onSetCurrentTab={handleTabChange}
              />
            </div>
            <div className="flex gap-6 items-center">
              <p>{(currentUser?.displayName?.trim() && currentUser.displayName.trim() !== "undefined undefined") ? currentUser.displayName.trim() : "Anonymous"}</p>
              <LazyLoadImage
                src={
                  currentUser
                    ? (currentUser.photoURL as string)
                    : "/defaultAvatar.jpg"
                }
                alt="User avatar"
                className="w-7 h-7 rounded-full object-cover"
                effect="opacity"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {currentTab === "movie" && (
            <ErrorBoundary fallback={<div className="text-red-500 p-10 text-center">Failed to load movie section.</div>}>
              {isErrorMovie ? (
                <div className="text-red-500 p-10 text-center">Failed to load movies. Please check your connection.</div>
              ) : (
                <MainHomeFilm
                  data={filteredDataMovie}
                  bannerData={filteredBannerMovie}
                  dataDetail={detailQueryMovie.data}
                  isLoadingBanner={detailQueryMovie.isLoading}
                  isLoadingSection={isLoadingMovie}
                />
              )}
            </ErrorBoundary>
          )}
          {currentTab === "tv" && (
            <ErrorBoundary fallback={<div className="text-red-500 p-10 text-center">Failed to load TV section.</div>}>
              {isErrorTV ? (
                <div className="text-red-500 p-10 text-center">Failed to load TV shows. Please check your connection.</div>
              ) : (
                <MainHomeFilm
                  data={filteredDataTV}
                  bannerData={filteredBannerTV}
                  dataDetail={detailQueryTV.data}
                  isLoadingBanner={detailQueryTV.isLoading}
                  isLoadingSection={isLoadingTV}
                />
              )}
            </ErrorBoundary>
          )}

          {/* Conditionally show sections based on tab */}
          {currentTab !== "sports" ? (
            <>
              {/* Continue Watching Rail (MovieBox Style) */}
              {currentUser && (
                <Suspense fallback={<div className="h-[200px]" />}>
                  <div className="mt-8">
                    <ContinueWatchingRail />
                  </div>
                </Suspense>
              )}

              {/* Ad Banner (MovieBox Style) - Lazy loaded for Android TV performance */}
              <Suspense fallback={<div className="h-[90px]" />}>
                <div className="px-4 md:px-8 mb-6 mt-4">
                  <AdBanner />
                </div>
              </Suspense>



              {/* Continue Watching Section */}
              <div className="px-4 md:px-8">
                <Suspense fallback={<div className="h-20" />}>
                  <SectionErrorBoundary>
                    <ContinueWatching watchHistory={watchHistory} onClearProgress={clearProgress} />
                  </SectionErrorBoundary>
                </Suspense>
              </div>

              {/* Top 10 Section */}
              {showLowerSections && (
                <Suspense fallback={<div className="h-40" />}>
                  <SectionErrorBoundary>
                    <Top10Slider films={top10Data || []} />
                  </SectionErrorBoundary>
                </Suspense>
              )}

              {/* Trending Section (Horizontal) */}
              {showLowerSections && (
                <div className="mt-12">
                  <Suspense fallback={<div className="h-40" />}>
                    <SectionErrorBoundary>
                      <TrendingNow isMainFlow={true} />
                    </SectionErrorBoundary>
                  </Suspense>
                </div>
              )}

              {/* HOT Section (Horizontal) */}
              {showLowerSections && dataMovie?.Hot && (
                <div className="mt-12 px-4 md:px-8">
                  <Suspense fallback={<div className="h-40" />}>
                    <SectionErrorBoundary>
                      <SectionSlider
                        films={dataMovie.Hot}
                        title="🔥 HOT & Trending"
                        seeMoreParams={{ sort_by: "popularity.desc", page: 2 }}
                      />
                    </SectionErrorBoundary>
                  </Suspense>
                </div>
              )}

              {/* Upcoming Calendar Section (MovieBox Style) */}
              <div className="px-4 md:px-8">
                <Suspense fallback={<div className="h-40" />}>
                  <SectionErrorBoundary>
                    <UpcomingCalendar
                      title={currentTab === "movie" ? "Upcoming Movies" : "Upcoming TV Releases"}
                      contentType={currentTab as "movie" | "tv"}
                    />
                  </SectionErrorBoundary>
                </Suspense>
              </div>

              {/* Horizontal Shorts Section (Discovery Mode) */}
              {!currentProfile?.isKid && showLowerSections && (
                <div className="px-4 md:px-8 mt-12">
                  <Suspense fallback={<div className="h-40" />}>
                    <SectionErrorBoundary>
                      <VerticalShorts variant="horizontal" />
                    </SectionErrorBoundary>
                  </Suspense>
                </div>
              )}

              {/* Because You Watched Section */}
              {showLowerSections && (
                <Suspense fallback={<div className="h-40" />}>
                  <SectionErrorBoundary>
                    <BecauseYouWatched />
                  </SectionErrorBoundary>
                </Suspense>
              )}

              {/* Kenyan Content Section */}
              {showLowerSections && kenyanContent && kenyanContent.length > 0 && (
                <div className="px-4 md:px-8 mt-12">
                  <Suspense fallback={<div className="h-40" />}>
                    <SectionErrorBoundary>
                      <SectionSlider
                        films={kenyanContent.filter((item: any) => item.media_type === currentTab)}
                        title={currentTab === "movie" ? "🇰🇪 Kenyan Movies" : "🇰🇪 Kenyan TV Shows"}
                        seeMoreParams={{ region: "kenya" }}
                      />
                    </SectionErrorBoundary>
                  </Suspense>
                </div>
              )}



              {showLowerSections && (
                <Suspense fallback={<div className="h-40" />}>
                  <SectionErrorBoundary>
                    <NewReleases />
                  </SectionErrorBoundary>
                </Suspense>
              )}

              {/* Discover World navigation */}
              <DiverseNavigation currentTab={currentTab as "movie" | "tv" | "sports"} />

              {/* Discover World content */}
              <SectionErrorBoundary>
                {showLowerSections && <DiverseContent currentTab={currentTab as "movie" | "tv" | "sports"} />}
              </SectionErrorBoundary>
            </>
          ) : (
            <div className="mt-4">
              <Suspense fallback={<div className="h-40 bg-gray-800/20 rounded-xl animate-pulse" />}>
                <SectionErrorBoundary>
                  <SportsMainContent />
                </SectionErrorBoundary>
              </Suspense>
            </div>
          )}
        </div>


        <div className="shrink-0 max-w-[310px] w-full hidden lg:block px-6 top-0 sticky ">
          <ErrorBoundary fallback={null}>
            <Suspense fallback={<div className="w-full h-10 bg-gray-800 animate-pulse rounded" />}>
              <SearchBox />
            </Suspense>
            <Suspense fallback={<div className="w-full h-40 bg-gray-800 animate-pulse rounded mt-6" />}>
              <RecommendGenres currentTab={currentTab} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <LiveSportsAlert />
      </Suspense>
    </>
  );
};

interface FilmTypeButtonProps {
  onSetCurrentTab: (currentTab: "movie" | "tv" | "sports") => void;
  currentTab: string;
  buttonType: "movie" | "tv" | "sports";
}
const FilmTypeButton: FC<FilmTypeButtonProps> = ({
  onSetCurrentTab,
  currentTab,
  buttonType,
}) => {
  const getButtonText = () => {
    if (buttonType === "movie") return "Movies";
    if (buttonType === "tv") return "TV Show";
    return "Sports";
  };

  const isActive = currentTab === buttonType;

  return (
    <button
      onClick={() => {
        onSetCurrentTab(buttonType);
      }}
      className={`relative transition duration-300 hover:text-white ${isActive ? "text-white font-medium" : ""
        }`}
    >
      {getButtonText()}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-white" />
      )}
    </button>
  );
};

export default Home;
