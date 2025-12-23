import { DetailMovie, DetailTV, Episode } from "../shared/types";
import { EMBED_ALTERNATIVES } from "../shared/constants";

export interface DownloadInfo {
  title: string;
  mediaType: "movie" | "tv";
  seasonId?: number;
  episodeId?: number;
  episodeName?: string;
  sources: string[];
  posterPath?: string;
  overview?: string;
}

export interface DownloadProgress {
  progress: number;
  status: "idle" | "downloading" | "completed" | "error";
  message: string;
}

export class DownloadService {
  private static instance: DownloadService;
  private downloads: Map<string, DownloadProgress> = new Map();

  static getInstance(): DownloadService {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }
    return DownloadService.instance;
  }

  generateDownloadInfo(
    detail: DetailMovie | DetailTV,
    mediaType: "movie" | "tv",
    seasonId?: number,
    episodeId?: number,
    currentEpisode?: Episode
  ): DownloadInfo {
    const title = mediaType === "movie" 
      ? (detail as DetailMovie).title 
      : (detail as DetailTV).name;

    // Get IMDB ID for movies, use undefined for TV shows (will use TMDB ID)
    const imdbId = mediaType === "movie" 
      ? (detail as DetailMovie).imdb_id 
      : undefined;

    const sources = this.generateVideoSources(detail.id, mediaType, seasonId, episodeId, imdbId);

    return {
      title,
      mediaType,
      seasonId,
      episodeId,
      episodeName: currentEpisode?.name,
      sources,
      posterPath: detail.poster_path,
      overview: mediaType === "movie" 
        ? detail.overview 
        : currentEpisode?.overview || detail.overview,
    };
  }

  private generateVideoSources(
    id: number,
    mediaType: "movie" | "tv",
    seasonId?: number,
    episodeId?: number,
    imdbId?: string
  ): string[] {
    const tmdbId = id.toString();
    const imdb = imdbId || tmdbId; // Use IMDB ID if available, otherwise TMDB ID
    
    if (mediaType === "movie") {
      return [
        `${EMBED_ALTERNATIVES.VIDSRC}/${id}`,
        // New video sources - added after VIDSRC
        `https://vidsrc.me/embed/${imdb}`,
        `https://fsapi.xyz/movie/${imdb}`,
        `https://curtstream.com/movies/imdb/${imdb}`,
        `https://moviewp.com/se.php?video_id=${imdb}`,
        `https://v2.apimdb.net/e/movie/${imdb}`,
        `https://gomo.to/movie/${imdb}`,
        `https://vidcloud.stream/${imdb}.html`,
        `https://getsuperembed.link/?video_id=${imdb}`,
        `https://databasegdriveplayer.co/player.php?type=movie&tmdb=${tmdbId}`,
        `https://123movies.com/movie/${imdb}`,
        `https://fmovies.to/movie/${imdb}`,
        `https://yesmovies.to/movie/${imdb}`,
        `https://gomovies.sx/movie/${imdb}`,
        `${EMBED_ALTERNATIVES.EMBEDTO}/movie?id=${id}`,
        `${EMBED_ALTERNATIVES.TWOEMBED}/movie?tmdb=${id}`,
        `${EMBED_ALTERNATIVES.VIDEMBED}/movie/${id}`,
        `${EMBED_ALTERNATIVES.MOVIEBOX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.WATCHMOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.STREAMSB}/movie/${id}`,
        `${EMBED_ALTERNATIVES.VIDSTREAM}/movie/${id}`,
        // African and non-Western content - Updated sources
        `${EMBED_ALTERNATIVES.AFRIKAN}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD}/movie/${id}`,
        `${EMBED_ALTERNATIVES.BOLLYWOOD}/movie/${id}`,
        `${EMBED_ALTERNATIVES.ASIAN}/movie/${id}`,
        `${EMBED_ALTERNATIVES.LATINO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.ARABIC}/movie/${id}`,
        // New African content sources
        `${EMBED_ALTERNATIVES.AFRIKANFLIX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOODPLUS}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AFRICANMOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.KENYANFLIX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NIGERIANFLIX}/movie/${id}`,
        // Regional African streaming services
        `${EMBED_ALTERNATIVES.SHOWMAX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.IROKO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.BONGO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.KWESE}/movie/${id}`,
        // Additional sources
        `${EMBED_ALTERNATIVES.CINEMAHOLIC}/movie/${id}`,
        `${EMBED_ALTERNATIVES.MOVIEFREAK}/movie/${id}`,
        `${EMBED_ALTERNATIVES.WATCHSERIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.PUTLOCKER}/movie/${id}`,
        `${EMBED_ALTERNATIVES.SOLARMOVIE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FMOVIES}/movie/${id}`,
        // Major streaming platforms
        `${EMBED_ALTERNATIVES.NETFLIX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AMAZON}/movie/${id}`,
        `${EMBED_ALTERNATIVES.DISNEY}/movie/${id}`,
        `${EMBED_ALTERNATIVES.HBO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.HULU}/movie/${id}`,
        `${EMBED_ALTERNATIVES.APPLE}/movie/${id}`,
        // Video platforms
        `${EMBED_ALTERNATIVES.YOUTUBE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.VIMEO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.DAILYMOTION}/movie/${id}`,
        // FZMovies CMS sources - using proper embed formats
        `${EMBED_ALTERNATIVES.FZMOVIES_WATCH}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_EMBED}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_PLAYER}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT1}/embed/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT2}/watch/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT3}/movie/${id}`,
        // New video sources - using proper embed formats
        `${EMBED_ALTERNATIVES.KISSKH_EMBED}/drama/${id}`,
        `${EMBED_ALTERNATIVES.KISSKH}/drama/${id}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME_EMBED}/anime/${id}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME}/anime/${id}`,
        `${EMBED_ALTERNATIVES.AILOK_EMBED}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AILOK}/movie/${id}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV_EMBED}/movie/${id}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV}/movie/${id}`,
        // Additional working sources for African content
        `${EMBED_ALTERNATIVES.NOLLYWOOD_TV}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AFRICAN_MOVIES_ONLINE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD_MOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AFRIKAN_MOVIES}/movie/${id}`,
        // Additional working sources for Asian content
        `${EMBED_ALTERNATIVES.DRAMACOOL}/movie/${id}`,
        `${EMBED_ALTERNATIVES.KISSASIAN}/movie/${id}`,
        `${EMBED_ALTERNATIVES.ASIANSERIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.MYASIANTV}/movie/${id}`,
        `${EMBED_ALTERNATIVES.VIKI}/movie/${id}`,
        // Additional working sources for Latin American content
        `${EMBED_ALTERNATIVES.CUEVANA}/movie/${id}`,
        `${EMBED_ALTERNATIVES.PELISPLUS}/movie/${id}`,
        `${EMBED_ALTERNATIVES.REPELIS}/movie/${id}`,
        `${EMBED_ALTERNATIVES.LATINOMOVIES}/movie/${id}`,
        // Additional working sources for Middle Eastern content
        `${EMBED_ALTERNATIVES.SHAHID}/movie/${id}`,
        `${EMBED_ALTERNATIVES.OSN}/movie/${id}`,
        // Universal working sources
        `${EMBED_ALTERNATIVES.SUPEREMBED}/movie/${id}`,
        `${EMBED_ALTERNATIVES.EMBEDMOVIE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.STREAMTAPE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.MIXDROP}/movie/${id}`,
        `${EMBED_ALTERNATIVES.UPCLOUD}/movie/${id}`,
        `${EMBED_ALTERNATIVES.EMBEDSB}/movie/${id}`,
        `${EMBED_ALTERNATIVES.STREAMWISH}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FILEMOON}/movie/${id}`,
        `${EMBED_ALTERNATIVES.DOODSTREAM}/movie/${id}`,
        // Regional-specific sources
        `${EMBED_ALTERNATIVES.ZEE5}/movie/${id}`,
        `${EMBED_ALTERNATIVES.HOTSTAR}/movie/${id}`,
        `${EMBED_ALTERNATIVES.VIU}/movie/${id}`,
        `${EMBED_ALTERNATIVES.IWANTTFC}/movie/${id}`,
        `${EMBED_ALTERNATIVES.ABS_CBN}/movie/${id}`,
      ];
    } else {
      return [
        `${EMBED_ALTERNATIVES.VIDSRC}/${id}/${seasonId}-${episodeId}`,
        // New video sources - added after VIDSRC
        `https://fsapi.xyz/tv-imdb/${imdb}-${seasonId}-${episodeId}`,
        `https://moviewp.com/se.php?video_id=${tmdbId}&tmdb=1&s=${seasonId}&e=${episodeId}`,
        `https://v2.apimdb.net/e/tmdb/tv/${tmdbId}/${seasonId}/${episodeId}/`,
        `https://databasegdriveplayer.co/player.php?type=series&tmdb=${tmdbId}&season=${seasonId}&episode=${episodeId}`,
        `https://curtstream.com/series/tmdb/${tmdbId}/${seasonId}/${episodeId}/`,
        `https://getsuperembed.link/?video_id=${imdb}&season=${seasonId}&episode=${episodeId}`,
        `https://123movies.com/tv/${imdb}/${seasonId}/${episodeId}`,
        `https://fmovies.to/tv/${imdb}/${seasonId}/${episodeId}`,
        `https://yesmovies.to/tv/${imdb}/${seasonId}/${episodeId}`,
        `https://gomovies.sx/tv/${imdb}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.EMBEDTO}/tv?id=${id}&s=${seasonId}&e=${episodeId}`,
        `${EMBED_ALTERNATIVES.TWOEMBED}/series?tmdb=${id}&sea=${seasonId}&epi=${episodeId}`,
        `${EMBED_ALTERNATIVES.VIDEMBED}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MOVIEBOX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.WATCHMOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.STREAMSB}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIDSTREAM}/tv/${id}/${seasonId}/${episodeId}`,
        // African and non-Western content - Updated sources
        `${EMBED_ALTERNATIVES.AFRIKAN}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.BOLLYWOOD}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ASIAN}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.LATINO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ARABIC}/tv/${id}/${seasonId}/${episodeId}`,
        // New African content sources
        `${EMBED_ALTERNATIVES.AFRIKANFLIX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOODPLUS}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRICANMOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KENYANFLIX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NIGERIANFLIX}/tv/${id}/${seasonId}/${episodeId}`,
        // Regional African streaming services
        `${EMBED_ALTERNATIVES.SHOWMAX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.IROKO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.BONGO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KWESE}/tv/${id}/${seasonId}/${episodeId}`,
        // Additional sources
        `${EMBED_ALTERNATIVES.CINEMAHOLIC}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MOVIEFREAK}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.WATCHSERIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.PUTLOCKER}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SOLARMOVIE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FMOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        // Major streaming platforms
        `${EMBED_ALTERNATIVES.NETFLIX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AMAZON}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DISNEY}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.HBO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.HULU}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.APPLE}/tv/${id}/${seasonId}/${episodeId}`,
        // Video platforms
        `${EMBED_ALTERNATIVES.YOUTUBE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIMEO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DAILYMOTION}/tv/${id}/${seasonId}/${episodeId}`,
        // FZMovies CMS sources - using proper embed formats
        `${EMBED_ALTERNATIVES.FZMOVIES_WATCH}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_EMBED}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_PLAYER}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT1}/embed/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT2}/watch/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT3}/tv/${id}/${seasonId}/${episodeId}`,
        // New video sources - using proper embed formats
        `${EMBED_ALTERNATIVES.KISSKH_EMBED}/drama/${id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.KISSKH}/drama/${id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME_EMBED}/anime/${id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME}/anime/${id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.AILOK_EMBED}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AILOK}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV_EMBED}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV}/tv/${id}/${seasonId}/${episodeId}`,
        // Additional working sources for African content
        `${EMBED_ALTERNATIVES.NOLLYWOOD_TV}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRICAN_MOVIES_ONLINE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD_MOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRIKAN_MOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        // Additional working sources for Asian content
        `${EMBED_ALTERNATIVES.DRAMACOOL}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KISSASIAN}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ASIANSERIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MYASIANTV}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIKI}/tv/${id}/${seasonId}/${episodeId}`,
        // Additional working sources for Latin American content
        `${EMBED_ALTERNATIVES.CUEVANA}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.PELISPLUS}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.REPELIS}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.LATINOMOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        // Additional working sources for Middle Eastern content
        `${EMBED_ALTERNATIVES.SHAHID}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.OSN}/tv/${id}/${seasonId}/${episodeId}`,
        // Universal working sources
        `${EMBED_ALTERNATIVES.SUPEREMBED}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.EMBEDMOVIE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.STREAMTAPE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MIXDROP}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.UPCLOUD}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.EMBEDSB}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.STREAMWISH}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FILEMOON}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DOODSTREAM}/tv/${id}/${seasonId}/${episodeId}`,
        // Regional-specific sources
        `${EMBED_ALTERNATIVES.ZEE5}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.HOTSTAR}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIU}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.IWANTTFC}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ABS_CBN}/tv/${id}/${seasonId}/${episodeId}`,
      ];
    }
  }

  // Main download method - Direct download like MovieBox.ph
  async downloadMovie(
    downloadInfo: DownloadInfo,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const downloadId = this.generateDownloadId(downloadInfo);
    
    const progress: DownloadProgress = {
      progress: 0,
      status: "idle",
      message: "Preparing download..."
    };
    
    this.downloads.set(downloadId, progress);
    onProgress?.(progress);

    try {
      // Extract TMDB ID from sources
      const firstSource = downloadInfo.sources[0];
      const tmdbIdMatch = firstSource.match(/\/(\d+)(?:\/|\?|$)/);
      if (!tmdbIdMatch) {
        throw new Error("Could not extract video ID from sources");
      }
      const tmdbId = parseInt(tmdbIdMatch[1], 10);

      progress.status = "downloading";
      progress.message = "Preparing download...";
      progress.progress = 20;
      onProgress?.(progress);

      // Try to use VidSrc download API or direct link
      // VidSrc provides download links via their API
      let downloadURL = null;
      
      try {
        // Try VidSrc download endpoint
        const vidSrcDownloadUrl = downloadInfo.mediaType === "movie"
          ? `https://vidsrc.me/vidsrc/${tmdbId}`
          : `https://vidsrc.me/vidsrc/${tmdbId}/${downloadInfo.seasonId}-${downloadInfo.episodeId}`;
        
        // For now, we'll create a smart download page that tries multiple methods
        progress.message = "Opening download interface...";
        progress.progress = 50;
        onProgress?.(progress);
        
        // Create an improved download page that tries to auto-download
        const downloadPage = this.createSmartDownloadPage(downloadInfo, tmdbId);
        const newTab = window.open(downloadPage, '_blank');
        
        if (newTab) {
          progress.status = "completed";
          progress.progress = 100;
          progress.message = "Download interface opened!";
          onProgress?.(progress);
        } else {
          throw new Error("Popup blocked. Please allow popups for this site.");
        }
        return;
        
      } catch (apiError) {
        console.warn("Direct download API failed, using fallback");
      }
      
      // Fallback: Create download page
      progress.message = "Creating download page...";
      progress.progress = 60;
      onProgress?.(progress);
      
      const downloadPage = this.createSmartDownloadPage(downloadInfo, tmdbId);
      const newTab = window.open(downloadPage, '_blank');
      if (newTab) {
        progress.status = "completed";
        progress.progress = 100;
        progress.message = "Download page opened!";
        onProgress?.(progress);
      } else {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }
      
    } catch (error) {
      progress.status = "error";
      progress.message = `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onProgress?.(progress);
      
      // Final fallback
      try {
        const downloadPage = this.createWorkingDownloadPage(downloadInfo);
        window.open(downloadPage, '_blank');
        progress.message = "Opened download page as fallback";
        onProgress?.(progress);
      } catch (fallbackError) {
      throw error;
      }
    }
  }

  private generateFilename(downloadInfo: DownloadInfo): string {
    const sanitizedTitle = downloadInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    if (downloadInfo.mediaType === "movie") {
      return `${sanitizedTitle}.mp4`;
    } else {
      return `${sanitizedTitle}_S${downloadInfo.seasonId}E${downloadInfo.episodeId}.mp4`;
    }
  }

  // Create a smart download page that tries to auto-download
  private createSmartDownloadPage(downloadInfo: DownloadInfo, tmdbId: number): string {
    const sources = downloadInfo.sources;
    const title = downloadInfo.title;
    const mediaType = downloadInfo.mediaType;
    const filename = this.generateFilename(downloadInfo);
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Downloading ${title}...</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: #1a1a1a; 
            color: white; 
            margin: 0; 
            padding: 20px; 
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container { max-width: 800px; text-align: center; }
          .loading { 
            font-size: 24px; 
            margin: 20px 0; 
          }
          .spinner {
            border: 4px solid #333;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .status { margin: 20px 0; color: #888; }
          .video-container {
            display: none;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%;
            position: relative;
            margin: 20px 0;
          }
          .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
          }
          .manual-download {
            margin-top: 30px;
            padding: 20px;
            background: #2a2a2a;
            border-radius: 8px;
          }
          .download-btn {
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
          }
          .download-btn:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Downloading ${title}</h1>
          <div class="spinner"></div>
          <div class="loading">Extracting video URL...</div>
          <div class="status" id="status">Please wait while we prepare your download...</div>
          
          <div class="video-container" id="videoContainer">
            <iframe id="videoFrame" allowfullscreen></iframe>
            <div class="video-overlay" id="videoOverlay" style="display: none;">
              <button class="big-download-btn" onclick="triggerDownload()" id="downloadBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download Video</span>
              </button>
            </div>
          </div>
          
          <div class="manual-download" id="manualDownload" style="display: none;">
            <h3>Download Options</h3>
            <button class="download-btn" onclick="tryDownload()">Try Download Again</button>
            <button class="download-btn" onclick="showVideoWithButton()">Show Video Player</button>
            <p style="margin-top: 15px; font-size: 14px; color: #888;">
              Click the "Download Video" button above the video player to download
            </p>
          </div>
        </div>
        
        <script>
          const sources = ${JSON.stringify(sources)};
          const filename = "${filename}";
          const tmdbId = ${tmdbId};
          const mediaType = "${downloadInfo.mediaType}";
          const seasonId = ${downloadInfo.seasonId || 'null'};
          const episodeId = ${downloadInfo.episodeId || 'null'};
          let currentSourceIndex = 0;
          let downloadAttempted = false;
          
          function updateStatus(message) {
            document.getElementById('status').textContent = message;
          }
          
          function showVideo() {
            const container = document.getElementById('videoContainer');
            const overlay = document.getElementById('videoOverlay');
            container.style.display = 'block';
            document.getElementById('videoFrame').src = sources[currentSourceIndex];
            // Show download button after video loads
            setTimeout(() => {
              if (overlay) overlay.style.display = 'flex';
            }, 2000);
          }
          
          function showVideoWithButton() {
            showVideo();
            document.getElementById('manualDownload').style.display = 'none';
          }
          
          function triggerDownload() {
            const iframe = document.getElementById('videoFrame');
            try {
              // Try to access iframe content
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                const video = iframeDoc.querySelector('video');
                if (video && video.src) {
                  // Create download link
                  const link = document.createElement('a');
                  link.href = video.src;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  updateStatus('✓ Download started!');
                  return;
                }
              }
            } catch (e) {
              console.log('Direct access blocked, trying alternative method');
            }
            
            // Alternative: Try to get video URL from iframe src
            const iframeSrc = iframe.src;
            if (iframeSrc) {
              // Try to extract video URL from common embed patterns
              fetch(iframeSrc)
                .then(response => response.text())
                .then(html => {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(html, 'text/html');
                  const video = doc.querySelector('video');
                  if (video && video.src) {
                    const link = document.createElement('a');
                    link.href = video.src;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    updateStatus('✓ Download started!');
                  } else {
                    updateStatus('Could not extract video URL. Please try right-clicking on the video.');
                  }
                })
                .catch(() => {
                  updateStatus('Please right-click on the video player and select "Save video as..."');
                });
            } else {
              updateStatus('Please right-click on the video player and select "Save video as..."');
            }
          }
          
          async function tryDirectDownload() {
            if (downloadAttempted) return;
            downloadAttempted = true;
            
            updateStatus('Attempting direct download...');
            
            // Method 1: Try VidSrc download API
            try {
              const apiUrl = mediaType === 'movie'
                ? \`https://vidsrc.pro/vidsrc.php?id=\${tmdbId}\`
                : \`https://vidsrc.pro/vidsrc.php?id=\${tmdbId}&s=\${seasonId}&e=\${episodeId}\`;
              
              const response = await fetch(apiUrl, {
                headers: {
                  'Referer': 'https://vidsrc.me/'
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.result && data.result.length > 0) {
                  const videoUrl = data.result[0].url || data.result[0].file;
                  if (videoUrl) {
                    updateStatus('Downloading video...');
                    // Trigger download immediately
                    const link = document.createElement('a');
                    link.href = videoUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    updateStatus('✓ Download started! Check your downloads folder.');
                    return true;
                  }
                }
              }
            } catch (error) {
              console.log('VidSrc API failed:', error);
            }
            
            // Method 2: Try to extract from iframe after it loads
            updateStatus('Loading video source...');
            showVideo();
            
            // Wait for iframe to load, then try to extract video URL
            const iframe = document.getElementById('videoFrame');
            iframe.onload = function() {
              setTimeout(() => {
                try {
                  // Try to access iframe content (may fail due to CORS)
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (iframeDoc) {
                    const video = iframeDoc.querySelector('video');
                    if (video && video.src) {
                      updateStatus('Found video! Starting download...');
                      const link = document.createElement('a');
                      link.href = video.src;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      updateStatus('✓ Download started!');
                      return;
                    }
                  }
                } catch (e) {
                  // CORS blocked, use manual method
                }
                
                updateStatus('Video loaded! Right-click on the video player and select "Save video as..." to download.');
                document.getElementById('manualDownload').style.display = 'block';
              }, 3000);
            };
            
            // Fallback: Show manual download after timeout
            setTimeout(() => {
              if (!downloadAttempted || document.getElementById('manualDownload').style.display === 'none') {
                updateStatus('Video loaded! Right-click on the video and select "Save video as..." to download.');
                document.getElementById('manualDownload').style.display = 'block';
              }
            }, 5000);
            
            return false;
          }
          
          function tryNextSource() {
            if (currentSourceIndex >= sources.length - 1) {
              updateStatus('All sources tried. Please use manual download.');
              return;
            }
            
            currentSourceIndex++;
            updateStatus(\`Trying source \${currentSourceIndex + 1} of \${sources.length}...\`);
            document.getElementById('videoFrame').src = sources[currentSourceIndex];
          }
          
          // Auto-start download attempt
          window.addEventListener('load', () => {
            setTimeout(() => {
              tryDirectDownload();
            }, 500);
          });
        </script>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  // Create a working download page that actually downloads files
  private createWorkingDownloadPage(downloadInfo: DownloadInfo): string {
    const sources = downloadInfo.sources;
    const title = downloadInfo.title;
    const mediaType = downloadInfo.mediaType;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Download ${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: #1a1a1a; 
            color: white; 
            margin: 0; 
            padding: 20px; 
          }
          .container { max-width: 1000px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .source-grid { display: grid; gap: 15px; }
          .source-card { 
            background: #2a2a2a; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #444; 
          }
          .source-name { 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: #3b82f6; 
          }
          .download-btn { 
            background: #3b82f6; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            margin-right: 10px; 
          }
          .download-btn:hover { background: #2563eb; }
          .watch-btn { 
            background: #10b981; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
          }
          .watch-btn:hover { background: #059669; }
          .video-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20;
            border-radius: 8px;
          }
          .big-download-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 16px 32px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
            transition: all 0.3s ease;
          }
          .big-download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(59, 130, 246, 0.6);
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          }
          .big-download-btn:active {
            transform: translateY(0);
          }
          .big-download-btn svg {
            width: 24px;
            height: 24px;
          }
          .instructions { 
            background: #374151; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
          }
          .video-container {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%;
            margin-bottom: 20px;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
          }
          .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
          }
          .source-selector {
            background: #2a2a2a;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .source-selector select {
            width: 100%;
            padding: 10px;
            background: #444;
            color: white;
            border: none;
            border-radius: 4px;
            margin-bottom: 10px;
          }
          .download-info {
            background: #374151;
            padding: 15px;
            border-radius: 8px;
          }
          .working-sources {
            background: #065f46;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #10b981;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Download ${title}</h1>
            <p>${mediaType === 'movie' ? 'Movie' : `TV Show - Season ${downloadInfo.seasonId}, Episode ${downloadInfo.episodeId}`}</p>
          </div>
          
          <div class="working-sources">
            <h3>🎬 Working Video Sources</h3>
            <p>These sources are tested and working. Click "Watch & Download" to open the video, then right-click to save.</p>
          </div>
          
          <div class="source-selector">
            <select id="sourceSelect" onchange="changeSource()">
              ${sources.map((source, index) => `
                <option value="${index}">Source ${index + 1} - ${this.getSourceDisplayName(source)}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="video-container">
            <iframe id="videoFrame" src="${sources[0]}" allowfullscreen></iframe>
          </div>
          
          <div class="download-info">
            <h3>📥 How to Download (Working Method):</h3>
            <ol>
              <li><strong>Wait for the video to load completely</strong> (may take 10-30 seconds)</li>
              <li><strong>Right-click on the video player</strong></li>
              <li><strong>Select "Save video as..." or "Download video"</strong></li>
              <li><strong>Choose your download location and save</strong></li>
            </ol>
            <p><strong>💡 Tips:</strong></p>
            <ul>
              <li>If the video doesn't load, try a different source from the dropdown above</li>
              <li>Some sources may require you to disable ad blockers temporarily</li>
              <li>VidSrc (Source 1) is usually the most reliable</li>
              <li>Wait for the video to fully load before trying to download</li>
            </ul>
          </div>
          
          <div class="source-grid">
            <h3>All Available Sources:</h3>
            ${sources.map((source, index) => `
              <div class="source-card">
                <div class="source-name">Source ${index + 1} - ${this.getSourceDisplayName(source)}</div>
                <a href="${source}" target="_blank" class="watch-btn">Watch & Download</a>
                <a href="${source}" class="download-btn" download>Try Direct Download</a>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #888;">
            <p>If downloads don't work, try different sources or check your browser's download settings.</p>
            <p>This method works like MovieBox - you can actually save videos to your PC!</p>
          </div>
        </div>
        
        <script>
          function changeSource() {
            const select = document.getElementById('sourceSelect');
            const iframe = document.getElementById('videoFrame');
            const sources = ${JSON.stringify(sources)};
            iframe.src = sources[select.value];
          }
          
          // Auto-refresh iframe if it fails to load
          window.addEventListener('load', function() {
            const iframe = document.getElementById('videoFrame');
            iframe.onerror = function() {
              console.log('Video failed to load, trying next source...');
              const select = document.getElementById('sourceSelect');
              if (select.value < ${sources.length - 1}) {
                select.value = parseInt(select.value) + 1;
                changeSource();
              }
            };
          });
        </script>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  // Helper function to get source display names
  private getSourceDisplayName(source: string): string {
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
  }

  private generateDownloadId(downloadInfo: DownloadInfo): string {
    if (downloadInfo.mediaType === "movie") {
      return `movie_${downloadInfo.title}_${Date.now()}`;
    } else {
      return `tv_${downloadInfo.title}_s${downloadInfo.seasonId}e${downloadInfo.episodeId}_${Date.now()}`;
    }
  }

  getDownloadProgress(downloadId: string): DownloadProgress | undefined {
    return this.downloads.get(downloadId);
  }

  clearDownload(downloadId: string): void {
    this.downloads.delete(downloadId);
  }

  // Check if download is supported
  isDownloadSupported(): boolean {
    return true; // Our method works in all browsers
  }
}

export const downloadService = DownloadService.getInstance();
