import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { FunctionComponent, useEffect, useState } from "react";
import { AiFillStar, AiTwotoneCalendar } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link } from "react-router-dom";
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
import EliteDownload from "../Common/EliteDownload";
import StreamLuxPlayer from "./StreamLuxPlayer";
import SmartAdContainer from "../Common/SmartAdContainer";
import UserRating from "../Common/UserRating";
import SubtitleSelector from "./SubtitleSelector";
import { HiSparkles } from "react-icons/hi";
import { MdFullscreen, MdSubtitles } from "react-icons/md";

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
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const [searchParams] = useSearchParams();

  const [sources, setSources] = useState<any[]>([]);
  const [isResolving, setIsResolving] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState<any>(null);
  const [isExternalFullscreen, setIsExternalFullscreen] = useState(false);
  const [showMagicTip, setShowMagicTip] = useState(false);

  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState("");
  const [overview, setOverview] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchSources = async () => {
      setSources([]);
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
  }, [detail, media_type, seasonId, episodeId, title]);

  useEffect(() => {
    if (detail) {
      if (media_type === "movie") {
        setTitle((detail as DetailMovie).title);
      } else {
        setTitle((detail as DetailTV).name);
      }
      setPoster(detail.poster_path);
      setOverview(detail.overview);
      setRating(detail.vote_average);
    }
  }, [detail, media_type]);

  useEffect(() => {
    if (detail) {
      const info = downloadService.generateDownloadInfo(
        detail,
        media_type,
        seasonId,
        episodeId,
        currentEpisode
      );
      setDownloadInfo(info);
    }
  }, [detail, media_type, seasonId, episodeId, currentEpisode]);

  const { setMiniPlayerData } = usePlayer();

  useEffect(() => {
    if (detail && sources.length > 0) {
      setMiniPlayerData({
        mediaId: detail.id,
        mediaType: media_type,
        seasonId: seasonId,
        episodeId: episodeId,
        sourceUrl: sources[0]?.url,
        currentTime: 0,
        title: (detail as DetailMovie).title || (detail as DetailTV).name,
        posterPath: detail.poster_path,
      });
    }
  }, [detail, media_type, seasonId, episodeId, sources, setMiniPlayerData]);

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

  return (
    <>
      <Title value={`Watch: ${title} | StreamLux`} />

      <div className={`flex relative min-h-screen bg-dark-lighten transition-colors duration-1000 ${isCinemaMode ? 'bg-[#050505]' : 'bg-dark-lighten'}`}>

        <Sidebar
          isSidebarActive={isSidebarActive}
          onCloseSidebar={() => setIsSidebarActive(false)}
        />

        <div className="flex-grow min-w-0 pt-14 md:pt-0 md:ml-[260px]">

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
                } ${isExternalFullscreen ? 'fixed inset-0 z-[9999] rounded-none aspect-auto h-screen w-screen' : ''}`}
              >
                {isResolving ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Resolving best quality sources...</p>
                  </div>
                ) : (
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
                  />
                )}
              </div>

              {/* ── ELITE EXTERNAL CONTROL BAR ── */}
              <div className={`flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 rounded-3xl bg-dark/40 backdrop-blur-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-700 ${
                isCinemaMode ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100 mt-2'
              } ${isExternalFullscreen ? 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-black/60 min-w-[340px] max-w-[90vw] border-white/20' : 'w-full'}`}>

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

                {/* Middle Section: Source Pill Row (Scrollable) */}
                <div className="flex-1 w-full md:w-auto overflow-hidden">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide px-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1 shrink-0">Sources</span>
                    {sources.map((src, i) => (
                      <button 
                        key={i} 
                        className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
                          i === 0 
                            ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' 
                            : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {src.name || `Source ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Section: Magic & Fullscreen */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => dispatch(toggleCinemaMode())}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-xs ${
                      isCinemaMode ? 'bg-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <HiSparkles size={16} className={isCinemaMode ? 'animate-pulse' : 'text-primary'} />
                    <span>Cinema</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsExternalFullscreen(f => !f);
                      if (!isExternalFullscreen) {
                        document.documentElement.requestFullscreen?.().catch(() => {});
                      } else {
                        document.exitFullscreen?.().catch(() => {});
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white hover:bg-primary hover:text-black transition-all font-bold text-xs group"
                  >
                    <MdFullscreen size={18} className="group-hover:scale-110 transition-transform" />
                    <span>{isExternalFullscreen ? 'Exit' : 'Fullscreen'}</span>
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

                    <div className="w-full md:w-auto">
                      {downloadInfo && <EliteDownload downloadInfo={downloadInfo} />}
                    </div>
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

          <Footer />
        </div>

      </div>
    </>
  );
};

export default FilmWatch;
