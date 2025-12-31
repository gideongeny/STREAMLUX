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
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const [resolvedSources, setResolvedSources] = useState<ResolvedSource[]>([]);
  const [isResolving, setIsResolving] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false); // Keep closed initially to avoid clutter, will add effect to open if empty
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);

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

  // Helper function to get readable source names

  const handleVideoError = useCallback(() => {
    console.log(`Video source ${currentSourceIndex + 1} failed.`);
    setVideoError(true);
    setIsLoadingVideo(false);
    // Auto-advance handled by useEffect
  }, [currentSourceIndex]);

  const handleVideoLoad = useCallback(() => {
    setIsLoadingVideo(false);
    setVideoError(false);
  }, []);


  // Auto-advance Logic (Always Active unless manually selected)
  useEffect(() => {
    // If an error occurs, automatically try the next source after a brief delay
    if (videoError && currentSourceIndex < videoSources.length - 1 && !isManualSelection) {
      console.log(`Source ${currentSourceIndex + 1} failed. Auto-switching to next source...`);
      const timer = setTimeout(() => {
        setCurrentSourceIndex(prev => prev + 1);
        setVideoError(false);
        setIsLoadingVideo(true);
      }, 500); // 0.5s delay for smooth transition

      return () => clearTimeout(timer);
    }
  }, [videoError, currentSourceIndex, videoSources.length, isManualSelection]);

  // Loading Timeout (Aggressive)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoadingVideo && !videoError && !isManualSelection) {
      timeoutId = setTimeout(() => {
        console.log(`Source ${currentSourceIndex + 1} timed out (30s), trying next...`);
        handleVideoError();
      }, 30000); // 30 seconds as requested
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoadingVideo, videoError, currentSourceIndex, isManualSelection, handleVideoError]);

  // Reset source when detail changes
  useEffect(() => {
    setCurrentSourceIndex(0);
    setVideoError(false);
    setIsLoadingVideo(true);
    setIsManualSelection(false);
    setCurrentSubtitle(null); // Reset subtitles on change
  }, [detail?.id, seasonId, episodeId]);

  // Generate download info when detail changes
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

  useEffect(() => {
    if (!currentUser) return;
    if (!detail) return; // prevent this code from storing undefined value to Firestore (which cause error)

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
      } else {
        const updatedRecentlyWatch = docSnap
          .data()
          ?.recentlyWatch.filter((film: Item) => film.id !== detail?.id)
          .concat({
            poster_path: detail?.poster_path,
            id: detail?.id,
            vote_average: detail?.vote_average,
            media_type: media_type,
            ...(media_type === "movie" && {
              title: (detail as DetailMovie)?.title,
            }),
            ...(media_type === "tv" && { name: (detail as DetailTV)?.name }),
          });

        updateDoc(doc(db, "users", currentUser.uid), {
          recentlyWatch: updatedRecentlyWatch,
        });
      }
    });
  }, [currentUser, detail, media_type]);

  const { saveProgress } = useWatchProgress();

  useEffect(() => {
    if (!detail) return;

    // Save progress when component mounts/updates
    const saveWatchProgress = () => {
      saveProgress({
        mediaId: detail.id,
        mediaType: media_type,
        title: (detail as DetailMovie).title || (detail as DetailTV).name,
        posterPath: detail.poster_path,
        currentTime: 0,
        duration: (detail as DetailMovie).runtime || (detail as DetailTV).episode_run_time?.[0] || 0,
        progress: 0, // In future: calculate % from duration
        timestamp: Date.now(),
        seasonNumber: seasonId,
        episodeNumber: episodeId,
      });
    };
    saveWatchProgress();
    saveWatchProgress();
  }, [detail, media_type, seasonId, episodeId, saveProgress]);

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
    // Clear mini player when entering full player
    setMiniPlayerData(null);

    return () => {
      // Set mini player when leaving (unmounting)
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

  /* Quality Selector Logic */
  const [preferredQuality, setPreferredQuality] = useState(
    localStorage.getItem("streamlux_quality_preference") || "Auto"
  );

  const handleQualityChange = (quality: string) => {
    setPreferredQuality(quality);
    localStorage.setItem("streamlux_quality_preference", quality);

    if (quality !== "Auto" && resolvedSources.length > 0) {
      const bestMatchIndex = resolvedSources.findIndex((s) => s.quality === quality);
      if (bestMatchIndex !== -1) {
        setCurrentSourceIndex(bestMatchIndex);
        setVideoError(false);
        setIsLoadingVideo(true);
        console.log(`Auto-switched to ${quality} source: ${resolvedSources[bestMatchIndex].name}`);
      }
    }
  };

  // Auto-select preferred quality when sources load
  useEffect(() => {
    if (resolvedSources.length > 0 && preferredQuality !== "Auto") {
      const bestMatchIndex = resolvedSources.findIndex((s) => s.quality === preferredQuality);
      // Only switch if we are currently at 0 (default) to avoid overriding manual selection during re-renders?
      // For now, let's just do it on load.
      // We can check if isLoadingVideo is true (which is reset on invalidation).
      if (bestMatchIndex !== -1 && currentSourceIndex === 0) {
        setCurrentSourceIndex(bestMatchIndex);
      }
    }
  }, [resolvedSources, preferredQuality, currentSourceIndex]);

  const handleSpeedChange = (speed: number) => {
    // Attempt to send message to iframe (some players might support it)
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ event: 'command', func: 'setPlaybackRate', args: [speed] }, '*');
    }
  };

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

      <div className="flex flex-col md:flex-row">
        {!isMobile && <SidebarMini />}
        {isMobile && (
          <Sidebar
            onCloseSidebar={() => setIsSidebarActive(false)}
            isSidebarActive={isSidebarActive}
          />
        )}

        <div className="flex-grow px-[2vw] md:pt-11 pt-0">
          <div className="relative h-0 pb-[56.25%]">
            {!detail && (
              <Skeleton className="absolute top-0 left-0 w-full h-full rounded-sm" />
            )}
            {detail && (
              <>
                {/* Modern Source Selector */}
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
                      currentQuality={preferredQuality}
                      onQualityChange={handleQualityChange}
                    />
                    <PlayerControls
                      onSpeedChange={handleSpeedChange}
                      onSeek={(seconds) => {
                        const iframe = document.querySelector('iframe');
                        if (iframe && iframe.contentWindow) {
                          // Try multiple common seek commands
                          iframe.contentWindow.postMessage({ event: 'command', func: 'seekTo', args: [seconds, true] }, '*'); // YouTube/Standard
                          iframe.contentWindow.postMessage({ type: 'seek', time: seconds }, '*'); // Some custom
                        }
                      }}
                      onPopOut={() => {
                        if (currentSource) {
                          window.open(currentSource, 'StreamLuxPopOut', 'width=800,height=500,resizable=yes');
                        }
                      }}
                    />
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

                  {/* Next Episode Button Overlay */}
                  {media_type === 'tv' && seasonId && episodeId && detailSeasons && (
                    (() => {
                      // Simple Next Episode Logic
                      // 1. Check if next episode exists in current season
                      const currentSeason = detailSeasons.find(s => s.season_number === seasonId);
                      let nextEpLink = null;

                      if (currentSeason && episodeId < currentSeason.episodes.length) {
                        nextEpLink = `/watch/tv/${detail.id}?season=${seasonId}&episode=${episodeId + 1}`;
                      } else {
                        // 2. Check first episode of next season
                        const nextSeason = detailSeasons.find(s => s.season_number === seasonId + 1);
                        if (nextSeason) {
                          nextEpLink = `/watch/tv/${detail.id}?season=${seasonId + 1}&episode=1`;
                        }
                      }

                      if (nextEpLink) {
                        return (
                          <Link
                            to={nextEpLink}
                            className="absolute bottom-20 right-4 z-40 bg-white/10 hover:bg-primary backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 group transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500 delay-1000 shadow-xl"
                          >
                            <span>Next Episode</span>
                            <MdSkipNext className="text-xl group-hover:translate-x-1 transition-transform" />
                          </Link>
                        );
                      }
                      return null;
                    })()
                  )}

                  {isSelectorOpen && (
                    <div className="bg-black/90 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-2xl min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 px-2">Select Server</p>
                      <div className="grid gap-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {isResolving ? (
                          <div className="flex flex-col gap-2 p-2">
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                          </div>
                        ) : (
                          resolvedSources.map((source, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setCurrentSourceIndex(index);
                                setVideoError(false);
                                setIsLoadingVideo(true);
                                setIsSelectorOpen(false); // Auto-close on selection
                                setIsManualSelection(true); // Disable auto-switch on manual selection
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg transition-all text-left ${currentSourceIndex === index
                                ? 'bg-primary/20 border border-primary/50 text-white'
                                : 'hover:bg-white/5 text-gray-400 border border-transparent'
                                }`}
                            >
                              <div className="flex flex-col">
                                <span className={`text-xs font-bold ${currentSourceIndex === index ? 'text-primary' : ''}`}>
                                  {source.name}
                                </span>
                                <div className="flex gap-2 items-center mt-0.5">
                                  <span className="text-[9px] bg-dark-lighten px-1 rounded text-gray-400">{source.quality}</span>
                                  <span className={`text-[9px] ${source.speed === 'fast' ? 'text-green-500' : 'text-yellow-500'
                                    }`}>● {source.speed}</span>
                                </div>
                              </div>
                              {currentSourceIndex === index && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      {/* Download Section Integration */}
                      {downloadInfo && (
                        <button
                          onClick={() => {
                            const downloadSection = document.getElementById('download-section');
                            if (downloadSection) {
                              downloadSection.scrollIntoView({ behavior: 'smooth' });
                            }
                            // Trigger automated download
                            downloadService.downloadMovie(downloadInfo, resolvedSources[currentSourceIndex], (progress) => {
                              setDownloadInfo((prev: any) => ({ ...prev, currentProgress: progress }));
                            });
                          }}
                          className="w-full mt-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all border border-primary/20"
                        >
                          <AiOutlineDownload size={14} className={downloadInfo.currentProgress?.status === 'downloading' ? 'animate-bounce' : ''} />
                          {downloadInfo.currentProgress
                            ? downloadInfo.currentProgress.message.toUpperCase()
                            : "ONE-CLICK DOWNLOAD"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <iframe
                  className="absolute w-full h-full top-0 left-0"
                  src={currentSource}
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
                    <p className="text-gray-400 text-sm animate-pulse italic">Scanning high-quality direct links for you</p>
                  </div>
                )}

                {/* Manual Error Message */}
                {videoError && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-red-500/90 text-white px-6 py-3 rounded-full text-xs font-bold shadow-lg flex flex-col items-center gap-1">
                    <span>⚠️ Video failed to load.</span>
                    <button
                      onClick={() => setIsSelectorOpen(true)}
                      className="underline hover:text-gray-200"
                    >
                      Click here to select another server
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="mt-5 pb-8">
            <div className="flex justify-between md:text-base text-sm">
              <div className="flex-1">
                {!detail && <Skeleton className="h-8 w-[400px]" />}
                {detail && (
                  <h1 className="text-white md:text-3xl text-xl font-medium">
                    <Link
                      to={
                        media_type === "movie"
                          ? `/movie/${detail.id}`
                          : `/tv/${detail.id}`
                      }
                      className="hover:brightness-75 transition duration-300"
                    >
                      {(detail as DetailMovie).title ||
                        (detail as DetailTV).name}
                    </Link>
                  </h1>
                )}
                {!detail && <Skeleton className="w-[100px] h-[23px] mt-5" />}
                {detail && (
                  <div className="flex gap-5 mt-5">
                    <div className="flex gap-2 items-center">
                      <AiFillStar size={25} className="text-primary" />
                      {media_type === "movie" && (
                        <p>{detail.vote_average.toFixed(1)}</p>
                      )}
                      {media_type === "tv" && (
                        <p>{currentEpisode?.vote_average.toFixed(1)}</p>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <AiTwotoneCalendar size={25} className="text-primary" />
                      <p>
                        {media_type === "movie" &&
                          new Date(
                            (detail as DetailMovie).release_date
                          ).getFullYear()}
                        {media_type === "tv" &&
                          new Date(
                            (currentEpisode as Episode).air_date
                          ).getFullYear()}
                      </p>
                    </div>
                  </div>
                )}
                {!detail && <Skeleton className="w-[100px] h-[23px] mt-2" />}
                {!isMobile && detail && (
                  <ul className="flex gap-2 flex-wrap mt-3">
                    {detail.genres.map((genre) => (
                      <li key={genre.id} className="mb-2">
                        <Link
                          to={`/explore?genre=${genre.id}`}
                          className="px-3 py-1 bg-dark-lighten rounded-full hover:brightness-75 duration-300 transition"
                        >
                          {genre.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {media_type === "tv" && currentEpisode && (
                <div className="flex-1">
                  <h2 className="md:text-xl italic uppercase text-gray-200 mt-2 text-right">
                    {currentEpisode.name}
                  </h2>
                  <p className="text-right md:text-lg mt-2">
                    Season {seasonId} &#8212; Episode {episodeId}
                  </p>
                </div>
              )}
            </div>

            {isMobile && detail && (
              <ul className="flex gap-2 flex-wrap mt-3">
                {detail.genres.map((genre) => (
                  <li key={genre.id} className="mb-2">
                    <Link
                      to={`/explore?genre=${genre.id}`}
                      className="px-3 py-1 bg-dark-lighten rounded-full hover:brightness-75 duration-300 transition"
                    >
                      {genre.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="md:text-xl text-lg font-medium text-white mt-5">
              Overview:
            </div>
            {!detail && <Skeleton className="h-[84px] mt-2" />}
            {detail && (
              <ReadMore
                limitTextLength={300}
                className="md:text-lg text-base mt-1"
              >
                {media_type === "movie"
                  ? detail.overview
                  : currentEpisode?.overview}
              </ReadMore>
            )}

            {/* Download Section */}
            {downloadInfo && (
              <div id="download-section" className="mt-6">
                <DownloadOptions downloadInfo={downloadInfo} />
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
              <p className="mb-6 text-xl font-medium flex justify-between items-center">
                <span className="text-white">Seasons:</span>
                <BsThreeDotsVertical size={20} />
              </p>
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
