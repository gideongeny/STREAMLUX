import React, { FC, useState, useEffect, useRef, memo, useTransition } from "react";
import { motion } from "framer-motion";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link } from "react-router-dom";

import Sidebar from "../components/Common/Sidebar";
import SEO from "../components/Common/SEO";
import Footer from "../components/Footer/Footer";
import MainHomeFilm from "../components/Home/MainHomeFilm";

import DiverseNavigation from "../components/Common/DiverseNavigation";
import DiverseContent from "../components/Home/DiverseContent";
import CinematicMoments from "../components/Home/CinematicMoments";
import SportsChannelsCarousel from "../components/Sports/SportsChannelsCarousel";
import SportsHub from "../features/sports/SportsHub";
import LiveSportsTicker from "../components/Sports/LiveSportsTicker";
import LiveTVHub from "../features/livetv/LiveTVHub";
import MusicHub from "../features/music/MusicHub";
import ContinueWatching from "../components/Home/ContinueWatching";
import SmartRecommendations from "../components/Home/SmartRecommendations";
import Top10Slider from "../components/Home/Top10Slider";
import VerticalShorts from "../components/Home/VerticalShorts";
import UpcomingCalendar from "../components/Home/UpcomingCalendar";
import NewReleases from "../components/Home/NewReleases";
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
import { useAppSelector } from "../store/hooks";
import { useScrollPersistence } from "../hooks/useScrollPersistence";
import { useTranslation } from "react-i18next";
import SectionSlider from "../components/Slider/SectionSlider";
import LazySection from "../components/Common/LazySection";
import HomeSkeleton from "../components/Home/HomeSkeleton";
import Logo from "../components/Common/Logo";
import { Item } from "../shared/types";

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
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [activeGlowImage, setActiveGlowImage] = useState<string | undefined>(undefined);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTab, setCurrentTab] = useState<"movie" | "tv" | "sports" | "live-tv" | "music">(getInitialTab);
  const [brandMovies, setBrandMovies] = useState<Item[]>([]);
  const [brandTV, setBrandTV] = useState<Item[]>([]);
  const [isBrandLoading, setIsBrandLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const swipeStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Read active brand from URL \u2014 safe
  const activeBrand = (() => {
    try {
      return new URLSearchParams(window.location.search).get("brand");
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

  // Sync tab state with URL parameter (back/forward navigation support)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam && tabParam !== currentTab && ["movie", "tv", "sports", "live-tv", "music"].includes(tabParam)) {
      setCurrentTab(tabParam as any);
    }
  }, [window.location.search, currentTab]);

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

  // Always fetch both tabs eagerly \u2014 Keep-Alive: data is ready instantly when switching
  const {
    data: dataMovie,
    isLoading: isLoadingMovie,
    isError: isErrorMovie,
    detailQuery: detailQueryMovie,
  } = useHomeData("movie", historyItems, true);

  const {
    data: dataTV,
    isLoading: isLoadingTV,
    isError: isErrorTV,
    detailQuery: detailQueryTV,
  } = useHomeData("tv", historyItems, true);

  const TABS: Array<"tv" | "movie" | "sports" | "live-tv" | "music"> = ["tv", "movie", "sports", "live-tv", "music"];

  const handleTabChange = (tab: "movie" | "tv" | "sports" | "live-tv" | "music") => {
    startTransition(() => {
      setCurrentTab(tab);
      setSearchQuery(""); // Clear search when switching tabs
      // Update URL without reload to support deep linking/back button
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    });
  };

  const handleSwipeTouchStart = (e: React.TouchEvent) => {
    swipeStartRef.current = {
      x: e.touches[0]?.clientX ?? 0,
      y: e.touches[0]?.clientY ?? 0,
      time: Date.now(),
    };
  };

  const handleSwipeTouchEnd = (e: React.TouchEvent) => {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - swipeStartRef.current.x;
    const dy = (e.changedTouches[0]?.clientY ?? 0) - swipeStartRef.current.y;
    const dt = Date.now() - swipeStartRef.current.time;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 400) {
      const idx = TABS.indexOf(currentTab);
      handleTabChange(dx < 0
        ? TABS[(idx + 1) % TABS.length]
        : TABS[(idx - 1 + TABS.length) % TABS.length]
      );
    }
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
      <AmbientGlow imageUrl={activeGlowImage} activeBrand={activeBrand} />

      {/* Mobile Header */}
      <div className={`flex md:hidden flex-col fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? "tw-glass bg-dark/60 shadow-lg backdrop-blur-xl" : "bg-dark"}`}>
        <div className="flex justify-between items-center px-5 py-4">
          <Link to="/" className="flex gap-2 items-center shrink-0">
            <Logo className="w-10 h-10" />
          </Link>
          <TopSearchBar className="flex-1 mx-3" activeTab={currentTab} onSearch={setSearchQuery} />
          <button onClick={() => setIsSidebarActive((prev) => !prev)} className="shrink-0 text-white">
            <GiHamburgerMenu size={25} />
          </button>
        </div>
        <div className="px-5 pb-2">
          <div className="inline-flex gap-8 border-b border-gray-darken/30 w-full overflow-x-auto no-scrollbar">
            <FilmTypeButton buttonType="tv" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
            <FilmTypeButton buttonType="movie" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
            <FilmTypeButton buttonType="sports" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
            <FilmTypeButton buttonType="live-tv" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
            <FilmTypeButton buttonType="music" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
          </div>

        </div>
      </div>

      <div className="h-[120px] md:hidden" />

      <div className="flex items-start relative max-w-full overflow-x-hidden" onTouchStart={handleSwipeTouchStart} onTouchEnd={handleSwipeTouchEnd}>
        <Sidebar onCloseSidebar={() => setIsSidebarActive(false)} isSidebarActive={isSidebarActive} />

        {/* Desktop Header */}
        <div className="hidden md:flex fixed top-0 left-[260px] right-0 h-20 items-center justify-between px-8 bg-dark/80 backdrop-blur-xl border-b border-gray-darken z-[80]">
          <div className="flex items-center gap-10">
            <div className="flex gap-10 pb-4">
              <FilmTypeButton buttonType="tv" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
              <FilmTypeButton buttonType="movie" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
              <FilmTypeButton buttonType="sports" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
              <FilmTypeButton buttonType="live-tv" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
              <FilmTypeButton buttonType="music" currentTab={currentTab} onSetCurrentTab={handleTabChange} />
            </div>

          </div>
          <div className="flex items-center gap-6">
            <TopSearchBar className="w-[300px] lg:block hidden" activeTab={currentTab} onSearch={setSearchQuery} />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-tight">{welcome.mood}</p>
                <p className="text-sm font-bold text-white tracking-tight">{currentUser?.displayName || "Guest"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden border border-white/10">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || ""} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const span = document.createElement('span');
                        span.innerText = (currentUser?.displayName?.[0] || "G").toUpperCase();
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span>{(currentUser?.displayName?.[0] || "G").toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow md:pt-28 pt-0 pb-7 md:px-[2vw] px-[4vw] min-h-screen bg-dark relative z-0 max-w-full overflow-x-hidden md:ml-[260px]">

          {/* Brand Isolated View */}
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
                {/* TV-only brands (Nickelodeon, Cartoon Network) */}
                {(activeBrand === "nickelodeon" || activeBrand === "cartoonnetwork") ? (
                  <SectionSlider
                    title={`${activeBrand === "cartoonnetwork" ? "Cartoon Network" : "Nickelodeon"} Shows`}
                    films={brandTV.length > 0 ? brandTV : brandMovies}
                    isLoading={isBrandLoading}
                  />
                ) : activeBrand === "007" ? (
                  // 007: only movies from the Bond collection
                  <SectionSlider
                    title="James Bond Films"
                    films={brandMovies}
                    isLoading={isBrandLoading}
                  />
                ) : (
                  // All other brands \u2014 show both movies and TV if available
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
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Non-brand content \u2014 Keep-Alive: all tabs mount once, CSS hides/shows them */}
          {!activeBrand && (
            <>
              {/* CinematicMoments: only for movie/tv \u2014 hide for sports/live-tv/music */}
              <div style={{ display: (currentTab === 'movie' || currentTab === 'tv') ? 'block' : 'none' }}>
                <CinematicMoments />
              </div>

              {/* \u2500\u2500 MOVIES TAB \u2500\u2500 */}
              <div style={{ display: currentTab === 'movie' ? 'block' : 'none' }}>
                {isLoadingMovie && !dataMovie
                  ? <HomeSkeleton />
                  : <MainHomeFilm
                      data={dataMovie}
                      dataDetail={detailQueryMovie?.data}
                      isLoadingBanner={detailQueryMovie?.isLoading ?? false}
                      isLoadingSection={isLoadingMovie}
                      onActiveImageChange={setActiveGlowImage}
                      brandHub={<BrandHub className="mb-10 px-0" />}
                    />
                }
              </div>

              {/* \u2500\u2500 TV TAB \u2500\u2500 */}
              <div style={{ display: currentTab === 'tv' ? 'block' : 'none' }}>
                {isLoadingTV && !dataTV
                  ? <HomeSkeleton />
                  : <MainHomeFilm
                      data={dataTV}
                      dataDetail={detailQueryTV?.data}
                      isLoadingBanner={detailQueryTV?.isLoading ?? false}
                      isLoadingSection={isLoadingTV}
                      onActiveImageChange={setActiveGlowImage}
                      brandHub={<BrandHub className="mb-10 px-0" />}
                    />
                }
              </div>

              {/* \u2500\u2500 SPORTS TAB \u2500\u2500 */}
              <div style={{ display: currentTab === 'sports' ? 'block' : 'none' }} className="mt-6 flex flex-col">
                <SportsChannelsCarousel />
                <div className="mt-4">
                  <SportsHub searchQuery={searchQuery} />
                </div>
              </div>

              {/* \u2500\u2500 LIVE TV TAB \u2500\u2500 */}
              <div style={{ display: currentTab === 'live-tv' ? 'block' : 'none' }} className="mt-6">
                <LiveTVHub isEmbed searchQuery={searchQuery} />
              </div>

              {/* \u2500\u2500 MUSIC TAB \u2500\u2500 */}
              <div style={{ display: currentTab === 'music' ? 'block' : 'none' }} className="mt-6">
                <MusicHub isEmbed searchQuery={searchQuery} />
              </div>

              {/* \u2500\u2500 SHARED NON-SPORTS/LIVETV SECTIONS \u2500\u2500 */}
              <div style={{ display: (currentTab === 'movie' || currentTab === 'tv') ? 'block' : 'none' }}>
                <LazySection title="Top 10 Globally" placeholderHeight={300}>
                  <Top10Slider films={(currentTab === 'movie' ? dataMovie?.Trending : dataTV?.Trending) || []} />
                </LazySection>

                <LazySection title="Live Matches" placeholderHeight={100}>
                  <LiveSportsTicker />
                </LazySection>

                <CollectionsSlider />

                <LazySection title="Pick Up Where You Left Off" placeholderHeight={250}>
                  <ContinueWatching watchHistory={watchHistory || []} onClearProgress={clearProgress} />
                </LazySection>

                <LazySection title="Recommended For You" placeholderHeight={300}>
                  <SmartRecommendations />
                </LazySection>

                <LazySection title="Quick Clips" placeholderHeight={300}>
                  <VerticalShorts variant="horizontal" />
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
            </>
          )}
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
      <span className="text-[12px] uppercase tracking-[0.15em]">
        {buttonType === "movie" ? t("Movies") : 
         buttonType === "tv" ? t("TV Shows") : 
         buttonType === "sports" ? t("Sports") :
         buttonType === "live-tv" ? t("Live TV") : t("Music")}
      </span>
      {isActive && <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
    </button>
  );
});

export default Home;
