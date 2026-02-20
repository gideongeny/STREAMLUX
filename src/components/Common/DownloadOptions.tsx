import React, { useState, useRef } from 'react';
import { AiOutlineDownload, AiOutlineLink, AiOutlineClose } from 'react-icons/ai';
import { FaLayerGroup, FaCheckCircle } from 'react-icons/fa';
import { MdMovieFilter } from 'react-icons/md';
import { toast } from 'react-toastify';
import { downloadService, DownloadInfo, DownloadProgress } from '../../services/download';

interface DownloadOptionsProps {
  downloadInfo: DownloadInfo;
  className?: string;
}

interface QueueItem {
  label: string;
  url: string;
  status: 'pending' | 'downloading' | 'done' | 'error';
  progress: number;
}

/**
 * True browser download with progress tracking via fetch + ReadableStream.
 */
async function browserDownload(
  url: string,
  filename: string,
  onProgress: (pct: number) => void
): Promise<void> {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0) {
      onProgress(Math.min(99, Math.round((received / total) * 100)));
    } else {
      // Unknown size — pulse between 20-75%
      onProgress(Math.min(75, 20 + Math.round((received / (received + 1000000)) * 55)));
    }
  }

  const blob = new Blob(chunks);
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objUrl;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(objUrl), 10000);
  onProgress(100);
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({ downloadInfo, className = '' }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const totalSources = downloadInfo.sources?.length ?? 0;
  const mediaLabel = downloadInfo.mediaType === 'movie'
    ? downloadInfo.title
    : `${downloadInfo.title} S${downloadInfo.seasonId}E${downloadInfo.episodeId}${downloadInfo.episodeName ? ` – ${downloadInfo.episodeName}` : ''}`;

  // === TRUE DIRECT DOWNLOAD ===
  const handleDirectDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setIsDone(false);
    setProgress(0);
    setStatusMsg('Looking for best download source...');

    const sources = downloadInfo.sources ?? [];

    // Build candidate URLs
    let candidates: { url: string; quality?: string }[] = sources
      .filter((s: any) => s.url && !s.url.includes('embed') && !s.url.includes('iframe'))
      .map((s: any) => ({ url: s.url, quality: s.quality }));

    if (candidates.length === 0) candidates = sources.map((s: any) => ({ url: s.url }));
    if (candidates.length === 0) {
      // Fallback: open download page
      const fallbackUrl = `https://www.fzmovies.net/search.php?searchquery=${encodeURIComponent(downloadInfo.title)}&searchby=title&Search=Search`;
      window.open(fallbackUrl, '_blank');
      setStatusMsg('No direct sources. Opening download page...');
      setTimeout(() => { setIsDownloading(false); setStatusMsg(''); }, 2000);
      return;
    }

    const best = candidates[0];
    const ext = best.url.match(/\.(mp4|mkv|webm)/i)?.[1] ?? 'mp4';
    const filename = `${mediaLabel.replace(/[^a-z0-9\s\-]/gi, '').trim()}.${ext}`;

    setStatusMsg(`Downloading: ${filename}`);
    try {
      await browserDownload(best.url, filename, (pct) => setProgress(pct));
      setIsDone(true);
      setStatusMsg('Download complete! ✅');
      toast.success('Download complete!');
    } catch (err: any) {
      console.warn('Direct download failed, trying fallback...', err);
      // Fallback: open external download service
      const ytDlUrl = `https://loader.to/api/button/?url=${encodeURIComponent(best.url)}&f=mp4`;
      window.open(ytDlUrl, '_blank');
      setStatusMsg('Browser download blocked. External downloader opened.');
      toast.info('External downloader opened. Paste the video URL there!');
    } finally {
      setTimeout(() => { setIsDownloading(false); setProgress(0); setStatusMsg(''); setIsDone(false); }, 4000);
    }
  };

  // === SERIES BATCH DOWNLOAD (queue all sources as episodes) ===
  const handleBatchDownload = () => {
    const sources = downloadInfo.sources ?? [];
    if (sources.length === 0) {
      toast.info('No sources available for batch download.');
      return;
    }
    const items: QueueItem[] = sources.slice(0, 20).map((s: any, idx: number) => ({
      label: s.name || `Episode ${idx + 1}`,
      url: s.url,
      status: 'pending',
      progress: 0,
    }));
    setQueue(items);
    setShowQueue(true);
    processQueue(items);
  };

  const processQueue = async (items: QueueItem[]) => {
    for (let i = 0; i < items.length; i++) {
      if (!items[i].url.match(/\.(mp4|mkv|webm)/i)) {
        setQueue((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'error', progress: 0 };
          return updated;
        });
        continue;
      }
      setQueue((prev) => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'downloading' };
        return updated;
      });
      try {
        const ext = items[i].url.match(/\.(mp4|mkv|webm)/i)?.[1] ?? 'mp4';
        await browserDownload(items[i].url, `${items[i].label}.${ext}`, (pct) => {
          setQueue((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], progress: pct };
            return updated;
          });
        });
        setQueue((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'done', progress: 100 };
          return updated;
        });
      } catch {
        setQueue((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'error' };
          return updated;
        });
      }
      await new Promise((res) => setTimeout(res, 800));
    }
    toast.success('Batch download complete!');
  };

  const handleFallbackExternal = () => {
    const q = encodeURIComponent(downloadInfo.title);
    window.open(`https://www.fzmovies.net/search.php?searchquery=${q}&searchby=title&Search=Search`, '_blank');
  };

  return (
    <div className={`bg-dark rounded-2xl p-5 border border-white/5 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <AiOutlineDownload className="text-primary" size={22} />
        <h3 className="text-base font-bold text-white">Download</h3>
        {totalSources > 0 && (
          <span className="ml-auto text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {totalSources} source{totalSources !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-4 truncate" title={mediaLabel}>
        🎬 {mediaLabel}
      </p>

      {/* Progress Bar */}
      {isDownloading && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="truncate max-w-[70%]">{statusMsg}</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {isDone && (
            <div className="flex items-center gap-1 mt-2 text-green-400 text-xs">
              <FaCheckCircle size={12} />
              Download complete!
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3">
        {/* Primary: Direct browser download */}
        <button
          onClick={handleDirectDownload}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-black font-bold px-4 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-sm"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              Downloading... {progress}%
            </>
          ) : (
            <>
              <AiOutlineDownload size={18} />
              Download to Device
            </>
          )}
        </button>

        {/* Series batch download */}
        {downloadInfo.mediaType === 'tv' && (
          <button
            onClick={handleBatchDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2.5 rounded-xl transition-all border border-white/10 text-sm"
          >
            <FaLayerGroup size={15} />
            Download Full Season
          </button>
        )}

        {/* External fallback */}
        <button
          onClick={handleFallbackExternal}
          className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-all text-xs"
        >
          <AiOutlineLink size={14} />
          Open External Download Page
        </button>
      </div>

      {/* Batch Download Queue */}
      {showQueue && queue.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Download Queue</h4>
            <button onClick={() => setShowQueue(false)} className="text-gray-500 hover:text-white">
              <AiOutlineClose size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {queue.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="text-xs text-gray-400 w-5 text-right flex-shrink-0">{idx + 1}</div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-white truncate">{item.label}</span>
                    <span className={`text-[10px] ml-2 flex-shrink-0 font-bold ${item.status === 'done' ? 'text-green-400' :
                        item.status === 'error' ? 'text-red-400' :
                          item.status === 'downloading' ? 'text-primary' : 'text-gray-500'
                      }`}>
                      {item.status === 'pending' ? '⏳' : item.status === 'downloading' ? `${item.progress}%` : item.status === 'done' ? '✅' : '❌'}
                    </span>
                  </div>
                  {item.status === 'downloading' && (
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadOptions;
