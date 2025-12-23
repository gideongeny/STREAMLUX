import { FC, useState, useEffect } from "react";
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

const Home: FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);

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
    return "tv";
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

  if (isErrorMovie) return <p>ERROR: {(errorMovie as Error).message}</p>;

  if (detailQueryMovie.isError)
    return <p>ERROR: {detailQueryMovie.error.message}</p>;

  if (isErrorTV) return <p>ERROR: {(errorTV as Error).message}</p>;

  if (detailQueryTV.isError) return <p>ERROR: {detailQueryTV.error.message}</p>;

  return (
    <>
      <Title value="StreamLux | Free Movies, TV Shows & Live Sports" />

      <div className="flex md:hidden justify-between items-center px-5 my-5">
        <Link to="/" className="flex gap-2 items-center">
          <img
            src="/logo.svg"
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
              <p>{currentUser?.displayName || "Anonymous"}</p>
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
            <MainHomeFilm
              data={dataMovie}
              dataDetail={detailQueryMovie.data}
              isLoadingBanner={detailQueryMovie.isLoading}
              isLoadingSection={isLoadingMovie}
            />
          )}
          {currentTab === "tv" && (
            <MainHomeFilm
              data={dataTV}
              dataDetail={detailQueryTV.data}
              isLoadingBanner={detailQueryTV.isLoading}
              isLoadingSection={isLoadingTV}
            />
          )}

          {/* Live Sports Ticker (MovieBox.ph style) - Wrapped in ErrorBoundary */}
          <ErrorBoundary fallback={null}>
            <LiveSportsTicker />
          </ErrorBoundary>

          {/* Live & Upcoming Sports Section (MovieBox-style) - Already has ErrorBoundary */}
          <LiveSports />

          {/* Discover World navigation (moved from sidebar) */}
          <DiverseNavigation />

          {/* Discover World content */}
          <DiverseContent currentTab={currentTab as "movie" | "tv" | "sports"} />
        </div>

        <div className="shrink-0 max-w-[310px] w-full hidden lg:block px-6 top-0 sticky ">
          <SearchBox />
          <RecommendGenres currentTab={currentTab} />
          <TrendingNow />
          {/* DiverseNavigation removed from sidebar */}
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
      className={`relative transition duration-300 hover:text-white ${
        isActive ? "text-white font-medium" : ""
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
