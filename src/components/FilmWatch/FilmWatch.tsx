import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { FunctionComponent, useEffect, useState } from "react";
import { AiFillStar, AiTwotoneCalendar, AiOutlineDownload } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
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
import { useAppSelector } from "../../store/hooks";
import { usePlayer } from "../../context/PlayerContext";
import { downloadService } from "../../services/download";
import { ResolverService } from "../../services/resolver"; // Import ResolverService
import ReadMore from "../Common/ReadMore";
import RightbarFilms from "../Common/RightbarFilms";
import SearchBox from "../Common/SearchBox";
import Sidebar from "../Common/Sidebar";
import SidebarMini from "../Common/SidebarMini";
import Skeleton from "../Common/Skeleton";
import Title from "../Common/Title";
import Footer from "../Footer/Footer";
import Comments from "../Common/Comments"; // Swapped to stable Comments component
import SeasonSelection from "./SeasonSelection";
import EliteDownload from "../Common/EliteDownload";
import PlayerControls from "./PlayerControls";
import StreamLuxPlayer from "./StreamLuxPlayer";
import AdBanner from "../Ads/AdBanner";
import SmartAdContainer from "../Common/SmartAdContainer";
import UserRating from "../Common/UserRating";

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
  const [downloadInfo, setDownloadInfo] = useState<any>(null);

  // New State for Resolved Sources
  const [sources, setSources] = useState<any[]>([]);
  const [isResolving, setIsResolving] = useState(true);

  // Use ResolverService to fetch sources
  useEffect(() => {
    const fetchSources = async () => {
      setSources([]); // Clear stale sources immediately
      setIsResolving(true);
      const id = detail?.id || "";
      const imdbId = (detail as any)?.imdb_id;

      try {
        const resolved = await ResolverService.getInstance().resolveSources(
          media_type,
          id,
          seasonId,
          episodeId,
          imdbId,
          title || (detail as any)?.title || (detail as any)?.name // Pass title
        );

        // Map to StreamLuxPlayer format
        setSources(resolved.map(s => ({
          name: s.name,
          url: s.url,
          quality: s.quality,
          type: s.type
        })));
      } catch (error) {
        console.error("Failed to resolve sources:", error);
        setSources([]); // Ensure empty state on error
      } finally {
        setIsResolving(false);
      }
    };

    if (detail?.id) {
      fetchSources();
    }
  }, [detail, media_type, seasonId, episodeId]);

  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState("");
  const [overview, setOverview] = useState("");
  const [rating, setRating] = useState(0);

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

  const { setMiniPlayerData } = usePlayer();

  // Update mini player data
  useEffect(() => {
    if (detail && sources.length > 0) {
      setMiniPlayerData({
        mediaId: detail.id,
        mediaType: media_type,
        seasonId: seasonId,
        episodeId: episodeId,
        sourceUrl: sources[0]?.url, // Default to first source
        currentTime: 0,
        title: (detail as DetailMovie).title || (detail as DetailTV).name,
        posterPath: detail.poster_path,
      });
    }
  }, [detail, media_type, seasonId, episodeId, sources, setMiniPlayerData]);

  // Recently watched logic
  useEffect(() => {
    if (!currentUser) return;
    if (!detail) return;

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
        // Update existing entry (optional mostly for ordering)
      }
    });
  }, [currentUser, detail, media_type]);

  return (
    <>
      <Title value={`Watch: ${title} | StreamLux`} />

      <div className="flex relative min-h-screen bg-dark-lighten">

        <Sidebar
          isSidebarActive={isSidebarActive}
          onCloseSidebar={() => setIsSidebarActive(false)}
        />

        <div className="flex-grow min-w-0 pt-14 md:pt-0"> {/* Add padding top for mobile */}

          {/* Mobile Header with Menu Button */}
          <div className="md:hidden fixed top-0 left-0 w-full z-40 bg-dark-lighten/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
            <Link to="/" className="flex gap-2 items-center">
              <img src="/logo.svg" alt="StreamLux" className="w-8 h-8" />
              <span className="text-white font-bold tracking-wider">StreamLux</span>
            </Link>
            <button onClick={() => setIsSidebarActive(true)}>
              <GiHamburgerMenu size={24} className="text-white" />
            </button>
          </div>

          <div
            className="flex flex-col xl:grid xl:grid-cols-4 gap-8 p-4 md:p-8"
          >
            {/* Main Content Area */}
            <div className="xl:col-span-3 col-span-4 space-y-8">

              {/* Video Player Container */}
              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/5 group">
                {isResolving ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Resolving best quality sources...</p>
                  </div>
                ) : (
                  <StreamLuxPlayer
                    key={`${detail?.id}-${seasonId}-${episodeId}`} // Force remount when episode changes
                    sources={sources}
                    poster={`https://image.tmdb.org/t/p/original${poster}`}
                    title={title}
                    id={detail?.id}
                    mediaType={media_type}
                    onError={() => {
                      console.log("Video playback error");
                    }}
                  />
                )}
              </div>

              {/* Episode Selection for TV Shows */}
              {media_type === "tv" && (
                <div className="bg-dark rounded-2xl p-6 border border-white/5">
                  <SeasonSelection
                    detailSeasons={detailSeasons}
                    seasonId={seasonId}
                    episodeId={episodeId}
                  />
                </div>
              )}

              {/* Movie/Show Info & Controls */}
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

                  {/* Download Button */}
                  <div className="w-full md:w-auto">
                    {downloadInfo && <EliteDownload downloadInfo={downloadInfo} />}
                  </div>
                </div>
              </div>

              {/* User Rating */}
              <div className="mt-8">
                <UserRating
                  mediaId={detail?.id?.toString() || ""}
                  mediaType={media_type}
                />
              </div>

              {/* Ad Banner Placement */}
              <div className="mt-8">
                <AdBanner position="watch" />
              </div>

              {/* Comments Section */}
              <div className="mt-12">
                <Comments mediaId={detail?.id?.toString() || ""} mediaType={media_type} />
              </div>

            </div>

            {/* Sidebar (Recommendations) */}
            <div className="xl:col-span-1 col-span-4 space-y-8">
              <RightbarFilms
                className="xl:block"
                films={recommendations}
                name="More Like This"
                limitNumber={10}
                isLoading={!recommendations}
              />

              {/* Vertical Ad Banner for Desktop */}
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
