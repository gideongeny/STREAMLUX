import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { FunctionComponent, useEffect, useState, useRef, useCallback } from "react";
import { AiFillStar, AiTwotoneCalendar } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsChevronDown } from "react-icons/bs";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { db } from "../../shared/firebase";
import {
  DetailMovie,
  DetailTV,
  Episode,
  getWatchReturnedType,
  Item,
} from "../../shared/types";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { toggleCinemaMode } from "../../store/slice/uiSlice";
import { usePlayer } from "../../context/PlayerContext";
import { useSearchParams } from "react-router-dom";
import { downloadService } from "../../services/download";
import { ResolverService } from "../../services/resolver";
import ReadMore from "../Common/ReadMore";
import RightbarFilms from "../Common/RightbarFilms";
import Sidebar from "../Common/Sidebar";
import Title from "../Common/Title";
import Footer from "../Footer/Footer";
import Comments from "../Common/Comments";
import SeasonSelection from "./SeasonSelection";
import VylaDownload from "../Common/VylaDownload";
import ErrorBoundary from "../Common/ErrorBoundary";
import StreamLuxPlayer from "./StreamLuxPlayer";
import SmartAdContainer from "../Common/SmartAdContainer";
import UserRating from "../Common/UserRating";
import SubtitleSelector from "./SubtitleSelector";
import { HiSparkles } from "react-icons/hi";
import { MdFullscreen, MdSubtitles } from "react-icons/md";
import { FaServer } from "react-icons/fa";
import { vibeService } from "../../services/vibe";
import { resizeImage } from "../../shared/utils";

interface FilmWatchProps {
  media_type: "movie" | "tv";
  seasonId?: number;
  episodeId?: number;
  currentEpisode?: Episode;
}

