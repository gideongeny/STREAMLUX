import React, { useState } from 'react';
import { AiOutlineDownload, AiOutlineInfoCircle, AiOutlineClose, AiOutlineCheckCircle } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { downloadService, DownloadInfo, DownloadProgress } from '../../services/download';
import { resolverService, ResolvedSource } from '../../services/resolver';
import { useAppDispatch } from '../../store/hooks';
import { addDownload, updateDownloadProgress } from '../../store/slice/downloadSlice';

interface DownloadOptionsProps {
  downloadInfo: DownloadInfo;
  className?: string;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({
  downloadInfo,
  className = ''
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [availableSources, setAvailableSources] = useState<ResolvedSource[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedManualUrl, setResolvedManualUrl] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  const handleOpenQualityModal = async () => {
    setShowQualityModal(true);
    setIsResolving(true);
    try {
      const sources = await resolverService.resolveSources(
        downloadInfo.mediaType,
        downloadInfo.tmdbId,
        downloadInfo.seasonId,
        downloadInfo.episodeId
      );
      setAvailableSources(sources);
    } catch (error) {
      toast.error('Failed to resolve download sources.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleSelectSource = async (source: ResolvedSource) => {
    setShowQualityModal(false);
    setResolvedManualUrl(null);
    if (isDownloading) return;

    setIsDownloading(true);
    setProgress({
      progress: 0,
      status: 'idle',
      message: `Preparing ${source.quality} download...`
    });

    const downloadId = downloadService.generateDownloadId(downloadInfo);

    dispatch(addDownload({
      id: downloadId,
      poster_path: downloadInfo.posterPath || '',
      title: downloadInfo.title,
      media_type: downloadInfo.mediaType,
      vote_average: 0,
      downloadDate: Date.now(),
      progress: 0,
      status: "downloading",
      size: source.quality === '1080p' ? '1.2 GB' : source.quality === '720p' ? '700 MB' : '400 MB',
      overview: downloadInfo.overview || '',
      genre_ids: [],
      original_language: 'en',
      backdrop_path: downloadInfo.posterPath || '',
      popularity: 0,
      vote_count: 0
    }));

    try {
      await downloadService.downloadMovie(downloadInfo, source, (progressUpdate) => {
        setProgress(progressUpdate);

        dispatch(updateDownloadProgress({
          id: downloadId,
          progress: progressUpdate.progress,
          speed: progressUpdate.speed,
          eta: progressUpdate.eta
        }));

        if (progressUpdate.status === 'completed') {
          toast.success(`${downloadInfo.title} (${source.quality}) download started!`);
        } else if (progressUpdate.status === 'error') {
          if (progressUpdate.message === 'CORS_RESTRICTION') {
            const resolvedUrl = (progressUpdate as any).resolvedUrl;
            setResolvedManualUrl(resolvedUrl);
            setShowQualityModal(true);

            // Try to auto-trigger the native download
            // Note: browsers might block this if too much time has passed
            const link = document.createElement('a');
            link.href = resolvedUrl;
            link.download = `${downloadInfo.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.info("Browser download triggered.");
          } else {
            toast.error(progressUpdate.message);
          }
        }
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(null);
      }, 3000);
    }
  };

  const isDownloadSupported = downloadService.isDownloadSupported();

  return (
    <div className={`bg-dark-lighten rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <AiOutlineDownload className="text-primary" size={20} />
        <h3 className="text-lg font-medium text-white">Download Options</h3>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleOpenQualityModal}
          disabled={isDownloading || !isDownloadSupported}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-3 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          <AiOutlineDownload size={18} />
          {isDownloading
            ? (progress?.message || 'Downloading...')
            : `Download ${downloadInfo.mediaType === 'tv' ? 'Episode' : 'Movie'}`}
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-center gap-2 text-primary hover:text-blue-300 px-4 py-1 rounded-md font-medium transition-all duration-200 text-sm"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Info
        </button>

        {showAdvanced && (
          <div className="text-xs text-gray-400 space-y-2 pt-2 border-t border-white/5">
            <p>• <strong>Smart Resolution:</strong> Choose quality to optimize data/storage.</p>
            <p>• <strong>Native Manager:</strong> Files save directly to your device gallery when possible.</p>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {isDownloading && progress && (
        <div className="mt-4 p-3 bg-white/5 rounded-md border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Progress</span>
            <span className="text-sm text-primary">{Math.round(progress.progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{progress.message}</p>
        </div>
      )}

      {/* Quality Selection Modal */}
      {showQualityModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">Select Quality</h2>
                <p className="text-gray-400 text-xs mt-1 truncate max-w-[280px]">{downloadInfo.title}</p>
              </div>
              <button
                onClick={() => setShowQualityModal(false)}
                className="p-2 hover:bg-white/5 rounded-full transition"
              >
                <AiOutlineClose size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {isResolving ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-400 text-sm">Searching for best links...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {availableSources.map((source, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSource(source)}
                      className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 rounded-xl transition duration-300 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${source.quality === '1080p' ? 'bg-green-500/10 text-green-500' :
                          source.quality === '720p' ? 'bg-primary/10 text-primary' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                          <AiOutlineDownload size={20} />
                        </div>
                        <div>
                          <p className="text-white font-semibold group-hover:text-primary transition">{source.quality} {source.quality === '1080p' && 'Full HD'}</p>
                          <p className="text-gray-400 text-[10px] uppercase tracking-widest">{source.name} • {source.speed}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">
                          {source.quality === '1080p' ? '1.2 GB' : source.quality === '720p' ? '700 MB' : '400 MB'}
                        </p>
                        <p className="text-primary text-[10px] opacity-0 group-hover:opacity-100 transition">SMART DOWNLOAD</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isResolving && availableSources.length === 0 && (
                <div className="py-10 text-center">
                  <AiOutlineInfoCircle size={40} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">No direct quality links found.</p>
                  <button
                    onClick={() => handleSelectSource({ name: 'External Mirror', url: downloadInfo.sources[0], quality: 'Auto', speed: 'medium', status: 'active', type: 'embed', priority: 999 })}
                    className="mt-4 text-primary underline text-sm"
                  >
                    Try generic mirror instead
                  </button>
                </div>
              )}

              {resolvedManualUrl && (
                <div className="mt-8 pt-6 border-t border-white/5 animate-slideUp">
                  <div className="p-5 bg-green-500/10 rounded-2xl border border-green-500/20 text-center">
                    <h4 className="text-green-500 font-bold text-lg mb-2">Direct Link Ready!</h4>
                    <p className="text-gray-400 text-xs mb-4">Your download should have started. If not, click the button below to save directly to your Chrome downloads.</p>
                    <a
                      href={resolvedManualUrl}
                      download={`${downloadInfo.title.replace(/[^a-z0-9]/gi, '_')}.mp4`}
                      className="inline-block w-full py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl transition shadow-lg shadow-green-500/20"
                      onClick={() => {
                        setResolvedManualUrl(null);
                        setShowQualityModal(false);
                        toast.success("Download initiated!");
                      }}
                    >
                      DOWNLOAD TO DEVICE
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <AiOutlineCheckCircle size={28} className="text-primary mt-1 shrink-0" />
                  <div>
                    <h4 className="text-primary font-bold text-sm">One-Click Device Download</h4>
                    <p className="text-gray-400 text-[10px] mt-1 italic">Files save directly to your downloads or gallery. No external pages, no redirects, no mirrors.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadOptions;
