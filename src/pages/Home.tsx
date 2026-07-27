import React, { FC, useState, useEffect, useRef, memo, useTransition } from "react";
import { motion } from "framer-motion";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import SEO from "../components/Common/SEO";
import Footer from "../components/Footer/Footer";
import MainHomeFilm from "../components/Home/MainHomeFilm";

import DiverseNavigation from "../components/Common/DiverseNavigation";
import DiverseContent from "../components/Home/DiverseContent";
import CinematicMoments from "../components/Home/CinematicMoments";
import SportsHub from "../features/sports/SportsHub";
import LiveTVHub from "../features/livetv/LiveTVHub";
import MusicHub from "../features/music/MusicHub";
import ContinueWatching from "../components/Home/ContinueWatching";
import SmartRecommendations from "../components/Home/SmartRecommendations";
import TopRankingSlider from "../components/Home/TopRankingSlider";
import UpcomingCalendar from "../components/Home/UpcomingCalendar";
import NewReleases from "../components/Home/NewReleases";
import GenresHorizontalList from "../components/Home/GenresHorizontalList";
import ComingSoonSlider from "../components/Home/ComingSoonSlider";
import GlobalWorldTV from "../components/Home/GlobalWorldTV";
import AdBanner from "../components/Ads/AdBanner";
import AmbientGlow from "../components/Common/AmbientGlow";
import TopSearchBar from "../components/Common/TopSearchBar";
import BrandHub from "../components/Home/BrandHub";
import CollectionsSlider from "../components/Home/CollectionsSlider";
import { getTMDBByBrand } from "../services/movieAPIs";
import { useHomeData } from "../hooks/useHomeData";
import { useWatchProgress } from "../hooks/useWatchProgress";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { pause } from "../store/slice/musicSlice";
import { useScrollPersistence } from "../hooks/useScrollPersistence";
import { useTranslation } from "react-i18next";
import SectionSlider from "../components/Slider/SectionSlider";
import LazySection from "../components/Common/LazySection";
import AwardWinners from "../components/Home/AwardWinners";
import TopRated from "../components/Home/TopRated";
import TrendingSlider from "../components/Home/TrendingSlider";
import HomeSkeleton from "../components/Home/HomeSkeleton";
import Logo from "../components/Common/Logo";
import { Item } from "../shared/types";
import { useSidebar } from "../hooks/useSidebar";

const BRAND_LOGOS: Record<string, string> = {
  disney: "/logos/Walt-Disney-Logo-1.png",
  pixar: "/logos/Pixar-emblem.jpg",
  marvel: "/logos/Marvel_Studios_logo.jpg",
  starwars: "/logos/Star-wars-logo-new-tall.jpg",
  natgeo: "/logos/Natgeologo.svg",
  dc: "/logos/DC_Comics_2024.svg.png",
  "007": "/logos/png-clipart-logo-brand-white-james-bond-miscellaneous-angle.png",
  nickelodeon: "/logos/Nickelodeon_2023_logo.png",
  cartoonnetwork: "/logos/Cartoon-Network-logo.jpg",
};

