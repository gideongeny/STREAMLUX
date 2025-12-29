import { DetailMovie, DetailTV, Episode } from "../shared/types";
import { EMBED_ALTERNATIVES } from "../shared/constants";
import { resolverService, ResolvedSource } from "./resolver";

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
  speed?: string;
  eta?: string;
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
    const imdb = imdbId || tmdbId;

    if (mediaType === "movie") {
      return [
        `${EMBED_ALTERNATIVES.VIDSRC}/${id}`,
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
        `${EMBED_ALTERNATIVES.AFRIKAN}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD}/movie/${id}`,
        `${EMBED_ALTERNATIVES.BOLLYWOOD}/movie/${id}`,
        `${EMBED_ALTERNATIVES.ASIAN}/movie/${id}`,
        `${EMBED_ALTERNATIVES.LATINO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.ARABIC}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AFRIKANFLIX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOODPLUS}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AFRICANMOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.KENYANFLIX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NIGERIANFLIX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.SHOWMAX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.IROKO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.BONGO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.KWESE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.CINEMAHOLIC}/movie/${id}`,
        `${EMBED_ALTERNATIVES.MOVIEFREAK}/movie/${id}`,
        `${EMBED_ALTERNATIVES.WATCHSERIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.PUTLOCKER}/movie/${id}`,
        `${EMBED_ALTERNATIVES.SOLARMOVIE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FMOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NETFLIX}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AMAZON}/movie/${id}`,
        `${EMBED_ALTERNATIVES.DISNEY}/movie/${id}`,
        `${EMBED_ALTERNATIVES.HBO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.HULU}/movie/${id}`,
        `${EMBED_ALTERNATIVES.APPLE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.YOUTUBE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.VIMEO}/movie/${id}`,
        `${EMBED_ALTERNATIVES.DAILYMOTION}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_WATCH}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_EMBED}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_PLAYER}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT1}/embed/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT2}/watch/movie/${id}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT3}/movie/${id}`,
        `${EMBED_ALTERNATIVES.KISSKH_EMBED}/drama/${id}`,
        `${EMBED_ALTERNATIVES.KISSKH}/drama/${id}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME_EMBED}/anime/${id}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME}/anime/${id}`,
        `${EMBED_ALTERNATIVES.AILOK_EMBED}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AILOK}/movie/${id}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV_EMBED}/movie/${id}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD_TV}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AFRICAN_MOVIES_ONLINE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD_MOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.AFRIKAN_MOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.DRAMACOOL}/movie/${id}`,
        `${EMBED_ALTERNATIVES.KISSASIAN}/movie/${id}`,
        `${EMBED_ALTERNATIVES.ASIANSERIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.MYASIANTV}/movie/${id}`,
        `${EMBED_ALTERNATIVES.VIKI}/movie/${id}`,
        `${EMBED_ALTERNATIVES.CUEVANA}/movie/${id}`,
        `${EMBED_ALTERNATIVES.PELISPLUS}/movie/${id}`,
        `${EMBED_ALTERNATIVES.REPELIS}/movie/${id}`,
        `${EMBED_ALTERNATIVES.LATINOMOVIES}/movie/${id}`,
        `${EMBED_ALTERNATIVES.SHAHID}/movie/${id}`,
        `${EMBED_ALTERNATIVES.OSN}/movie/${id}`,
        `${EMBED_ALTERNATIVES.SUPEREMBED}/movie/${id}`,
        `${EMBED_ALTERNATIVES.EMBEDMOVIE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.STREAMTAPE}/movie/${id}`,
        `${EMBED_ALTERNATIVES.MIXDROP}/movie/${id}`,
        `${EMBED_ALTERNATIVES.UPCLOUD}/movie/${id}`,
        `${EMBED_ALTERNATIVES.EMBEDSB}/movie/${id}`,
        `${EMBED_ALTERNATIVES.STREAMWISH}/movie/${id}`,
        `${EMBED_ALTERNATIVES.FILEMOON}/movie/${id}`,
        `${EMBED_ALTERNATIVES.DOODSTREAM}/movie/${id}`,
        `${EMBED_ALTERNATIVES.ZEE5}/movie/${id}`,
        `${EMBED_ALTERNATIVES.HOTSTAR}/movie/${id}`,
        `${EMBED_ALTERNATIVES.VIU}/movie/${id}`,
        `${EMBED_ALTERNATIVES.IWANTTFC}/movie/${id}`,
        `${EMBED_ALTERNATIVES.ABS_CBN}/movie/${id}`,
      ];
    } else {
      return [
        `${EMBED_ALTERNATIVES.VIDSRC}/${id}/${seasonId}-${episodeId}`,
        `https://vidsrc.me/embed/${imdb}/${seasonId}-${episodeId}`,
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
        `${EMBED_ALTERNATIVES.AFRIKAN}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.BOLLYWOOD}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ASIAN}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.LATINO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ARABIC}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRIKANFLIX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOODPLUS}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRICANMOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KENYANFLIX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NIGERIANFLIX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SHOWMAX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.IROKO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.BONGO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KWESE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.CINEMAHOLIC}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MOVIEFREAK}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.WATCHSERIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.PUTLOCKER}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SOLARMOVIE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FMOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NETFLIX}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AMAZON}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DISNEY}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.HBO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.HULU}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.APPLE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.YOUTUBE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIMEO}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DAILYMOTION}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_WATCH}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_EMBED}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_PLAYER}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT1}/embed/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT2}/watch/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FZMOVIES_ALT3}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KISSKH_EMBED}/drama/${id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.KISSKH}/drama/${id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME_EMBED}/anime/${id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.UGC_ANIME}/anime/${id}/episode/${episodeId}`,
        `${EMBED_ALTERNATIVES.AILOK_EMBED}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AILOK}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV_EMBED}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SZ_GOOGOTV}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD_TV}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRICAN_MOVIES_ONLINE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.NOLLYWOOD_MOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.AFRIKAN_MOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DRAMACOOL}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.KISSASIAN}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ASIANSERIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MYASIANTV}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIKI}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.CUEVANA}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.PELISPLUS}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.REPELIS}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.LATINOMOVIES}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SHAHID}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.OSN}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.SUPEREMBED}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.EMBEDMOVIE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.STREAMTAPE}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.MIXDROP}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.UPCLOUD}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.EMBEDSB}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.STREAMWISH}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.FILEMOON}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.DOODSTREAM}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ZEE5}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.HOTSTAR}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.VIU}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.IWANTTFC}/tv/${id}/${seasonId}/${episodeId}`,
        `${EMBED_ALTERNATIVES.ABS_CBN}/tv/${id}/${seasonId}/${episodeId}`,
      ];
    }
  }

  async downloadMovie(
    downloadInfo: DownloadInfo,
    selectedSource?: ResolvedSource,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const downloadId = this.generateDownloadId(downloadInfo);

    const progress: DownloadProgress = {
      progress: 0,
      status: "idle",
      message: selectedSource ? `Starting ${selectedSource.quality} download...` : "Resolving direct links..."
    };

    this.downloads.set(downloadId, progress);
    onProgress?.(progress);

    try {
      let activeSource = selectedSource;

      if (!activeSource) {
        progress.progress = 10;
        onProgress?.(progress);

        const tmdbId = (downloadInfo as any).tmdbId || (downloadInfo.sources[0].match(/\/(\d+)/)?.[1] || 0);

        const resolvedSources = await resolverService.resolveSources(
          downloadInfo.mediaType,
          Number(tmdbId),
          downloadInfo.seasonId,
          downloadInfo.episodeId
        );

        activeSource = resolvedSources.find(s => s.type === 'direct') || resolvedSources[0];
      }

      if (activeSource) {
        progress.message = `Downloading from ${activeSource.name}...`;
        progress.progress = 30;
        onProgress?.(progress);

        const filename = this.generateFilename(downloadInfo);
        const success = await this.startDirectDownload(activeSource.url, filename, (p, speed, eta) => {
          progress.progress = 30 + (p * 0.6);
          progress.speed = speed;
          progress.eta = eta;
          onProgress?.(progress);
        });

        if (success) {
          progress.status = "completed";
          progress.progress = 100;
          progress.message = "Download complete!";
          onProgress?.(progress);
          return;
        }
      }

      progress.message = "Preparing secure download interface...";
      progress.progress = 60;
      onProgress?.(progress);

      const tmdbIdFallback = (downloadInfo as any).tmdbId || (downloadInfo.sources[0].match(/\/(\d+)/)?.[1] || 0);
      const downloadPage = this.createSmartDownloadPage(downloadInfo, Number(tmdbIdFallback));
      const newTab = window.open(downloadPage, '_blank');

      if (newTab) {
        progress.status = "completed";
        progress.progress = 100;
        progress.message = "Download interface opened!";
        onProgress?.(progress);
      } else {
        throw new Error("Popup blocked. Please allow popups to download.");
      }

    } catch (error) {
      progress.status = "error";
      progress.message = `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onProgress?.(progress);
    }
  }

  private async startDirectDownload(
    url: string,
    filename: string,
    onUpdate?: (p: number, speed?: string, eta?: string) => void
  ): Promise<boolean> {
    try {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const reader = response.body?.getReader();
          const contentLength = +response.headers.get('Content-Length')! || 0;
          let receivedLength = 0;
          const chunks = [];

          const startTime = Date.now();
          let lastUpdate = startTime;

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
              receivedLength += value.length;

              const now = Date.now();
              if (now - lastUpdate > 1000) {
                const duration = (now - startTime) / 1000;
                const currentSpeed = duration > 0 ? (receivedLength / 1024 / 1024) / duration : 0;
                const remaining = contentLength ? contentLength - receivedLength : 0;
                const etaSeconds = currentSpeed > 0 ? (remaining / 1024 / 1024) / currentSpeed : 0;

                const speedStr = currentSpeed.toFixed(1) + " MB/s";
                const etaStr = etaSeconds > 60
                  ? `${Math.floor(etaSeconds / 60)}m ${Math.round(etaSeconds % 60)}s`
                  : `${Math.round(etaSeconds)}s`;

                onUpdate?.(contentLength ? receivedLength / contentLength : 0.5, speedStr, etaStr);
                lastUpdate = now;
              }
            }
            const blob = new Blob(chunks);
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            return true;
          }
        }
      } catch (fetchError) {
        console.warn("Fetch blob failed (likely CORS), falling back to simple link", fetchError);
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (e) {
      console.warn("Direct download link trigger failed", e);
      return false;
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

  private createSmartDownloadPage(downloadInfo: DownloadInfo, tmdbId: number): string {
    const sources = downloadInfo.sources;
    const title = downloadInfo.title;
    const filename = this.generateFilename(downloadInfo);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Downloading ${title}...</title>
        <style>
          body { font-family: sans-serif; background: #1a1a1a; color: white; text-align: center; padding: 50px; }
          .btn { background: #3b82f6; color: white; padding: 15px 30px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px; }
          .loader { border: 4px solid #333; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="loader"></div>
        <p>Preparing your download. If it doesn't start, use the links below.</p>
        <div id="links">
          ${sources.map((s, i) => `<a href="${s}" download="${filename}" class="btn">Download Source ${i + 1}</a>`).join('')}
        </div>
        <script>
          window.onload = () => {
            const first = document.querySelector('.btn');
            if(first) first.click();
          }
        </script>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  private getSourceDisplayName(source: string): string {
    if (source.includes('vidsrc.me')) return 'VidSrc';
    if (source.includes('fsapi.xyz')) return 'FSAPI.xyz';
    if (source.includes('curtstream.com')) return 'CurtStream';
    if (source.includes('moviewp.com')) return 'MovieWP';
    if (source.includes('v2.apimdb.net')) return 'APIMDB';
    if (source.includes('vidsrc.pro')) return 'VidSrc Pro';

    try {
      const url = new URL(source);
      return url.hostname.replace('www.', '');
    } catch {
      return 'Video Source';
    }
  }

  public generateDownloadId(downloadInfo: DownloadInfo): string {
    return `${downloadInfo.mediaType}-${downloadInfo.title}-${downloadInfo.seasonId || ""}-${downloadInfo.episodeId || ""}`;
  }

  getDownloadProgress(downloadId: string): DownloadProgress | undefined {
    return this.downloads.get(downloadId);
  }

  clearDownload(downloadId: string): void {
    this.downloads.delete(downloadId);
  }

  isDownloadSupported(): boolean {
    return true;
  }
}

export const downloadService = DownloadService.getInstance();
