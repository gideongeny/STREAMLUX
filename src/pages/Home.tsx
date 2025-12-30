import { FC, useState, useEffect, useMemo, lazy, Suspense, useCallback } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import Sidebar from "../components/Common/Sidebar";
import Title from "../components/Common/Title";
import MainHomeFilm from "../components/Home/MainHomeFilm";
import LiveSports from "../components/Home/LiveSports";
import LiveSportsTicker from "../components/Sports/LiveSportsTicker";
import ErrorBoundary from "../components/Common/ErrorBoundary";
import { useHomeData } from "../hooks/useHomeData";
import { useAppSelector } from "../store/hooks";
import { useWatchProgress } from "../hooks/useWatchProgress";
import { useQuery } from "@tanstack/react-query";
import { getTop10Trending } from "../services/home";
// Lazy load non-critical components for performance (Android TV & Slow Web optimization)
const AdBanner = lazy(() => import("../components/Common/AdBanner"));
const ContinueWatching = lazy(() => import("../components/Home/ContinueWatching"));
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

const Home: FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentProfile = useAppSelector((state) => state.auth.currentProfile);
  const { watchHistory, clearProgress } = useWatchProgress();

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

  const { data: top10Data } = useQuery(["top10"], getTop10Trending, {
    select: (data: any) => filterContent(data as any[])
  });

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

  const {
    data: dataMovie,
    isLoading: isLoadingMovie,
    isError: isErrorMovie,
    detailQuery: detailQueryMovie,
    bannerData: bannerDataMovie,
  } = useHomeData("movies");
  const {
    data: dataTV,
    isLoading: isLoadingTV,
    isError: isErrorTV,
    detailQuery: detailQueryTV,
    bannerData: bannerDataTV,
  } = useHomeData("tvs");

  // Apply filters to grouped data - use useMemo to prevent unnecessary recalculations
  const filteredDataMovie = useMemo(() => {
    if (!dataMovie) return undefined;
    const filtered = Object.keys(dataMovie).reduce((acc, key) => {
      acc[key] = filterContent(dataMovie[key]);
      return acc;
    }, {} as any);
    // If all sections are empty after filtering, return original data to prevent empty state
    const hasAnyData = Object.values(filtered).some(section => Array.isArray(section) && section.length > 0);
    return hasAnyData ? filtered : dataMovie;
  }, [dataMovie, filterContent]);

  const filteredDataTV = useMemo(() => {
    if (!dataTV) return undefined;
    const filtered = Object.keys(dataTV).reduce((acc, key) => {
      acc[key] = filterContent(dataTV[key]);
      return acc;
    }, {} as any);
    // If all sections are empty after filtering, return original data to prevent empty state
    const hasAnyData = Object.values(filtered).some(section => Array.isArray(section) && section.length > 0);
    return hasAnyData ? filtered : dataTV;
  }, [dataTV, filterContent]);

  const filteredBannerMovie = useMemo(() => {
    return filterContent(bannerDataMovie || []);
  }, [bannerDataMovie, filterContent]);

  const filteredBannerTV = useMemo(() => {
    return filterContent(bannerDataTV || []);
  }, [bannerDataTV, filterContent]);

  // Error handling moved to inside the JSX to keep the sidebar visible


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
          {currentTab === "sports" && (
            <ErrorBoundary fallback={<div className="text-red-500 p-10 text-center">Failed to load Sports section.</div>}>
              <div className="pt-4 mb-10">
                <LiveSports />
              </div>
            </ErrorBoundary>
          )}

          {/* Conditionally show sections based on tab */}
          {currentTab !== "sports" ? (
            <>
              {/* Ad Banner (MovieBox Style) - Lazy loaded for Android TV performance */}
              <Suspense fallback={<div className="h-[90px]" />}>
                <div className="px-4 md:px-8 mb-6 mt-4">
                  <AdBanner />
                </div>
              </Suspense>


              {/* Continue Watching Section */}
              <div className="px-4 md:px-8">
                <Suspense fallback={<div className="h-20" />}>
                  <ContinueWatching watchHistory={watchHistory} onClearProgress={clearProgress} />
                </Suspense>
              </div>

              {/* Top 10 Section */}
              {showLowerSections && (
                <Suspense fallback={<div className="h-40" />}>
                  <Top10Slider films={top10Data || []} />
                </Suspense>
              )}

              {/* Trending Section (Horizontal) */}
              {showLowerSections && (
                <div className="mt-12">
                  <Suspense fallback={<div className="h-40" />}>
                    <TrendingNow isMainFlow={true} />
                  </Suspense>
                </div>
              )}

              {/* HOT Section (Horizontal) */}
              {showLowerSections && dataMovie?.Hot && (
                <div className="mt-12 px-4 md:px-8">
                  <Suspense fallback={<div className="h-40" />}>
                    <SectionSlider
                      films={dataMovie.Hot}
                      title="🔥 HOT & Trending"
                      seeMoreParams={{ sort_by: "popularity.desc", page: 2 }}
                    />
                  </Suspense>
                </div>
              )}

              {/* Upcoming Calendar Section (MovieBox Style) */}
              <div className="px-4 md:px-8">
                <Suspense fallback={<div className="h-40" />}>
                  <UpcomingCalendar />
                </Suspense>
              </div>

              {/* Horizontal Shorts Section (Discovery Mode) */}
              {!currentProfile?.isKid && showLowerSections && (
                <div className="px-4 md:px-8 mt-12">
                  <Suspense fallback={<div className="h-40" />}>
                    <VerticalShorts variant="horizontal" />
                  </Suspense>
                </div>
              )}

              {/* Because You Watched Section */}
              {showLowerSections && (
                <Suspense fallback={<div className="h-40" />}>
                  <BecauseYouWatched />
                </Suspense>
              )}

              {showLowerSections && (
                <Suspense fallback={<div className="h-40" />}>
                  <NewReleases />
                </Suspense>
              )}

              {/* Live Sports Ticker (MovieBox.ph style) - Only in Movie/TV tabs as a teaser */}
              {!currentProfile?.isKid && showLowerSections && (
                <ErrorBoundary fallback={null}>
                  <LiveSportsTicker />
                </ErrorBoundary>
              )}

              {/* Live & Upcoming Sports Section (Teaser) */}
              {!currentProfile?.isKid && showLowerSections && <LiveSports />}

              {/* Discover World navigation */}
              <DiverseNavigation currentTab={currentTab as "movie" | "tv" | "sports"} />

              {/* Discover World content */}
              <ErrorBoundary fallback={<div className="p-10 text-center text-gray-500">Some content could not be loaded.</div>}>
                {showLowerSections && <DiverseContent currentTab={currentTab as "movie" | "tv" | "sports"} />}
              </ErrorBoundary>
            </>
          ) : (
            <div className="mt-4">
              {/* Specialized Sports Layout */}
              <LiveSportsTicker />
              <div className="mt-8">
                <LiveSports />
              </div>
              <div className="mt-12 px-4 md:px-8">
                <UpcomingCalendar />
              </div>
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
