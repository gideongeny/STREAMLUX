import { FC, useState, useEffect, lazy, Suspense } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import SearchBox from "../components/Common/SearchBox";
import Sidebar from "../components/Common/Sidebar";
import Title from "../components/Common/Title";
import Footer from "../components/Footer/Footer";
import MainHomeFilm from "../components/Home/MainHomeFilm";
import RecommendGenres from "../components/Home/RecommendGenres";
import TrendingNow from "../components/Home/TrendingNow";
import DiverseNavigation from "../components/Common/DiverseNavigation";
import DiverseContent from "../components/Home/DiverseContent";
import LiveSports from "../components/Home/LiveSports";
import LiveSportsTicker from "../components/Sports/LiveSportsTicker";
import ErrorBoundary from "../components/Common/ErrorBoundary";
import { useHomeData } from "../hooks/useHomeData";
import { useAppSelector } from "../store/hooks";

import ContinueWatching from "../components/Home/ContinueWatching";
import { useWatchProgress } from "../hooks/useWatchProgress";
import Top10Slider from "../components/Home/Top10Slider";
import { useQuery } from "@tanstack/react-query";
import { getTop10Trending } from "../services/home";
import BecauseYouWatched from "../components/Home/BecauseYouWatched";
import NewReleases from "../components/Home/NewReleases";

// Lazy load for performance (Android TV optimization)
const AdBanner = lazy(() => import("../components/Common/AdBanner"));

const Home: FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentProfile = useAppSelector((state) => state.auth.currentProfile);
  const { watchHistory, clearProgress } = useWatchProgress();

  // Kid Mode Filter Logic
  const filterContent = (items: any[]) => {
    if (!items) return [];
    if (!currentProfile?.isKid) return items;
    // Allow Animation (16) and Family (10751)
    return items.filter(item =>
      item?.genre_ids?.includes(16) ||
      item?.genre_ids?.includes(10751) ||
      item?.genres?.some((g: any) => g.id === 16 || g.id === 10751)
    );
  };

  const { data: top10Data } = useQuery(["top10"], getTop10Trending, {
    select: (data) => filterContent(data)
  });

  const [isSidebarActive, setIsSidebarActive] = useState(false);


  ///////////////////////////////////////////////////////////////////////////////////
  // WAY 1: MANUALLY SET UP LOCAL STORAGE

  // const [currentTab, setCurrentTab] = useState(
  //   localStorage.getItem("currentTab") || "tv"
  // );
  // useEffect(() => {
  //   localStorage.setItem("currentTab", currentTab);
  // }, [currentTab]);

  ///////////////////////////////////////////////////////////////////////////////////
  // WAY 2: USE useLocalStorage from @uidotdev/usehooks
  // Wrap in try-catch to handle invalid JSON in localStorage
  const getInitialTab = () => {
    try {
      const stored = localStorage.getItem("currentTab");
      if (stored) {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(stored);
          if (parsed === "movie" || parsed === "tv" || parsed === "sports") {
            return parsed;
          }
        } catch {
          // If not JSON, check if it's a plain string
          if (stored === "movie" || stored === "tv" || stored === "sports") {
            return stored;
          }
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
    if (tab === "sports") {
      window.open("https://sportslive.run/live?utm_source=MB_Website&sportType=football", "_blank");
      return;
    }
    setCurrentTab(tab);
  };

  const {
    data: dataMovie,
    isLoading: isLoadingMovie,
    isError: isErrorMovie,
    error: errorMovie,
    detailQuery: detailQueryMovie,
  } = useHomeData("movies");
  const {
    data: dataTV,
    isLoading: isLoadingTV,
    isError: isErrorTV,
    error: errorTV,
    detailQuery: detailQueryTV,
  } = useHomeData("tvs");

  // Apply filters to grouped data
  const filteredDataMovie = dataMovie ? Object.keys(dataMovie).reduce((acc, key) => {
    acc[key] = filterContent(dataMovie[key]);
    return acc;
  }, {} as any) : undefined;

  const filteredDataTV = dataTV ? Object.keys(dataTV).reduce((acc, key) => {
    acc[key] = filterContent(dataTV[key]);
    return acc;
  }, {} as any) : undefined;

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
          className="flex-grow md:pt-7 pt-0 pb-7 border-x md:px-[2vw] px-[4vw] border-gray-darken min-h-screen bg-dark relative z-0"
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
                  dataDetail={detailQueryTV.data}
                  isLoadingBanner={detailQueryTV.isLoading}
                  isLoadingSection={isLoadingTV}
                />
              )}
            </ErrorBoundary>
          )}

          {/* Ad Banner (MovieBox Style) - Lazy loaded for Android TV performance */}
          <Suspense fallback={<div className="h-[90px]" />}>
            <div className="px-4 md:px-8 mb-6 mt-4">
              <AdBanner />
            </div>
          </Suspense>

          {/* Continue Watching Section */}
          <div className="px-4 md:px-8">
            <ContinueWatching watchHistory={watchHistory} onClearProgress={clearProgress} />
          </div>


          {/* Top 10 Section */}
          <Top10Slider films={top10Data || []} />

          {/* Because You Watched Section */}
          <BecauseYouWatched />

          <NewReleases />

          {/* Live Sports Ticker (MovieBox.ph style) - Wrapped in ErrorBoundary */}
          {!currentProfile?.isKid && (
            <ErrorBoundary fallback={null}>
              <LiveSportsTicker />
            </ErrorBoundary>
          )}

          {/* Live & Upcoming Sports Section (MovieBox-style) - Already has ErrorBoundary */}
          {!currentProfile?.isKid && <LiveSports />}

          {/* Discover World navigation (moved from sidebar) */}
          <DiverseNavigation />

          {/* Discover World content */}
          <ErrorBoundary fallback={<div className="p-10 text-center text-gray-500">Some content could not be loaded.</div>}>
            <DiverseContent currentTab={currentTab as "movie" | "tv" | "sports"} />
          </ErrorBoundary>
        </div>

        <div className="shrink-0 max-w-[310px] w-full hidden lg:block px-6 top-0 sticky ">
          <ErrorBoundary fallback={null}>
            <SearchBox />
            <RecommendGenres currentTab={currentTab} />
            <TrendingNow />
          </ErrorBoundary>
        </div>
      </div>



      <Footer />
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
