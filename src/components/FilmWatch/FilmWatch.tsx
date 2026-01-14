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
import { EMBED_ALTERNATIVES } from "../../shared/constants";
import { useAppSelector } from "../../store/hooks";
import { downloadService } from "../../services/download";
import ReadMore from "../Common/ReadMore";
import RightbarFilms from "../Common/RightbarFilms";
import SearchBox from "../Common/SearchBox";
import Sidebar from "../Common/Sidebar";
import SidebarMini from "../Common/SidebarMini";
import Skeleton from "../Common/Skeleton";
import Title from "../Common/Title";
import Footer from "../Footer/Footer";
import Comment from "./Comment/Comment";
import SeasonSelection from "./SeasonSelection";
import DownloadOptions from "../Common/DownloadOptions";

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

  // Generate all available video sources
  const getVideoSources = () => {
    // Get IMDB ID for movies, use TMDB ID as fallback for TV shows
    const imdbId = media_type === "movie" 
      ? (detail as DetailMovie)?.imdb_id || detail?.id?.toString() 
      : detail?.id?.toString();
    const tmdbId = detail?.id?.toString() || "";
    
    if (media_type === "movie") {
      return [
        `${EMBED_ALTERNATIVES.VIDSRC}/${detail?.id}`,
        // New video sources - added after VIDSRC
        `https://vidsrc.me/embed/${imdbId}`,
        `https://fsapi.xyz/movie/${imdbId}`,
        `https://curtstream.com/movies/imdb/${imdbId}`,
        `https://moviewp.com/se.php?video_id=${imdbId}`,
        `https://v2.apimdb.net/e/movie/${imdbId}`,
        `https://gomo.to/movie/${imdbId}`,
        `https://vidcloud.stream/${imdbId}.html`,
        `https://getsuperembed.link/?video_id=${imdbId}`,
        `https://databasegdriveplayer.co/player.php?type=movie&tmdb=${tmdbId}`,
        `https://123movies.com/movie/${imdbId}`,
        `https://fmovies.to/movie/${imdbId}`,
        `https://yesmovies.to/movie/${imdbId}`,
        `https://gomovies.sx/movie/${imdbId}`,
        `${EMBED_ALTERNATIVES.EMBEDTO}/movie?id=${detail?.id}`,
        `${EMBED_ALTERNATIVES.TWOEMBED}/movie?tmdb=${detail?.id}`,
        `${EMBED_ALTERNATIVES.VIDEMBED}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.MOVIEBOX}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.WATCHMOVIES}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.STREAMSB}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.VIDSTREAM}/movie/${detail?.id}`,
        // African and non-Western content - Updated sources
        `${EMBED_ALTERNATIVES.AFRIKAN}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.BOLLYWOOD}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.ASIAN}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.LATINO}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.ARABIC}/movie/${detail?.id}`,
        // New African content sources
        `${EMBED_ALTERNATIVES.AFRIKANFLIX}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOODPLUS}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.AFRICANMOVIES}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.KENYANFLIX}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.NIGERIANFLIX}/movie/${detail?.id}`,
        // Regional African streaming services
        `${EMBED_ALTERNATIVES.SHOWMAX}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.IROKO}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.BONGO}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.KWESE}/movie/${detail?.id}`,
        // Major streaming platforms
        `${EMBED_ALTERNATIVES.NETFLIX}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.AMAZON}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.DISNEY}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.HBO}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.HULU}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.APPLE}/movie/${detail?.id}`,
        // Video platforms
        `${EMBED_ALTERNATIVES.YOUTUBE}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.VIMEO}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.DAILYMOTION}/movie/${detail?.id}`,
        // FZMovies CMS sources - using proper embed formats
        `${EMBED_ALTERNATIVES.FZMOVIES_WATCH}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_EMBED}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_PLAYER}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT1}/embed/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT2}/watch/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT3}/movie/${detail?.id}`,
        // New video sources - using proper embed formats
        `${EMBED_ALTERNATIVES.KISSKH_EMBED}/drama/${detail?.id}`,
        `${EMBED_ALTERNATIVES.KISSKH}/drama/${detail?.id}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME_EMBED}/anime/${detail?.id}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME}/anime/${detail?.id}`,
        `${EMBED_ALTERNATIVES.AILOK_EMBED}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.AILOK}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV_EMBED}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT2}/player/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT3}/watch/movie/${detail?.id}`,
        // Additional working sources for African content
        `${EMBED_ALTERNATIVES.NOLLYWOOD_TV}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.AFRICAN_MOVIES_ONLINE}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD_MOVIES}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.AFRIKAN_MOVIES}/movie/${detail?.id}`,
        // Additional working sources for Asian content
        `${EMBED_ALTERNATIVES.DRAMACOOL}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.KISSASIAN}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.ASIANSERIES}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.MYASIANTV}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.VIKI}/movie/${detail?.id}`,
        // Additional working sources for Latin American content
        `${EMBED_ALTERNATIVES.CUEVANA}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.PELISPLUS}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.REPELIS}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.LATINOMOVIES}/movie/${detail?.id}`,
        // Additional working sources for Middle Eastern content
        `${EMBED_ALTERNATIVES.SHAHID}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.OSN}/movie/${detail?.id}`,
        // Universal working sources
        `${EMBED_ALTERNATIVES.SUPEREMBED}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.EMBEDMOVIE}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.STREAMTAPE}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.MIXDROP}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.UPCLOUD}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.EMBEDSB}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.STREAMWISH}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.FILEMOON}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.DOODSTREAM}/movie/${detail?.id}`,
        // Regional-specific sources
        `${EMBED_ALTERNATIVES.ZEE5}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.HOTSTAR}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.VIU}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.IWANTTFC}/movie/${detail?.id}`,
        `${EMBED_ALTERNATIVES.ABS_CBN}/movie/${detail?.id}`,
      ];
    } else {
      return [
        `${EMBED_ALTERNATIVES.VIDSRC}/${detail?.id}/${seasonId}-${episodeId}`,
        // New video sources - added after VIDSRC
        `https://fsapi.xyz/tv-imdb/${imdbId}-${seasonId}-${episodeId}`,
        `https://moviewp.com/se.php?video_id=${tmdbId}&tmdb=1&s=${seasonId}&e=${episodeId}`,
        `https://v2.apimdb.net/e/tmdb/tv/${tmdbId}/${seasonId}/${episodeId}/`,
        `https://databasegdriveplayer.co/player.php?type=series&tmdb=${tmdbId}&season=${seasonId}&episode=${episodeId}`,
        `https://curtstream.com/series/tmdb/${tmdbId}/${seasonId}/${episodeId}/`,
        `https://getsuperembed.link/?video_id=${imdbId}&season=${seasonId}&episode=${episodeId}`,
        `https://123movies.com/tv/${imdbId}/${seasonId}/${episodeId}`,
        `https://fmovies.to/tv/${imdbId}/${seasonId}/${episodeId}`,
        `https://yesmovies.to/tv/${imdbId}/${seasonId}/${episodeId}`,
        `https://gomovies.sx/tv/${imdbId}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.EMBEDTO}/tv?id=${detail?.id}&s=${seasonId}&e=${episodeId}`,
        `${EMBED_ALTERNATIVES.TWOEMBED}/series?tmdb=${detail?.id}&sea=${seasonId}&epi=${episodeId}`,
        `${EMBED_ALTERNATIVES.VIDEMBED}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MOVIEBOX}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.WATCHMOVIES}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.STREAMSB}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIDSTREAM}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // African and non-Western content - Updated sources
        `${EMBED_ALTERNATIVES.AFRIKAN}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.BOLLYWOOD}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ASIAN}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.LATINO}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ARABIC}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // New African content sources
        `${EMBED_ALTERNATIVES.AFRIKANFLIX}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOODPLUS}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRICANMOVIES}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KENYANFLIX}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NIGERIANFLIX}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // Regional African streaming services
        `${EMBED_ALTERNATIVES.SHOWMAX}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.IROKO}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.BONGO}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KWESE}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // Major streaming platforms
        `${EMBED_ALTERNATIVES.NETFLIX}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AMAZON}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DISNEY}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.HBO}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.HULU}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.APPLE}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // Video platforms
        `${EMBED_ALTERNATIVES.YOUTUBE}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIMEO}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DAILYMOTION}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // FZMovies CMS sources - using proper embed formats
        `${EMBED_ALTERNATIVES.FZMOVIES_WATCH}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_EMBED}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_PLAYER}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT1}/embed/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT2}/watch/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT3}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // New video sources - using proper embed formats
        `${EMBED_ALTERNATIVES.KISSKH_EMBED}/drama/${detail?.id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.KISSKH}/drama/${detail?.id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME_EMBED}/anime/${detail?.id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME}/anime/${detail?.id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.AILOK_EMBED}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AILOK}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV_EMBED}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT2}/player/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT3}/watch/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // Additional working sources for African content
        `${EMBED_ALTERNATIVES.NOLLYWOOD_TV}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRICAN_MOVIES_ONLINE}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD_MOVIES}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRIKAN_MOVIES}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // Additional working sources for Asian content
        `${EMBED_ALTERNATIVES.DRAMACOOL}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KISSASIAN}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ASIANSERIES}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MYASIANTV}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIKI}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // Additional working sources for Latin American content
        `${EMBED_ALTERNATIVES.CUEVANA}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.PELISPLUS}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.REPELIS}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.LATINOMOVIES}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // Additional working sources for Middle Eastern content
        `${EMBED_ALTERNATIVES.SHAHID}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.OSN}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // Universal working sources
        `${EMBED_ALTERNATIVES.SUPEREMBED}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.EMBEDMOVIE}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.STREAMTAPE}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MIXDROP}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.UPCLOUD}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.EMBEDSB}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.STREAMWISH}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FILEMOON}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DOODSTREAM}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        // Regional-specific sources
        `${EMBED_ALTERNATIVES.ZEE5}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.HOTSTAR}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIU}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.IWANTTFC}/tv/${detail?.id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ABS_CBN}/tv/${detail?.id}/${seasonId}/${episodeId}`,
      ];
    }
  };

  const videoSources = getVideoSources();
  const currentSource = videoSources[currentSourceIndex];

  // Helper function to get readable source names
  const getSourceDisplayName = (source: string): string => {
    // Primary sources
    if (source.includes('vidsrc.me')) return 'VidSrc';
    if (source.includes('fsapi.xyz')) return 'FSAPI.xyz';
    if (source.includes('curtstream.com')) return 'CurtStream';
    if (source.includes('moviewp.com')) return 'MovieWP';
    if (source.includes('v2.apimdb.net')) return 'APIMDB';
    if (source.includes('gomo.to')) return 'Gomo';
    if (source.includes('vidcloud.stream')) return 'VidCloud';
    if (source.includes('getsuperembed.link')) return 'GetSuperEmbed';
    if (source.includes('databasegdriveplayer.co')) return 'GoDrivePlayer';
    if (source.includes('123movies.com')) return '123Movies';
    if (source.includes('fmovies.to')) return 'FMovies';
    if (source.includes('yesmovies.to')) return 'YesMovies';
    if (source.includes('gomovies.sx')) return 'GoMovies';
    if (source.includes('2embed.to')) return '2Embed.to';
    if (source.includes('2embed.org')) return '2Embed.org';
    if (source.includes('vidembed.cc')) return 'VidEmbed';
    if (source.includes('moviebox.live')) return 'MovieBox';
    if (source.includes('watchmovieshd.ru')) return 'WatchMovies';
    if (source.includes('streamsb.net')) return 'StreamSB';
    if (source.includes('vidstream.pro')) return 'VidStream';
    
    // African and non-Western content
    if (source.includes('afrikan.tv')) return 'Afrikan TV';
    if (source.includes('nollywood.tv')) return 'Nollywood TV';
    if (source.includes('bollywood.tv')) return 'Bollywood TV';
    if (source.includes('asian.tv')) return 'Asian TV';
    if (source.includes('latino.tv')) return 'Latino TV';
    if (source.includes('arabic.tv')) return 'Arabic TV';
    
    // New African content sources
    if (source.includes('afrikanflix.com')) return 'AfrikanFlix';
    if (source.includes('nollywoodplus.com')) return 'NollywoodPlus';
    if (source.includes('africanmovies.net')) return 'AfricanMovies';
    if (source.includes('africanmoviesonline.com')) return 'African Movies Online';
    if (source.includes('nollywoodmovies.com')) return 'Nollywood Movies';
    if (source.includes('afrikanmovies.com')) return 'Afrikan Movies';
    if (source.includes('nollywoodtv.com')) return 'Nollywood TV';
    if (source.includes('kenyanflix.com')) return 'KenyanFlix';
    if (source.includes('nigerianflix.com')) return 'NigerianFlix';
    
    // Regional African streaming services
    if (source.includes('showmax.com')) return 'ShowMax';
    if (source.includes('irokotv.com')) return 'Iroko TV';
    if (source.includes('bongotv.com')) return 'Bongo TV';
    if (source.includes('kwese.iflix.com')) return 'Kwese iFlix';
    
    // Asian content sources
    if (source.includes('dramacool.com')) return 'DramaCool';
    if (source.includes('kissasian.com')) return 'KissAsian';
    if (source.includes('asianseries.com')) return 'AsianSeries';
    if (source.includes('myasiantv.com')) return 'MyAsianTV';
    if (source.includes('viki.com')) return 'Viki';
    if (source.includes('kisskh.com')) return 'KissKH';
    if (source.includes('ugc-anime.com')) return 'UGC Anime';
    
    // Latin American content
    if (source.includes('cuevana.com')) return 'Cuevana';
    if (source.includes('pelisplus.com')) return 'PelisPlus';
    if (source.includes('repelis.com')) return 'Repelis';
    if (source.includes('latinomovies.com')) return 'Latino Movies';
    
    // Middle Eastern content
    if (source.includes('shahid.mbc.net')) return 'Shahid MBC';
    if (source.includes('osn.com')) return 'OSN';
    
    // Universal working sources
    if (source.includes('superembed.com')) return 'SuperEmbed';
    if (source.includes('embedmovie.com')) return 'EmbedMovie';
    if (source.includes('streamtape.com')) return 'StreamTape';
    if (source.includes('mixdrop.com')) return 'MixDrop';
    if (source.includes('upcloud.com')) return 'UpCloud';
    if (source.includes('embedsb.com')) return 'EmbedSB';
    if (source.includes('streamwish.com')) return 'StreamWish';
    if (source.includes('filemoon.com')) return 'FileMoon';
    if (source.includes('doodstream.com')) return 'DoodStream';
    
    // Regional-specific sources
    if (source.includes('zee5.com')) return 'ZEE5';
    if (source.includes('hotstar.com')) return 'Disney+ Hotstar';
    if (source.includes('viu.com')) return 'Viu';
    if (source.includes('iwanttfc.com')) return 'iWantTFC';
    if (source.includes('abs-cbn.com')) return 'ABS-CBN';
    
    // Additional sources
    if (source.includes('ailok.pe')) return 'Ailok';
    if (source.includes('sz.googotv.com')) return 'GoogoTV';
    if (source.includes('cinemaholic.com')) return 'Cinemaholic';
    if (source.includes('moviefreak.com')) return 'MovieFreak';
    if (source.includes('watchseries.to')) return 'WatchSeries';
    if (source.includes('putlocker.to')) return 'Putlocker';
    if (source.includes('solarmovie.to')) return 'SolarMovie';
    if (source.includes('fmovies.to')) return 'FMovies';
    if (source.includes('drive.google.com')) return 'Google Drive';
    
    // Major streaming platforms
    if (source.includes('netflix.com')) return 'Netflix';
    if (source.includes('amazon.com')) return 'Amazon Prime Video';
    if (source.includes('disneyplus.com')) return 'Disney+';
    if (source.includes('hbomax.com')) return 'HBO Max';
    if (source.includes('hulu.com')) return 'Hulu';
    if (source.includes('tv.apple.com')) return 'Apple TV+';
    
    // Video platforms
    if (source.includes('youtube.com')) return 'YouTube';
    if (source.includes('vimeo.com')) return 'Vimeo';
    if (source.includes('dailymotion.com')) return 'Dailymotion';
    
    // FZMovies CMS sources
    if (source.includes('fzmovies.cms')) return 'FZMovies';
    if (source.includes('fzmovies.net')) return 'FZMovies (Alt)';
    if (source.includes('fzmovies.watch')) return 'FZMovies Watch';
    if (source.includes('fzmovies.to')) return 'FZMovies To';
    
    // Extract domain name as fallback
    try {
      const url = new URL(source);
      const domain = url.hostname.replace('www.', '').split('.')[0];
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Video Source';
    }
  };

  const handleVideoError = () => {
    console.log(`Video source ${currentSourceIndex + 1} failed, trying next...`);
    setVideoError(true);
    
    // Try next source if available
    if (currentSourceIndex < videoSources.length - 1) {
      setTimeout(() => {
        setCurrentSourceIndex(currentSourceIndex + 1);
        setVideoError(false);
        setIsLoadingVideo(true);
      }, 1000);
    } else {
      // All sources failed
      setVideoError(true);
      setIsLoadingVideo(false);
    }
  };

  const handleVideoLoad = () => {
    setIsLoadingVideo(false);
    setVideoError(false);
  };

  // Function to reset to first source
  const resetToFirstSource = () => {
    setCurrentSourceIndex(0);
    setVideoError(false);
    setIsLoadingVideo(true);
  };

  // Auto-advance to next source if current one fails
  useEffect(() => {
    if (videoError && currentSourceIndex < videoSources.length - 1) {
      const timer = setTimeout(() => {
        setCurrentSourceIndex(currentSourceIndex + 1);
        setVideoError(false);
        setIsLoadingVideo(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [videoError, currentSourceIndex, videoSources.length]);

  // Reset source when detail changes
  useEffect(() => {
    setCurrentSourceIndex(0);
    setVideoError(false);
    setIsLoadingVideo(true);
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

  return (
    <>
      {detail && (
        <Title
          value={`Watch: ${
            (detail as DetailMovie).title || (detail as DetailTV).name
          } ${
            media_type === "tv" ? `- Season ${seasonId} - Ep ${episodeId}` : ""
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
                {/* Manual source selector */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <select
                    value={currentSourceIndex}
                    onChange={(e) => {
                      setCurrentSourceIndex(Number(e.target.value));
                      setVideoError(false);
                      setIsLoadingVideo(true);
                    }}
                    className="bg-black/80 text-white text-xs px-3 py-2 rounded border border-gray-600 hover:border-gray-400 transition-colors"
                  >
                    {videoSources.map((source, index) => (
                      <option key={index} value={index}>
                        {getSourceDisplayName(source)} - Source {index + 1}
                      </option>
                    ))}
                  </select>
                  
                  {/* Download Button */}
                  {downloadInfo && (
                    <button
                      onClick={() => {
                        // Scroll to download section
                        const downloadSection = document.getElementById('download-section');
                        if (downloadSection) {
                          downloadSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="bg-black/80 border border-primary text-primary hover:bg-primary hover:text-white text-xs px-3 py-2 rounded transition-colors flex items-center gap-1"
                    >
                      <AiOutlineDownload size={14} />
                      Download
                    </button>
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
                {/* Enhanced video status and fallback controls */}
                <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-3 rounded-lg text-sm max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Video Source {currentSourceIndex + 1}/{videoSources.length}</p>
                    {videoError && (
                      <button
                        onClick={resetToFirstSource}
                        className="text-primary hover:text-blue-300 text-xs underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <p className="text-xs mb-2 break-all">
                    {currentSource}
                  </p>
                  {isLoadingVideo && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading...</span>
                    </div>
                  )}
                  {videoError && currentSourceIndex < videoSources.length - 1 && (
                    <div className="flex items-center gap-2 text-orange-400">
                      <span className="text-xs">Source failed, trying next...</span>
                    </div>
                  )}
                  {videoError && currentSourceIndex === videoSources.length - 1 && (
                    <div className="text-red-400 text-xs">
                      All sources failed. Try refreshing or check your ad blocker.
                    </div>
                  )}
                </div>
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
          <Comment media_type={media_type} id={detail?.id} />
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
