import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { FunctionComponent, useEffect, useState, useRef, useCallback } from "react";
import { AiFillStar, AiTwotoneCalendar, AiOutlineDownload } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdSkipNext } from "react-icons/md";
import { Link } from "react-router-dom";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { useWatchProgress } from "../../hooks/useWatchProgress";
import { usePlayer } from "../../context/PlayerContext";
import { db } from "../../shared/firebase";
import {
  DetailMovie,
  DetailTV,
  Episode,
  getWatchReturnedType,
  Item,
} from "../../shared/types";
import { useAppSelector } from "../../store/hooks";
import { downloadService } from "../../services/download";
import { resolverService, ResolvedSource } from "../../services/resolver";
import ReadMore from "../Common/ReadMore";
import RightbarFilms from "../Common/RightbarFilms";
import SearchBox from "../Common/SearchBox";
import Sidebar from "../Common/Sidebar";
import SidebarMini from "../Common/SidebarMini";
import Skeleton from "../Common/Skeleton";
import Title from "../Common/Title";
import Footer from "../Footer/Footer";
import Comments from "../Common/Comments";
import SeasonSelection from "./SeasonSelection";
import DownloadOptions from "../Common/DownloadOptions";
import PlayerControls from "./PlayerControls";
import QualitySelector from "./QualitySelector";
import SubtitleSelector from "./SubtitleSelector";
import { Subtitle } from "../../services/subtitles";
import OfflineSyncButton from "../Common/OfflineSyncButton";

interface FilmWatchProps {
  media_type: "movie" | "tv";
  seasonId?: number;
  episodeId?: number;
  currentEpisode?: Episode;
  downloads?: any[];
}