const getInitialTab = (): "movie" | "tv" | "sports" | "live-tv" | "music" => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam && ["movie", "tv", "sports", "live-tv", "music"].includes(tabParam)) {
      return tabParam as any;
    }

    const stored = typeof window !== "undefined" ? localStorage.getItem("currentTab") : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (["movie", "tv", "sports", "live-tv", "music"].includes(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return "tv";
};

const Home: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const dispatch = useAppDispatch();
  const [activeGlowImage, setActiveGlowImage] = useState<string | undefined>(undefined);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTab, setCurrentTab] = useState<"movie" | "tv" | "sports" | "live-tv" | "music">(getInitialTab);
  const [isPending, startTransition] = useTransition();
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [brandMovies, setBrandMovies] = useState<Item[]>([]);
  const [brandTV, setBrandTV] = useState<Item[]>([]);
  const [isBrandLoading, setIsBrandLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const swipeStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Read active brand from URL — safe
  const activeBrand = (() => {
    try {
      return new URLSearchParams(location.search).get("brand");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("currentTab", JSON.stringify(currentTab));
    } catch { /* ignore */ }
  }, [currentTab]);

  // Sync tab state with React Router location parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get("tab");
    
    if (tabParam && ["movie", "tv", "sports", "live-tv", "music"].includes(tabParam)) {
      if (tabParam !== currentTab) {
        setIsTabLoading(true);
        startTransition(() => {
          setCurrentTab(tabParam as any);
          setIsTabLoading(false);
        });
      }
    } else if (!tabParam) {
      // Handle navigation back to base '/' (e.g. clicking Home from Sports)
      let defaultTab: any = "tv";
      try {
        const stored = localStorage.getItem("currentTab");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed === "movie" || parsed === "tv") defaultTab = parsed;
        }
      } catch {}
      
      if (currentTab !== defaultTab) {
        setIsTabLoading(true);
        startTransition(() => {
          setCurrentTab(defaultTab);
          setIsTabLoading(false);
        });
      }
    }
  }, [location.search, currentTab]);

  // Fetch brand content when brand param changes
  useEffect(() => {
    if (!activeBrand) {
      setBrandMovies([]);
      setBrandTV([]);
      return;
    }
    setIsBrandLoading(true);

    const tvOnlyBrands = ["nickelodeon", "cartoonnetwork"];
    const movieOnlyBrands = ["007"];
    const isTvOnly = tvOnlyBrands.includes(activeBrand);
    const isMovieOnly = movieOnlyBrands.includes(activeBrand);

    const movieFetch = isMovieOnly || !isTvOnly
      ? getTMDBByBrand(activeBrand, "movie").catch(() => [] as Item[])
      : Promise.resolve([] as Item[]);

    const tvFetch = isTvOnly || !isMovieOnly
      ? getTMDBByBrand(activeBrand, "tv").catch(() => [] as Item[])
      : Promise.resolve([] as Item[]);

    Promise.all([movieFetch, tvFetch]).then(([movies, tv]) => {
      setBrandMovies(movies || []);
      setBrandTV(tv || []);
    }).finally(() => setIsBrandLoading(false));
  }, [activeBrand]);

  useScrollPersistence("home");

  const { watchHistory, clearProgress } = useWatchProgress();
  const { marginClass, widthClass, isMobile, isSidebarVisible } = useSidebar();

  // Safe mapped history items
  const historyItems: Item[] = (watchHistory || []).map((w: any) => ({
    id: w?.mediaId ?? 0,
    media_type: w?.mediaType ?? "movie",
    title: w?.title ?? "",
    name: w?.title ?? "",
    poster_path: w?.posterPath ?? "",
    backdrop_path: w?.posterPath ?? "",
    overview: "",
    genre_ids: [],
    original_language: "en",
    popularity: 0,
    vote_count: 0,
    vote_average: 0,
  }));

  // Always fetch both tabs eagerly — Keep-Alive: data is ready instantly when switching
  const {
    data: dataMovie,
    isLoading: isLoadingMovie,
    isError: isErrorMovie,
    detailQuery: detailQueryMovie,
  } = useHomeData("movie", historyItems, currentTab === 'movie');

  const {
    data: dataTV,
    isLoading: isLoadingTV,
    isError: isErrorTV,
    detailQuery: detailQueryTV,
  } = useHomeData("tv", historyItems, currentTab === 'tv');

  const HOME_TABS: Array<"tv" | "movie"> = ["tv", "movie"];

  const handleTabChange = (tab: "movie" | "tv" | "sports" | "live-tv" | "music") => {
    // Pause music if moving away from music tab as requested
    if (currentTab === "music" && tab !== "music") {
      dispatch(pause());
    }
    
    setIsTabLoading(true);
    setSearchQuery(""); // Clear search when switching tabs
    
    startTransition(() => {
      navigate(`/?tab=${tab}`, { replace: true });
    });
  };



  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", mood: "🌅 Morning Boost" };
    if (hour < 18) return { text: "Good Afternoon", mood: "☀️ Daily Hits" };
    if (hour < 22) return { text: "Good Evening", mood: "🎬 Prime Time" };
    return { text: "Late Night", mood: "🌙 Night Cinephile" };
  };

  const welcome = getGreeting();

  if (isErrorMovie && isErrorTV) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark text-white">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Error Loading Content</h2>
          <p className="text-gray-400 mb-6">Please check your internet connection and try again.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-primary rounded-lg">
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={currentTab === "movie" ? "Movies" : currentTab === "tv" ? "TV Shows" : "Live Sports"}
        description="Explore premium content on StreamLux."
      />
      <TopSearchBar activeTab={currentTab} onSearch={setSearchQuery} />
      <AmbientGlow imageUrl={activeGlowImage} activeBrand={activeBrand} />

      <div className="flex items-start relative max-w-full overflow-x-hidden">
        <div 
          className={`flex-grow md:pt-24 pt-16 pb-7 md:px-[2vw] px-[4vw] min-h-screen bg-cinema-black relative z-0 overflow-x-hidden transition-all duration-700 ease-cinema`}
          style={{ 
            marginLeft: !isMobile && isSidebarVisible ? '260px' : '0',
            width: !isMobile && isSidebarVisible ? 'calc(100% - 260px)' : '100%'
          }}
        >
          
          <div className="relative z-10">
            {activeBrand && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-10 flex flex-col items-center border-b border-white/5 mb-8">
                <img
                  src={BRAND_LOGOS[activeBrand] || `/logos/${activeBrand}.svg`}
                  alt={activeBrand}
                  className="h-16 md:h-24 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const text = document.createElement("h1");
                      text.className = "text-5xl font-black uppercase tracking-tighter text-white";
                      text.innerText = activeBrand;
                      parent.appendChild(text);
                    }
                  }}
                />
                <div className="w-full mt-12 space-y-12">
                  {(activeBrand === "nickelodeon" || activeBrand === "cartoonnetwork") ? (
                    <SectionSlider
                      title={`${activeBrand === "cartoonnetwork" ? "Cartoon Network" : "Nickelodeon"} Shows`}
                      films={brandTV.length > 0 ? brandTV : brandMovies}
                      isLoading={isBrandLoading}
                    />
                  ) : activeBrand === "007" ? (
                    <SectionSlider
                      title="James Bond Films"
                      films={brandMovies}
                      isLoading={isBrandLoading}
                    />
                  ) : (
                    <>
                      {(brandMovies.length > 0 || isBrandLoading) && (
                        <SectionSlider
                          title={`${activeBrand.charAt(0).toUpperCase() + activeBrand.slice(1)} Movies`}
                          films={brandMovies}
                          isLoading={isBrandLoading}
                        />
                      )}
                      {(brandTV.length > 0 || isBrandLoading) && (
                        <SectionSlider
                          title={`${activeBrand.charAt(0).toUpperCase() + activeBrand.slice(1)} Series`}
                          films={brandTV}
                          isLoading={isBrandLoading}
                        />
                      )}
                      {!isBrandLoading && brandMovies.length === 0 && brandTV.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-8">
                          No titles found for this studio. Try another brand or browse Movies / TV Shows.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {!activeBrand && (
              <>
                {/* Mobile Movie/TV Switch */}
                {(currentTab === 'movie' || currentTab === 'tv') && (
                  <div className="md:hidden flex justify-center mb-6 mt-2 relative z-20">
                    <div className="bg-white/[0.03] p-1.5 rounded-full border border-white/[0.06] backdrop-blur-[40px] flex items-center relative shadow-cinema-card">
                      <motion.div
                        layout
                        className="absolute top-1.5 bottom-1.5 w-[110px] rounded-full bg-primary/20 border border-primary/30"
                        initial={false}
                        animate={{
                          left: currentTab === 'tv' ? 6 : 116,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                      <button
                        onClick={() => handleTabChange('tv')}
                        className={`relative z-10 w-[110px] py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                          currentTab === 'tv' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500'
                        }`}
                      >
                        TV Shows
                      </button>
                      <button
                        onClick={() => handleTabChange('movie')}
                        className={`relative z-10 w-[110px] py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                          currentTab === 'movie' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500'
                        }`}
                      >
                        Movies
                      </button>
                    </div>
                  </div>
                )}

                {isTabLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center min-h-[50vh] w-full"
                  >
                    <div className="w-16 h-16 border-4 border-white/5 border-t-primary rounded-full animate-spin"></div>
                    <p className="mt-6 text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading Content...</p>
                  </motion.div>
                ) : (
                  <>
                    {currentTab === 'movie' && (
                      <div>
                        {isLoadingMovie && !dataMovie
                          ? <HomeSkeleton />
                          : <MainHomeFilm
                            data={dataMovie}
                            dataDetail={detailQueryMovie?.data}
                            isLoadingBanner={detailQueryMovie?.isLoading ?? false}
                            isLoadingSection={isLoadingMovie}
                            onActiveImageChange={setActiveGlowImage}
                            brandHub={<BrandHub className="mb-10 px-0" />}
                            topSections={
                              <>
                                <div className="mb-4 mt-6">
                                  <GenresHorizontalList currentTab={currentTab} />
                                </div>
                                <div className="mb-4">
                                  <CinematicMoments />
                                </div>
                                <ContinueWatching 
                                  watchHistory={watchHistory} 
                                  onClearProgress={clearProgress} 
                                />
                                <TopRankingSlider films={dataMovie?.Top20Today || dataMovie?.Trending || []} />
                                <SmartRecommendations />
                              </>
                            }
                          />
                        }
                      </div>
                    )}

                    {currentTab === 'tv' && (
                      <div>
                        {isLoadingTV && !dataTV
                          ? <HomeSkeleton />
                          : <MainHomeFilm
                            data={dataTV}
                            dataDetail={detailQueryTV?.data}
                            isLoadingBanner={detailQueryTV?.isLoading ?? false}
                            isLoadingSection={isLoadingTV}
                            onActiveImageChange={setActiveGlowImage}
                            brandHub={<BrandHub className="mb-10 px-0" />}
                            topSections={
                              <>
                                <div className="mb-4 mt-6">
                                  <GenresHorizontalList currentTab={currentTab} />
                                </div>
                                <div className="mb-4">
                                  <CinematicMoments />
                                </div>
                                <ContinueWatching 
                                  watchHistory={watchHistory} 
                                  onClearProgress={clearProgress} 
                                />
                                <TopRankingSlider films={dataTV?.Top20Today || dataTV?.Trending || []} />
                                <SmartRecommendations />
                              </>
                            }
                          />
                        }
                      </div>
                    )}

                    {currentTab === 'sports' && (
                      <div className="mt-6 flex flex-col">
                        <div className="mt-4">
                          <SportsHub searchQuery={searchQuery} />
                        </div>
                      </div>
                    )}

                    {currentTab === 'live-tv' && (
                      <div className="mt-6">
                        <LiveTVHub isEmbed searchQuery={searchQuery} />
                      </div>
                    )}

                    {currentTab === 'music' && (
                      <div className="mt-6">
                        <MusicHub isEmbed searchQuery={searchQuery} />
                      </div>
                    )}

                    {(currentTab === 'movie' || currentTab === 'tv') && (
                      <div>
                        <CollectionsSlider />

                        <LazySection title="Trending Right Now" placeholderHeight={300}>
                          <TrendingSlider currentTab={currentTab} />
                        </LazySection>

                        <LazySection title="All-Time Top Rated" placeholderHeight={300}>
                          <TopRated currentTab={currentTab} />
                        </LazySection>

                        <LazySection title="Recommended For You" placeholderHeight={300}>
                          <SmartRecommendations />
                        </LazySection>

                        <LazySection title="Award Winners & Masterpieces" placeholderHeight={300}>
                          <AwardWinners currentTab={currentTab} />
                        </LazySection>

                        <LazySection title="Upcoming" placeholderHeight={400}>
                          <UpcomingCalendar contentType={currentTab as any} />
                        </LazySection>

                        <LazySection title="Just Released" placeholderHeight={300}>
                          <NewReleases />
                        </LazySection>

                        <LazySection title="Coming Soon" placeholderHeight={300}>
                          <ComingSoonSlider />
                        </LazySection>

                        <div className="my-10">
                          <AdBanner position="home" />
                        </div>

                        <LazySection title="World Cinema" placeholderHeight={300}>
                          <GlobalWorldTV />
                        </LazySection>

                        <DiverseNavigation />
                        <DiverseContent currentTab={currentTab} />

                        <div className="my-10">
                          <AdBanner position="home" />
                        </div>
                      </div>
                    )}
                  </>
                )}
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
  onSetCurrentTab: (currentTab: "movie" | "tv" | "sports" | "live-tv" | "music") => void;
  currentTab: string;
  buttonType: "movie" | "tv" | "sports" | "live-tv" | "music";
}

const FilmTypeButton: FC<FilmTypeButtonProps> = memo(({ onSetCurrentTab, currentTab, buttonType }) => {
  const { t } = useTranslation();
  const isActive = currentTab === buttonType;
  return (
    <button
      onClick={() => onSetCurrentTab(buttonType)}
      className={`relative transition duration-300 hover:text-white pb-1 whitespace-nowrap ${isActive ? "text-white font-black" : "text-gray-400"}`}
    >
      <span className="text-[11px] uppercase tracking-[0.25em] font-bold">
        {buttonType === "movie" ? t("Movies") :
          buttonType === "tv" ? t("TV Shows") :
            buttonType === "sports" ? t("Sports") :
              buttonType === "live-tv" ? t("Live TV") : t("Music")}
      </span>
      {isActive && <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_0_15px_rgba(255,107,53,0.5)]" />}
    </button>
  );
});

export default Home;
