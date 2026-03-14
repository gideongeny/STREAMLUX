import React, { useState } from 'react';
import { AiOutlineDownload } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { DownloadInfo } from '../../services/download';
import { useDownloadManager } from '../../contexts/DownloadManagerContext';
import { offlineDownloadService } from '../../services/offlineDownload';
import { Capacitor } from '@capacitor/core';
import { MdOutlineLibraryAdd } from 'react-icons/md';

import { getDownloadUrl } from '../../services/resolver';

interface EliteDownloadProps {
  downloadInfo: DownloadInfo;
  className?: string;
}

const EliteDownload: React.FC<EliteDownloadProps> = ({ downloadInfo, className = "" }) => {
  const { addDownload } = useDownloadManager();
  const [isStarting, setIsStarting] = useState(false);

  const label = downloadInfo.mediaType === "tv"
    ? downloadInfo.title + " S" + (downloadInfo.seasonId || 1) + "E" + (downloadInfo.episodeId || 1)
    : downloadInfo.title;

  const performOpen = (linkUrl: string) => {
    const hidden = document.createElement("a");
    hidden.href = linkUrl;
    hidden.target = "_blank";
    document.body.appendChild(hidden);
    hidden.click();
    document.body.removeChild(hidden);
  };

  const handleDownload = async () => {
    setIsStarting(true);
    try {
      const sources = downloadInfo.sources || [];
      const foundUrl = sources[0] || "";

      if (!foundUrl) {
        const queryTerm = encodeURIComponent(downloadInfo.title);
        performOpen("https://www.fzmovies.net/search.php?searchquery=" + queryTerm + "&searchby=title&Search=Search");
        return;
      }

      toast.info("Preparing Elite capture...");
      await offlineDownloadService.downloadSource(
        downloadInfo.title,
        foundUrl,
        downloadInfo.mediaType,
        downloadInfo.seasonId,
        downloadInfo.episodeId
      );
      
      toast.success("Download link captured!");
    } catch (err) {
      toast.error("Error starting download");
    } finally {
      setTimeout(() => setIsStarting(false), 1000);
    }
  };

  const handleOfflineSync = async () => {
    setIsStarting(true);
    try {
      const sources = downloadInfo.sources || [];
      const foundUrl = sources.find((s: string) => s.toLowerCase().indexOf(".mp4") !== -1) || sources[0];

      if (!foundUrl) {
        toast.error("No valid syncable source found");
        return;
      }

      const safeTitle = downloadInfo.title.replace(/\s+/g, '-').toLowerCase();
      const itemId = `${safeTitle}-${Date.now()}`;

      await offlineDownloadService.addToQueue({
        id: itemId,
        title: label,
        type: downloadInfo.mediaType as 'movie' | 'tv',
        thumbnail: downloadInfo.posterPath || "https://image.tmdb.org/t/p/w200" + downloadInfo.posterPath,
        url: foundUrl,
        quality: '1080p',
        size: 500 * 1024 * 1024, // Assuming average size 500MB if unknown
        seasonNumber: downloadInfo.seasonId,
        episodeNumber: downloadInfo.episodeId
      });

      toast.success("Added to Offline Library Queue!");
    } catch (err: any) {
      toast.error(err?.message || "Sync failed");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className={"bg-dark rounded-2xl p-5 border border-white/5 " + className}>
      <div className="flex items-center gap-2 mb-4">
        <AiOutlineDownload className="text-primary" size={20} />
        <span className="text-white font-bold text-sm">Download Options</span>
      </div>
      <p className="text-[10px] text-gray-500 mb-4">{label}</p>
      <button
        onClick={handleDownload}
        disabled={isStarting}
        className="w-full bg-primary text-black font-bold p-3 rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <AiOutlineDownload size={18} />
        {isStarting ? "One moment..." : "Download to Device"}
      </button>

      {Capacitor.isNativePlatform() && (
        <button
          onClick={handleOfflineSync}
          disabled={isStarting}
          className="w-full mt-3 bg-white/10 text-white font-bold p-3 rounded-xl text-sm transition-all hover:bg-white/20 disabled:opacity-50 flex items-center justify-center gap-2 border border-white/5"
        >
          <MdOutlineLibraryAdd size={18} className="text-primary" />
          Sync to Offline Library
        </button>
      )}
      <button
        onClick={() => {
          const qStr = encodeURIComponent(downloadInfo.title);
          performOpen("https://www.fzmovies.net/search.php?searchquery=" + qStr + "&searchby=title&Search=Search");
        }}
        className="w-full text-[10px] text-gray-500 mt-4 hover:text-white transition-colors"
      >
        Open on FzMovies
      </button>
    </div>
  );
};

export default EliteDownload;
