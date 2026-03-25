// Video URL Extractor Service
// Extracts direct video download URLs from embed sources (like MovieBox.ph)

import axios from "axios";

export interface DirectVideoURL {
  url: string;
  quality: string;
  size?: string;
  format: string;
}

export class VideoExtractorService {
  private static instance: VideoExtractorService;

  static getInstance(): VideoExtractorService {
    if (!VideoExtractorService.instance) {
      VideoExtractorService.instance = new VideoExtractorService();
    }
    return VideoExtractorService.instance;
  }

  /**
   * Extract direct video URL from VidSrc embed
   * VidSrc uses embed URLs, we need to extract from the embed page
   */
  async extractVidSrcURL(
    tmdbId: number,
    mediaType: "movie" | "tv",
    seasonId?: number,
    episodeId?: number
  ): Promise<DirectVideoURL[]> {
    try {
      // VidSrc embed URL
      let embedUrl = "";
      if (mediaType === "movie") {
        embedUrl = `https://vidsrc.me/embed/movie/${tmdbId}`;
      } else {
        embedUrl = `https://vidsrc.me/embed/tv/${tmdbId}/${seasonId}-${episodeId}`;
      }

      // Try to get direct URL from VidSrc's API endpoint
      const apiUrl = mediaType === "movie" 
        ? `https://vidsrc.pro/vidsrc.php?id=${tmdbId}`
        : `https://vidsrc.pro/vidsrc.php?id=${tmdbId}&s=${seasonId}&e=${episodeId}`;

      try {
        const response = await axios.get(apiUrl, {
          headers: {
            Accept: "application/json",
            Referer: "https://vidsrc.me/",
          },
          timeout: 10000,
        });

        if (response.data?.result && response.data.result.length > 0) {
          return response.data.result.map((source: any) => ({
            url: source.url || source.file,
            quality: source.label || source.quality || "auto",
            format: source.type || "mp4",
          }));
        }
      } catch (apiError) {
        console.log("VidSrc API failed, trying HTML extraction");
      }

      // Fallback: try to extract from HTML
      return await this.extractFromVidSrcHTML(embedUrl);
    } catch (error) {
      console.warn("VidSrc extraction failed:", error);
      return [];
    }
  }

  /**
   * Extract video URLs from VidSrc HTML page
   */
  private async extractFromVidSrcHTML(url: string): Promise<DirectVideoURL[]> {
    try {
      const response = await axios.get(url, {
        headers: {
          Accept: "text/html",
        },
        timeout: 10000,
      });

      const html = response.data;
      const videoURLs: DirectVideoURL[] = [];

      // Extract m3u8 URLs (HLS streams)
      const m3u8Regex = /(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/gi;
      const m3u8Matches = html.match(m3u8Regex);
      if (m3u8Matches) {
        m3u8Matches.forEach((url: string) => {
          videoURLs.push({
            url: url,
            quality: "auto",
            format: "m3u8",
          });
        });
      }

      // Extract direct MP4 URLs
      const mp4Regex = /(https?:\/\/[^\s"']+\.mp4[^\s"']*)/gi;
      const mp4Matches = html.match(mp4Regex);
      if (mp4Matches) {
        mp4Matches.forEach((url: string) => {
          videoURLs.push({
            url: url,
            quality: "auto",
            format: "mp4",
          });
        });
      }

      return videoURLs;
    } catch (error) {
      console.warn("HTML extraction failed:", error);
      return [];
    }
  }

  /**
   * Extract direct video URL from 2Embed
   */
  async extract2EmbedURL(
    tmdbId: number,
    mediaType: "movie" | "tv",
    seasonId?: number,
    episodeId?: number
  ): Promise<DirectVideoURL[]> {
    try {
      let embedUrl = "";
      if (mediaType === "movie") {
        embedUrl = `https://www.2embed.to/embed/tmdb/movie?id=${tmdbId}`;
      } else {
        embedUrl = `https://www.2embed.to/embed/tmdb/tv?id=${tmdbId}&s=${seasonId}&e=${episodeId}`;
      }

      const response = await axios.get(embedUrl, {
        headers: {
          Accept: "text/html",
        },
        timeout: 10000,
      });

      const html = response.data;
      const videoURLs: DirectVideoURL[] = [];

      // Extract video sources from iframe src
      const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
      let match;
      while ((match = iframeRegex.exec(html)) !== null) {
        const iframeSrc = match[1];
        if (iframeSrc.includes(".mp4") || iframeSrc.includes(".m3u8")) {
          videoURLs.push({
            url: iframeSrc,
            quality: "auto",
            format: iframeSrc.includes(".m3u8") ? "m3u8" : "mp4",
          });
        }
      }

      // Extract from video tags
      const videoRegex = /<video[^>]+src=["']([^"']+)["']/gi;
      while ((match = videoRegex.exec(html)) !== null) {
        videoURLs.push({
          url: match[1],
          quality: "auto",
          format: "mp4",
        });
      }

      return videoURLs;
    } catch (error) {
      console.warn("2Embed extraction failed:", error);
      return [];
    }
  }

  /**
   * Get direct video URLs from multiple sources
   */
  async getDirectVideoURLs(
    tmdbId: number,
    mediaType: "movie" | "tv",
    seasonId?: number,
    episodeId?: number
  ): Promise<DirectVideoURL[]> {
    const allURLs: DirectVideoURL[] = [];

    // Try VidSrc first (most reliable)
    const vidSrcURLs = await this.extractVidSrcURL(tmdbId, mediaType, seasonId, episodeId);
    allURLs.push(...vidSrcURLs);

    // Try 2Embed as fallback
    if (allURLs.length === 0) {
      const embedURLs = await this.extract2EmbedURL(tmdbId, mediaType, seasonId, episodeId);
      allURLs.push(...embedURLs);
    }

    // Remove duplicates
    const uniqueURLs = allURLs.filter(
      (url, index, self) => index === self.findIndex((u) => u.url === url.url)
    );

    return uniqueURLs;
  }

  /**
   * Download video directly to device (like MovieBox)
   */
  async downloadVideoDirect(
    videoURL: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      const response = await axios.get(videoURL, {
        responseType: "blob",
        timeout: 300000, // 5 minutes timeout
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress?.(percentCompleted);
          }
        },
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: "video/mp4" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Direct download failed:", error);
      throw new Error("Failed to download video. Please try a different source.");
    }
  }

  /**
   * Download video using fetch API (alternative method)
   */
  async downloadVideoWithFetch(
    videoURL: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      const response = await fetch(videoURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (total > 0) {
          const percentCompleted = Math.round((receivedLength * 100) / total);
          onProgress?.(percentCompleted);
        }
      }

      // Combine chunks and trigger download
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Fetch download failed:", error);
      throw new Error("Failed to download video. Please try a different source.");
    }
  }
}

export const videoExtractor = VideoExtractorService.getInstance();

