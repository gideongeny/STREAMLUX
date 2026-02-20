import React, { useState } from 'react';
import { AiOutlineDownload } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { DownloadInfo } from '../../services/download';
import { useDownloadManager } from '../../contexts/DownloadManagerContext';

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
      // Sources are string[] (URLs)
      let foundUrl = sources.find((s: string) => s.toLowerCase().indexOf(".mp4") !== -1);
      if (!foundUrl && sources.length > 0) foundUrl = sources[0];

      if (!foundUrl) {
        const queryTerm = encodeURIComponent(downloadInfo.title);
        performOpen("https://www.fzmovies.net/search.php?searchquery=" + queryTerm + "&searchby=title&Search=Search");
        setIsStarting(false);
        return;
      }

      const fileName = label.replace(/[^a-z0-9\s\-]/gi, "").trim() + ".mp4";
      const forcedDownloadUrl = getDownloadUrl(foundUrl, fileName);

      const downloadLink = document.createElement("a");
      downloadLink.href = forcedDownloadUrl;
      downloadLink.target = "_blank";
      downloadLink.setAttribute("download", fileName);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success("Download started!");
      if (foundUrl.indexOf("http") === 0) {
        addDownload(foundUrl, fileName);
      }
    } catch (err) {
      toast.error("Error starting download");
    } finally {
      setTimeout(() => setIsStarting(false), 1000);
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
        className="w-full bg-primary text-black font-bold p-3 rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isStarting ? "One moment..." : "Download to Device"}
      </button>
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