const FilmWatch: FunctionComponent<FilmWatchProps & getWatchReturnedType> = ({
  detail,
  recommendations,
  detailSeasons,
  media_type,
  seasonId,
  episodeId,
  currentEpisode,
}) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { isCinemaMode } = useAppSelector((state) => state.ui);
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  const [searchParams] = useSearchParams();

  const [sources, setSources] = useState<any[]>([]);
  const [isResolving, setIsResolving] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState<any>(null);
  const [isExternalFullscreen, setIsExternalFullscreen] = useState(false);
  const [showMagicTip, setShowMagicTip] = useState(false);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);

  // ── ELITE DRAGGABLE SCROLL LOGIC ──
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const serverDropdownRef = useRef<HTMLDivElement>(null);
  const [showServerDropdown, setShowServerDropdown] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    scrollRef.current.classList.add('cursor-grabbing');
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.classList.remove('cursor-grabbing');
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.classList.remove('cursor-grabbing');
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Increase scroll speed
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  // Close server dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (serverDropdownRef.current && !serverDropdownRef.current.contains(e.target as Node)) {
        setShowServerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);


  useEffect(() => {
    const fetchSources = async () => {
      setSources([]);
      setSelectedSourceIndex(0);
      setIsResolving(true);
      const id = detail?.id || "";
      const imdbId = (detail as any)?.imdb_id;
      
      const scrapedUrl = searchParams.get("src");
      const isScraped = searchParams.get("scraped") === "true";

      if (isScraped && scrapedUrl) {
        setSources([{
          name: "Scraped Source",
          url: scrapedUrl,
          quality: "HD",
          type: "direct"
        }]);
        setSelectedSourceIndex(0);
        setIsResolving(false);
        return;
      }

      try {
        const resolved = await ResolverService.getInstance().resolveSources(
          media_type,
          id,
          seasonId,
          episodeId,
          imdbId,
          title || (detail as any)?.title || (detail as any)?.name,
          currentEpisode
        );

        setSources(resolved.map(s => ({
          name: s.name,
          url: s.url,
          quality: s.quality,
          type: s.type
        })));
        // Default to VidSrc.me — the preferred first server
        const vidSrcMeIdx = resolved.findIndex(s => s.name === 'VidSrc.me');
        const vidKingIdx = resolved.findIndex(s => s.name === 'VidKing');
        const defaultIdx = vidSrcMeIdx >= 0 ? vidSrcMeIdx : vidKingIdx >= 0 ? vidKingIdx : 0;
        setSelectedSourceIndex(defaultIdx);
      } catch (error) {
        console.error("Failed to resolve sources:", error);
        setSources([]);
      } finally {
        setIsResolving(false);
      }
    };

    if (detail?.id) {
      fetchSources();
    }
  }, [detail?.id, media_type, seasonId, episodeId]); // Only track essential ID/Type changes

  // Metadata is now derived directly from props for instant updates
  const title = media_type === "movie" ? (detail as DetailMovie)?.title : (detail as DetailTV)?.name;
  const poster = detail?.poster_path;
  const overview = detail?.overview;
  const rating = detail?.vote_average;


  const { setMiniPlayerData } = usePlayer();

  useEffect(() => {
    if (detail && sources.length > 0) {
      setMiniPlayerData({
        mediaId: detail.id,
        mediaType: media_type,
        seasonId: seasonId,
        episodeId: episodeId,
        sourceUrl: sources[selectedSourceIndex]?.url,
        currentTime: 0,
        title: (detail as DetailMovie).title || (detail as DetailTV).name,
        posterPath: detail.poster_path,
      });
    }
  }, [detail, media_type, seasonId, episodeId, sources, selectedSourceIndex, setMiniPlayerData]);

  useEffect(() => {
    if (!currentUser || !detail) return;

    getDoc(doc(db, "users", currentUser.uid)).then((docSnap) => {
      const isAlreadyStored = docSnap
        .data()
        ?.recentlyWatch.some((film: Item) => film.id === detail?.id);

      if (!isAlreadyStored) {
        updateDoc(doc(db, "users", currentUser.uid), {
          recentlyWatch: arrayUnion({
            poster_path: detail?.poster_path,
            id: detail?.id,
            vote_average: detail?.vote_average,
            media_type: media_type,
            ...(media_type === "movie" && {
              title: (detail as DetailMovie)?.title,
            }),
            ...(media_type === "tv" && { name: (detail as DetailTV)?.name }),
          }),
        });
      }
    });
  }, [currentUser, detail, media_type]);

  // ── ELITE DYNAMIC THEME (VIBE) ──
  useEffect(() => {
    if (detail?.backdrop_path) {
      const fullImageUrl = resizeImage(detail.backdrop_path, "w300");
      vibeService.extractAverageColor(fullImageUrl).then((color) => {
        vibeService.applyVibe(color);
      });
    }

    // Reset theme only if we are leaving the watch/detail flow
    return () => {
      // We don't reset immediately to allow smooth transitions between pages
    };
  }, [detail?.backdrop_path]);

  return (
    <>
      <Title value={`Watch: ${title} | StreamLux`} />

      <div className={`flex relative min-h-screen transition-colors duration-1000 ${isCinemaMode ? 'bg-[#050505]' : 'bg-transparent'}`}>

        {/* FIXED CINEMATIC BACKGROUND */}
        {!isCinemaMode && (
          <div className="fixed inset-0 z-0 overflow-hidden bg-dark-lighten">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
              style={{ backgroundImage: `url(${resizeImage(poster || "", "original")})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-lighten via-dark-lighten/90 to-dark-lighten/50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
          </div>
        )}

        <Sidebar
          isSidebarActive={isSidebarActive}
          onCloseSidebar={() => setIsSidebarActive(false)}
        />

        <div className="flex-grow min-w-0 pt-14 md:pt-0 relative z-10">

          <div className={`md:hidden fixed top-0 left-0 w-full z-40 px-4 py-3 flex items-center justify-between border-b border-white/5 transition-all duration-700 ${isCinemaMode ? 'bg-black/40 backdrop-blur-3xl opacity-0 hover:opacity-100' : 'bg-dark-lighten/90 backdrop-blur-md'}`}>
            <Link to="/" className="flex gap-2 items-center">
              <img src="/logo.svg" alt="StreamLux" className="w-8 h-8" />
              <span className="text-white font-bold tracking-wider">StreamLux</span>
            </Link>
            <button onClick={() => setIsSidebarActive(true)}>
              <GiHamburgerMenu size={24} className="text-white" />
            </button>
          </div>

          <div className="flex flex-col xl:grid xl:grid-cols-4 gap-8 p-4 md:p-8">
            <div className="xl:col-span-3 col-span-4 space-y-8">

              {/* ── VIDEO PLAYER ── */}
              <div
                id="player-wrapper"
                className={`aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/5 group transition-all duration-700 ${
                  isCinemaMode ? 'scale-[1.02] shadow-[0_0_100px_rgba(0,0,0,1)]' : ''
                }`}
              >
                {isResolving ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Finding available sources...</p>
                  </div>
                ) : sources.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-8 text-center">
                    <p className="text-gray-400">No video sources available for this title.</p>
                  </div>
                ) : (
                  <ErrorBoundary 
                    fallback={
                      <div className="w-full h-full bg-black/80 border border-red-500/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center min-h-[300px]">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                          <span className="text-red-500 text-2xl">⚠</span>
                        </div>
                        <p className="text-white font-bold mb-2">Player Encountered an Error</p>
                        <p className="text-gray-400 text-sm mb-4">The video player could not be loaded. This might be a temporary issue with the source.</p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary hover:bg-primary/80 text-black rounded-lg transition-colors text-sm font-bold">Reload Player</button>
                      </div>
                    }
                  >
                    <StreamLuxPlayer
                        key={`${detail?.id}-${seasonId}-${episodeId}`}
                        sources={sources}
                        poster={`https://image.tmdb.org/t/p/original${poster}`}
                        title={title}
                        id={detail?.id}
                        mediaType={media_type}
                        releaseYear={media_type === "movie" ? (detail as DetailMovie)?.release_date?.slice(0, 4) : (detail as DetailTV)?.first_air_date?.slice(0, 4)}
                        seasonId={seasonId}
                        episodeId={episodeId}
                        startAt={Number(searchParams.get("time")) || 0}
                        onError={() => console.log("Video playback error")}
                        selectedSourceIndex={selectedSourceIndex}
                        onSourceIndexChange={setSelectedSourceIndex}
                        externalSubtitle={selectedSubtitle}
                      />
                  </ErrorBoundary>
                )}
              </div>

              {/* ── ELITE EXTERNAL CONTROL BAR ── */}
              <div className={`relative flex items-center gap-6 px-4 py-3 rounded-[2rem] bg-[#1a1c22]/98 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-700 w-full mt-2 overflow-visible ${
                isCinemaMode ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'
              }`}>

                {/* Left Section: Subtitles & Meta */}
                <div className="flex items-center gap-3 shrink-0">
                  {detail?.id && (
                    <SubtitleSelector
                      mediaType={media_type}
                      id={detail.id}
                      season={seasonId}
                      episode={episodeId}
                      onSelect={(sub) => setSelectedSubtitle(sub)}
                      currentSubtitle={selectedSubtitle}
                    />
                  )}
                  {selectedSubtitle && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                        {selectedSubtitle.language}
                      </span>
                    </div>
                  )}
                </div>

                {/* Center Section: Server Selection — Dropdown on mobile, scrollable row on desktop */}
                <div className="flex-1 min-w-0 flex items-center justify-center overflow-visible gap-2">
                  <div className="flex items-center gap-1.5 shrink-0 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <FaServer size={11} className="text-primary" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Server</span>
                  </div>
                  {sources.length > 0 ? (
                    <>
                      {/* ── MOBILE: Dropdown ── */}
                      <div ref={serverDropdownRef} className="relative md:hidden">
                        <button
                          onClick={() => setShowServerDropdown(!showServerDropdown)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30 transition-all"
                        >
                          <FaServer size={10} />
                          {sources[selectedSourceIndex]?.name || `Server ${selectedSourceIndex + 1}`}
                          <BsChevronDown size={10} className={`transition-transform duration-200 ${showServerDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {showServerDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 mt-2 w-56 bg-[#111114] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden z-[200]"
                            >
                              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                                <FaServer size={11} className="text-primary" />
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Select Server</span>
                              </div>
                              <div className="py-1.5 max-h-60 overflow-y-auto">
                                {sources.map((source: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => { setSelectedSourceIndex(idx); setShowServerDropdown(false); }}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-xs transition-all ${
                                      selectedSourceIndex === idx
                                        ? 'text-primary bg-primary/10 font-bold'
                                        : 'text-gray-300 hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <FaServer size={10} className={selectedSourceIndex === idx ? 'text-primary' : 'text-gray-500'} />
                                      <span className="font-black uppercase tracking-widest">{source.name || `Server ${idx + 1}`}</span>
                                    </div>
                                    {selectedSourceIndex === idx && <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,165,0,0.5)]" />}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* ── DESKTOP: Draggable scrollable row ── */}
                      <div
                        ref={scrollRef}
                        className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-hide max-w-full px-1 cursor-grab select-none"
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                      >
                        {sources.map((source: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSourceIndex(idx)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all text-[10px] font-black uppercase tracking-widest shrink-0 ${
                              selectedSourceIndex === idx
                                ? 'bg-primary text-black shadow-lg shadow-primary/30'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                            }`}
                          >
                            <FaServer size={10} className={selectedSourceIndex === idx ? 'text-black' : 'text-primary'} />
                            {source.name || `Server ${idx + 1}`}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                       <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                       <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                         No Sources
                       </span>
                    </div>
                  )}
                </div>

                {/* Right Section: Magic & Fullscreen */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => dispatch(toggleCinemaMode())}
                    className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all font-bold text-[10px] ${
                      isCinemaMode ? 'bg-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <HiSparkles size={14} className={isCinemaMode ? 'animate-pulse' : 'text-primary'} />
                    <span className="hidden sm:inline">Cinema</span>
                  </button>

                  <button
                    onClick={() => {
                      const playerEl = document.getElementById('player-wrapper');
                      const doc = document as any;
                      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
                        if (playerEl?.requestFullscreen) playerEl.requestFullscreen().catch(() => {});
                        else if ((playerEl as any)?.webkitRequestFullscreen) (playerEl as any).webkitRequestFullscreen();
                      } else {
                        if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
                        else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-white hover:bg-primary hover:text-black transition-all font-bold text-[10px] group"
                  >
                    <MdFullscreen size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </button>
                </div>
              </div>

              <div className={`transition-all duration-1000 ease-in-out ${isCinemaMode ? 'opacity-20 grayscale pointer-events-none blur-sm scale-95' : 'opacity-100 grayscale-0'}`}>
                {media_type === "tv" && (
                  <div className="bg-dark rounded-2xl p-6 border border-white/5 mb-8">
                    <SeasonSelection
                      detailSeasons={detailSeasons}
                      seasonId={seasonId}
                      episodeId={episodeId}
                    />
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                        {title}
                      </h1>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <AiFillStar size={18} />
                          <span className="font-bold text-white">{rating?.toFixed(1)}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <AiTwotoneCalendar size={18} />
                          <span>{media_type === "movie" ? (detail as DetailMovie)?.release_date?.slice(0, 4) : (detail as DetailTV)?.first_air_date?.slice(0, 4)}</span>
                        </div>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-xs font-bold uppercase tracking-wider">
                          HD
                        </span>
                      </div>

                      <div className="text-gray-300 leading-relaxed text-sm md:text-base">
                        <ReadMore limitTextLength={250}>
                          {overview}
                        </ReadMore>
                      </div>
                    </div>

                    {/* Download button: movies only — TV shows use per-episode download in the episode list */}
                    {media_type === 'movie' && (
                      <div id="download">
                        <ErrorBoundary
                          fallback={
                            <div className="w-full py-4 px-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                              <p className="text-red-400 text-sm">Download options currently unavailable.</p>
                            </div>
                          }
                        >
                          <VylaDownload
                            tmdbId={detail?.id}
                            mediaType={media_type}
                            season={seasonId}
                            episode={episodeId}
                            title={title || ''}
                            posterPath={detail?.poster_path || ''}
                          />
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <UserRating
                      mediaId={detail?.id?.toString() || ""}
                      mediaType={media_type}
                    />
                  </div>

                  <div className="mt-12">
                    <Comments mediaId={detail?.id?.toString() || ""} mediaType={media_type} />
                  </div>
                </div>
              </div>
            </div>

            <div className={`xl:col-span-1 col-span-4 space-y-8 transition-all duration-1000 ${isCinemaMode ? 'opacity-10 blur-md pointer-events-none' : 'opacity-100'}`}>
              <RightbarFilms
                className="xl:block"
                films={recommendations}
                name="More Like This"
                limitNumber={10}
                isLoading={!recommendations}
              />

              <div className="hidden xl:block sticky top-24">
                <SmartAdContainer position="sidebar" minViewTime={10000} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default FilmWatch;