const FilmWatch: FunctionComponent<FilmWatchProps & getWatchReturnedType> = ({
  detail,
  recommendations,
  detailSeasons,
  media_type,
  seasonId,
  episodeId,
  currentEpisode,
  downloads = []
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const [resolvedSources, setResolvedSources] = useState<ResolvedSource[]>([]);
  const [isResolving, setIsResolving] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [failoverCountdown, setFailoverCountdown] = useState<number | null>(null);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const failoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch resolved sources
  useEffect(() => {
    const fetchSources = async () => {
      if (!detail) return;
      setIsResolving(true);
      const results = await resolverService.resolveSources(
        media_type,
        detail.id,
        seasonId,
        episodeId,
        media_type === "movie" ? (detail as DetailMovie).imdb_id : undefined
      );
      setResolvedSources(results);
      setIsResolving(false);
      setCurrentSourceIndex(0);
    };
    fetchSources();
  }, [detail, seasonId, episodeId, media_type]);

  const videoSources = resolvedSources.map(s => s.url);
  const currentSource = videoSources[currentSourceIndex];

  const handleVideoError = useCallback(() => {
    console.log(`Video source ${currentSourceIndex + 1} failed.`);
    setVideoError(true);
    setIsLoadingVideo(false);

    // Only auto-switch if manual selection is not active
    if (!isManualSelection && currentSourceIndex < resolvedSources.length - 1) {
      console.log('Starting 20-second failover countdown...');
      setFailoverCountdown(20);

      // Clear any existing timers
      if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      // Start countdown display
      let countdown = 20;
      countdownIntervalRef.current = setInterval(() => {
        countdown -= 1;
        setFailoverCountdown(countdown);
        if (countdown <= 0 && countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      }, 1000);

      // Schedule the actual switch after 20 seconds
      failoverTimerRef.current = setTimeout(() => {
        console.log(`Switching to source ${currentSourceIndex + 2}...`);
        setCurrentSourceIndex(prev => prev + 1);
        setVideoError(false);
        setIsLoadingVideo(true);
        setFailoverCountdown(null);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      }, 20000);
    }
  }, [currentSourceIndex, isManualSelection, resolvedSources.length]);

  const handleVideoLoad = useCallback(() => {
    setIsLoadingVideo(false);
    setVideoError(false);
    setFailoverCountdown(null);

    // Clear any pending failover timers
    if (failoverTimerRef.current) {
      clearTimeout(failoverTimerRef.current);
      failoverTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleSpeedChange = (speed: number) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ event: 'command', func: 'setPlaybackRate', args: [speed] }, '*');
    }
  };

  const handleQualityChange = (quality: string) => {
    if (quality !== "Auto" && resolvedSources.length > 0) {
      const bestMatchIndex = resolvedSources.findIndex((s) => s.quality === quality);
      if (bestMatchIndex !== -1) {
        setCurrentSourceIndex(bestMatchIndex);
        setVideoError(false);
        setIsLoadingVideo(true);
      }
    }
  };

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


  /* Mini Player Logic */
  const { setMiniPlayerData } = usePlayer();
  const detailRef = useRef(detail);
  const currentSourceRef = useRef<string>("");

  useEffect(() => {
    detailRef.current = detail;
  }, [detail]);

  useEffect(() => {
    currentSourceRef.current = currentSource || "";
  }, [currentSource]);

  useEffect(() => {
    setMiniPlayerData(null);
    return () => {
      if (detailRef.current && currentSourceRef.current) {
        setMiniPlayerData({
          mediaId: detailRef.current.id,
          mediaType: media_type,
          seasonId,
          episodeId,
          sourceUrl: currentSourceRef.current,
          currentTime: 0,
          title: (detailRef.current as DetailMovie).title || (detailRef.current as DetailTV).name,
          posterPath: detailRef.current.poster_path,
        });
      }
    };
  }, [media_type, seasonId, episodeId, setMiniPlayerData]);

  return (
    <>
      {detail && (
        <Title
          value={`Watch: ${(detail as DetailMovie).title || (detail as DetailTV).name
            } ${media_type === "tv" ? `- Season ${seasonId} - Ep ${episodeId}` : ""
            } | StreamLux`}
        />
      )}

      <div className="flex md:hidden justify-between items-center px-5 my-5">
        <Link to="/" className="flex gap-2 items-center">
          <img src="/logo.svg" alt="StreamLux Logo" className="h-10 w-10" />
          <p className="text-xl text-white font-medium tracking-wider uppercase">
            Stream<span className="text-primary">Lux</span>
          </p>
        </Link>
        <button onClick={() => setIsSidebarActive((prev) => !prev)}>
          <GiHamburgerMenu size={25} />
        </button>
      </div>

      <div className={`flex flex-col md:flex-row ${isTheaterMode ? 'md:flex-col' : ''}`}>
        {!isMobile && !isTheaterMode && <SidebarMini />}
        {isMobile && !isTheaterMode && (
          <Sidebar
            onCloseSidebar={() => setIsSidebarActive(false)}
            isSidebarActive={isSidebarActive}
          />
        )}

        <div className={`flex-grow px-[2vw] md:pt-11 pt-0 transition-all duration-300 ${isTheaterMode ? 'md:px-0 md:pt-0' : ''}`}>
          <div className={`relative h-0 pb-[56.25%] ${isTheaterMode ? 'md:pb-[45%]' : ''}`}>
            {!detail && (
              <Skeleton className="absolute top-0 left-0 w-full h-full rounded-sm" />
            )}
            {detail && (
              <>
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end origin-top-right">
                  <div className="flex gap-2 items-center">
                    <SubtitleSelector
                      mediaType={media_type}
                      id={detail.id}
                      imdbId={media_type === "movie" ? (detail as DetailMovie).imdb_id : undefined}
                      season={seasonId}
                      episode={episodeId}
                      currentSubtitle={currentSubtitle}
                      onSelect={setCurrentSubtitle}
                    />
                    <QualitySelector
                      currentQuality="Auto"
                      onQualityChange={handleQualityChange}
                    />
                    <PlayerControls
                      onSpeedChange={handleSpeedChange}
                      onSeek={() => { }}
                      onPopOut={() => { }}
                    />
                    <button
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className={`hidden md:flex bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white hover:bg-primary/80 transition items-center gap-2 ${isTheaterMode ? 'bg-primary/80 border-primary' : ''}`}
                      title={isTheaterMode ? "Exit Theater Mode" : "Theater Mode"}
                    >
                      {isTheaterMode ? 'NORMAL' : 'THEATER'}
                    </button>
                    <button
                      onClick={() => {
                        const nextState = !isSelectorOpen;
                        setIsSelectorOpen(nextState);
                      }}
                      className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white hover:bg-primary/80 transition flex items-center gap-2"
                    >
                      <span className="hidden sm:inline text-[10px] opacity-70">SERVER:</span>
                      <span>{resolvedSources[currentSourceIndex]?.name || 'Loading...'}</span>
                      <span className={`transition-transform duration-300 ${isSelectorOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                  </div>

                  {isSelectorOpen && (
                    <div className="bg-black/90 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-2xl min-w-[220px]">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 px-2">Select Server</p>
                      <div className="grid gap-1 max-h-[300px] overflow-y-auto pr-1">
                        {resolvedSources.map((source, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentSourceIndex(index);
                              setVideoError(false);
                              setIsLoadingVideo(true);
                              setIsSelectorOpen(false);
                              setIsManualSelection(true); // Lock auto-switching
                              setFailoverCountdown(null);

                              // Clear any pending failover timers
                              if (failoverTimerRef.current) {
                                clearTimeout(failoverTimerRef.current);
                                failoverTimerRef.current = null;
                              }
                              if (countdownIntervalRef.current) {
                                clearInterval(countdownIntervalRef.current);
                                countdownIntervalRef.current = null;
                              }
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg transition-all text-left ${currentSourceIndex === index
                              ? 'bg-primary/20 border border-primary/50 text-white'
                              : 'hover:bg-white/5 text-gray-400 border border-transparent'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${currentSourceIndex === index ? 'text-primary' : ''}`}>
                                {source.name}
                              </span>
                              {/* Health status indicator */}
                              {source.status === 'active' && (
                                <span className="w-2 h-2 rounded-full bg-green-500" title="Active"></span>
                              )}
                              {source.status === 'slow' && (
                                <span className="w-2 h-2 rounded-full bg-yellow-500" title="Slow"></span>
                              )}
                              {source.status === 'down' && (
                                <span className="w-2 h-2 rounded-full bg-red-500" title="Down"></span>
                              )}
                              {source.status === 'checking' && (
                                <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" title="Checking"></span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500">{source.quality}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <iframe
                  className="absolute w-full h-full top-0 left-0"
                  src={currentSource || ""}
                  title="Film Video Player"
                  style={{ border: 0 }}
                  allowFullScreen
                  onError={handleVideoError}
                  onLoad={handleVideoLoad}
                ></iframe>

                {/* Resolving Status Overlay */}
                {isResolving && (
                  <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Resolving Sources...</h2>
                  </div>
                )}

                {/* Failover Countdown Overlay */}
                {failoverCountdown !== null && failoverCountdown > 0 && (
                  <div className="absolute bottom-4 left-4 z-20 bg-black/90 backdrop-blur-md px-4 py-3 rounded-lg border border-yellow-500/50 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 transform -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="#fbbf24"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${(failoverCountdown / 20) * 100} 100`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-yellow-500 font-bold text-sm">
                          {failoverCountdown}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Auto-switching source...</p>
                        <p className="text-gray-400 text-xs">Next: {resolvedSources[currentSourceIndex + 1]?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-5 pb-8">
            <div className="flex justify-between md:text-base text-sm">
              <div className="flex-1">
                {detail && (
                  <h1 className="text-white md:text-3xl text-xl font-medium">
                    {(detail as DetailMovie).title || (detail as DetailTV).name}
                  </h1>
                )}
                {detail && (
                  <p className="text-gray-300 mt-2">
                    {media_type === "movie" ? (detail as DetailMovie).overview : currentEpisode?.overview}
                  </p>
                )}
              </div>
            </div>

            {/* Download Section */}
            {downloadInfo && (
              <div id="download-section" className="mt-6">
                <DownloadOptions downloadInfo={downloadInfo} />
              </div>
            )}

            {/* Offline Sync Section */}
            {detail && currentSource && (
              <div className="mt-6">
                <OfflineSyncButton
                  detail={detail}
                  mediaType={media_type}
                  providerUrl={currentSource}
                  seasonNumber={seasonId}
                  episodeNumber={episodeId}
                  episodeTitle={currentEpisode?.name}
                />
              </div>
            )}
          </div>

          <Comments mediaType={media_type} mediaId={String(detail?.id)} />
        </div>

        <div className="shrink-0 md:max-w-[400px] w-full relative px-6">
          {!isMobile && <SearchBox />}
          {media_type === "movie" && (
            <RightbarFilms
              name="Recommendations"
              films={recommendations?.filter((item) => item.id !== detail?.id)}
              limitNumber={4}
              isLoading={!recommendations}
              className="md:mt-24"
            />
          )}
          {media_type === "tv" && (
            <div className="md:mt-24">
              <p className="text-white font-medium text-lg mb-3">Seasons & Episodes</p>
              <SeasonSelection
                detailSeasons={detailSeasons}
                seasonId={seasonId}
                episodeId={episodeId}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FilmWatch;
