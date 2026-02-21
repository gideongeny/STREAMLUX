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
import SportsMainContent from "../components/Sports/SportsMainContent";
import LiveSportsTicker from "../components/Sports/LiveSportsTicker";
import ContinueWatching from "../components/Home/ContinueWatching";
import SmartRecommendations from "../components/Home/SmartRecommendations";
import ErrorBoundary from "../components/Common/ErrorBoundary";
import Top10Slider from "../components/Home/Top10Slider";
import VerticalShorts from "../components/Home/VerticalShorts";
import UpcomingCalendar from "../components/Home/UpcomingCalendar";
import NewReleases from "../components/Home/NewReleases";
import ComingSoonSlider from "../components/Home/ComingSoonSlider";
import SectionErrorBoundary from "../components/Common/SectionErrorBoundary";
import SmartAdContainer from "../components/Common/SmartAdContainer";
import AdBanner from "../components/Ads/AdBanner";
import CinematicMoments from "../components/Home/CinematicMoments";
import AmbientGlow from "../components/Common/AmbientGlow";
import { useHomeData } from "../hooks/useHomeData";
import { useWatchProgress } from "../hooks/useWatchProgress";
import { useAppSelector } from "../store/hooks";

const Home: FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [activeGlowImage, setActiveGlowImage] = useState<string | undefined>(undefined);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


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

  const { watchHistory, clearProgress } = useWatchProgress();

  // Elite Aspect: Context-Aware Mood & Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning, Enjoy your favorites!", mood: "🌅 Morning Boost", color: "text-blue-400" };
    if (hour < 18) return { text: "Good Afternoon, Catch up on trending!", mood: "☀️ Daily Hits", color: "text-yellow-400" };
    if (hour < 22) return { text: "Good Evening, Prime Time viewing!", mood: "🎬 Prime Time", color: "text-red-400" };
    return { text: "Late Night, Ready for a deep dive?", mood: "🌙 Night Cinephile", color: "text-purple-400" };
  };

  const welcome = getGreeting();

  const handleTabChange = (tab: "movie" | "tv" | "sports") => {
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

  if (isErrorMovie) return (
    <div className="flex items-center justify-center min-h-screen bg-dark text-white">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Error Loading Movies</h2>
        <p className="text-gray-400">{(errorMovie as Error).message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary rounded-lg hover:bg-primary/80"
        >
          Reload Page
        </button>
      </div>
    </div>
  );

  if (detailQueryMovie.isError)
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark text-white">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Error Loading Movie Details</h2>
          <p className="text-gray-400">{detailQueryMovie.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-primary rounded-lg hover:bg-primary/80"
          >
            Reload Page
          </button>
        </div>
      </div>
    );

  if (isErrorTV) return (
    <div className="flex items-center justify-center min-h-screen bg-dark text-white">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Error Loading TV Shows</h2>
        <p className="text-gray-400">{(errorTV as Error).message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary rounded-lg hover:bg-primary/80"
        >
          Reload Page
        </button>
      </div>
    </div>
  );

  if (detailQueryTV.isError) return (
    <div className="flex items-center justify-center min-h-screen bg-dark text-white">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Error Loading TV Details</h2>
        <p className="text-gray-400">{detailQueryTV.error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary rounded-lg hover:bg-primary/80"
        >
          Reload Page
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Title value="StreamLux | Free Movies, TV Shows & Live Sports" />
      <AmbientGlow imageUrl={activeGlowImage} />

      <div className={`flex md:hidden justify-between items-center px-5 py-4 sticky top-0 z-[100] transition-all duration-300 ${isScrolled ? "tw-glass bg-dark/60 shadow-lg backdrop-blur-xl" : "bg-transparent"
        }`}>
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

      <div className="flex items-start relative max-w-full overflow-x-hidden">
        <Sidebar
          onCloseSidebar={() => setIsSidebarActive(false)}
          isSidebarActive={isSidebarActive}
        />

        <div
          className="flex-grow md:pt-7 pt-0 pb-7 border-x md:px-[2vw] px-[4vw] border-gray-darken min-h-screen bg-dark relative z-0 max-w-full overflow-x-hidden"
        >
          {/* Tab header row */}
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
            <div className="flex flex-col items-end gap-1">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{welcome.text}</p>
              <div className="flex gap-4 items-center">
                <p className="font-bold text-white flex items-center gap-2">
                  {currentUser?.displayName || "Guest"}
                  <span className={`text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/10 ${welcome.color}`}>{welcome.mood}</span>
                </p>
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
          </div>

          <CinematicMoments />

          {/* Main Banner Slider for Movies/TV */}
          {currentTab === "movie" && (
            <MainHomeFilm
              data={dataMovie}
              dataDetail={detailQueryMovie.data}
              isLoadingBanner={detailQueryMovie.isLoading}
              isLoadingSection={isLoadingMovie}
              onActiveImageChange={setActiveGlowImage}
            />
          )}
          {currentTab === "tv" && (
            <MainHomeFilm
              data={dataTV}
              dataDetail={detailQueryTV.data}
              isLoadingBanner={detailQueryTV.isLoading}
              isLoadingSection={isLoadingTV}
              onActiveImageChange={setActiveGlowImage}
            />
          )}

          {/* Conditional Sections based on Tab */}
          {currentTab === "sports" ? (
            <div className="mt-6">
              <SportsMainContent />
            </div>
          ) : (
            <>
              {/* Top 10 Section - Movie/TV Only */}
              <SectionErrorBoundary fallback={null}>
                <Top10Slider films={(currentTab === "movie" ? dataMovie?.Trending : dataTV?.Trending) || []} />
              </SectionErrorBoundary>

              {/* Sports Ticker (Optional for Movie/TV views) */}
              <SectionErrorBoundary fallback={null}>
                <LiveSportsTicker />
              </SectionErrorBoundary>

              {/* Continue Watching Shelf */}
              <ErrorBoundary fallback={null}>
                <ContinueWatching
                  watchHistory={watchHistory}
                  onClearProgress={clearProgress}
                />
              </ErrorBoundary>

              {/* AI-Powered Recommendations */}
              <ErrorBoundary fallback={null}>
                <SmartRecommendations />
              </ErrorBoundary>

              {/* Must-Watch Vertical Shorts */}
              <ErrorBoundary fallback={null}>
                <VerticalShorts variant="horizontal" />
              </ErrorBoundary>

              {/* Upcoming Content Calendar */}
              <ErrorBoundary fallback={null}>
                <UpcomingCalendar contentType={currentTab as any} />
              </ErrorBoundary>

              {/* New Releases & Fast Discovery */}
              <ErrorBoundary fallback={null}>
                <NewReleases />
              </ErrorBoundary>

              {/* Coming Soon — Future release dates only */}
              <ErrorBoundary fallback={null}>
                <ComingSoonSlider />
              </ErrorBoundary>

              {/* MovieBox-Style Ad Banner - Promotes App Download */}
              <AdBanner position="home" />

              {/* Inline Ad - Non-intrusive (only shows after 10 seconds) */}
              <SmartAdContainer position="inline" minViewTime={10000} />

              {/* Discover World navigation */}
              <DiverseNavigation />

              {/* Discover World content */}
              <DiverseContent currentTab={currentTab as "movie" | "tv" | "sports"} />
            </>
          )}

          <div className="shrink-0 max-w-[310px] w-full hidden lg:block px-6 top-0 sticky ">
            <SearchBox />
            {currentTab !== "sports" && (
              <>
                <RecommendGenres currentTab={currentTab} />
                <TrendingNow />
              </>
            )}
          </div>
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
