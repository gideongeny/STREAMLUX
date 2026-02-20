import React, { useState } from 'react';
import { AiOutlineDownload, AiOutlineLink, AiOutlineInfoCircle } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { downloadService, DownloadInfo, DownloadProgress } from '../../services/download';

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

  const handleDirectDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setProgress({
      progress: 0,
      status: 'idle',
      message: 'Preparing direct download...'
    });

    try {
      await downloadService.downloadMovie(downloadInfo, (progressUpdate) => {
        setProgress(progressUpdate);
        
        if (progressUpdate.status === 'completed') {
          if (progressUpdate.message.includes('page')) {
            toast.info('Direct download not available. Download page opened!');
          } else {
            toast.success('Download started! File is being saved to your device.');
          }
        } else if (progressUpdate.status === 'error') {
          toast.error(progressUpdate.message);
        }
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again or use alternative method.');
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(null);
      }, 2000);
    }
  };

  const handleAlternativeDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setProgress({
      progress: 0,
      status: 'downloading',
      message: 'Opening video viewer...'
    });

    try {
      // Use the new download service method
      await downloadService.downloadMovie(downloadInfo, (progressUpdate) => {
        setProgress(progressUpdate);
        
        if (progressUpdate.status === 'completed') {
          toast.success('Video viewer opened successfully!');
        } else if (progressUpdate.status === 'error') {
          toast.error(progressUpdate.message);
        }
      });
    } catch (error) {
      console.error('Alternative download failed:', error);
      toast.error('Failed to open video viewer. Please try again.');
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  };

  const handleCreateDownloadLinks = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setProgress({
      progress: 0,
      status: 'downloading',
      message: 'Creating download page...'
    });

    try {
      // Use the new download service method
      await downloadService.downloadMovie(downloadInfo, (progressUpdate) => {
        setProgress(progressUpdate);
        
        if (progressUpdate.status === 'completed') {
          toast.success('Download page created successfully!');
        } else if (progressUpdate.status === 'error') {
          toast.error(progressUpdate.message);
        }
      });
    } catch (error) {
      console.error('Failed to create download page:', error);
      toast.error('Failed to create download page. Please try again.');
    } finally {
      setIsDownloading(false);
      setProgress(null);
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
        {/* Primary Download Button - Direct Download like MovieBox */}
        <button
          onClick={handleDirectDownload}
          disabled={isDownloading || !isDownloadSupported}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-3 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AiOutlineDownload size={18} />
          {isDownloading 
            ? (progress?.message || 'Downloading...') 
            : `Download ${downloadInfo.mediaType === 'tv' ? 'Episode' : 'Movie'} (Direct to Device)`}
        </button>

        {/* Alternative Download Button */}
        <button
          onClick={handleAlternativeDownload}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AiOutlineLink size={18} />
          {isDownloading ? 'Processing...' : 'Try Alternative Method'}
        </button>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-center gap-2 text-primary hover:text-blue-300 px-4 py-2 rounded-md font-medium transition-all duration-200"
        >
          <AiOutlineInfoCircle size={16} />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-3 pt-3 border-t border-gray-600">
            <button
              onClick={handleCreateDownloadLinks}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <AiOutlineDownload size={16} />
              Open External Download Page
            </button>

            <div className="text-xs text-gray-400 space-y-1">
              <p>• <strong>Direct Download:</strong> Downloads video file directly to your PC (like MovieBox)</p>
              <p>• <strong>Alternative Method:</strong> Tries different download approaches if direct fails</p>
              <p>• <strong>External Page:</strong> Opens download page with all available sources</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {isDownloading && progress && (
        <div className="mt-4 p-3 bg-gray-800 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Progress</span>
            <span className="text-sm text-primary">{Math.round(progress.progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-300">{progress.message}</p>
        </div>
      )}

      {/* Download Info */}
      <div className="mt-4 text-xs text-gray-400">
        <p>Title: {downloadInfo.title}</p>
        <p>Type: {downloadInfo.mediaType === 'movie' ? 'Movie' : `TV Show - S${downloadInfo.seasonId}E${downloadInfo.episodeId}`}</p>
        {downloadInfo.episodeName && <p>Episode: {downloadInfo.episodeName}</p>}
        <p>Available Sources: {downloadInfo.sources.length}</p>
      </div>
    </div>
  );
};

export default DownloadOptions;
