import React, { useState } from 'react';
import { AiOutlineDownload } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { downloadService, DownloadInfo, DownloadProgress } from '../../services/download';

interface DownloadButtonProps {
  downloadInfo: DownloadInfo;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  downloadInfo,
  className = '',
  size = 'md',
  variant = 'primary'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-primary hover:bg-blue-600 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white'
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setProgress({
      progress: 0,
      status: 'idle',
      message: 'Preparing download...'
    });

    try {
      await downloadService.downloadMovie(downloadInfo, undefined, (progressUpdate) => {
        setProgress(progressUpdate);

        if (progressUpdate.status === 'completed') {
          if (progressUpdate.message.includes('page') || progressUpdate.message.includes('interface')) {
            toast.info('Direct links unavailable. Opening fallback download page...');
          } else {
            toast.success('Download started! Check your downloads folder.');
          }
        }
      });
    } catch (error) {
      console.error('Download failed, triggering fallback:', error);
      // Force fallback on error
      const tmdbIdFallback = (downloadInfo as any).tmdbId || (downloadInfo.sources[0].match(/\/(\d+)/)?.[1] || 0);
      const fallbackUrl = `https://vidsrc.me/embed/${(downloadInfo as any).imdbId || tmdbIdFallback}`;
      window.open(fallbackUrl, '_blank');
      toast.info('Triggered fallback download interface.');
    } finally {
      // Keep downloading state for a bit to show completion
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(null);
      }, 3000);
    }
  };

  const handleAlternativeDownload = () => {
    const tmdbIdFallback = (downloadInfo as any).tmdbId || (downloadInfo.sources[0].match(/\/(\d+)/)?.[1] || 0);
    const fallbackUrl = `https://vidsrc.me/embed/${(downloadInfo as any).imdbId || tmdbIdFallback}`;
    window.open(fallbackUrl, '_blank');
    toast.info('Opening fallback download player...');
  };

  return (
    <div className="relative">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`
          flex items-center gap-2 rounded-full font-medium transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
      >
        <AiOutlineDownload
          className={`${isDownloading ? 'animate-bounce' : ''}`}
          size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
        />
        <span className="whitespace-nowrap">{isDownloading ? 'Downloading...' : 'Download'}</span>
      </button>

      {/* Progress indicator */}
      {isDownloading && progress && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-md p-3 text-white text-sm z-50 min-w-[200px] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-[10px] uppercase tracking-wider text-gray-400">Status</span>
            <span className="text-primary font-bold">{Math.round(progress.progress)}%</span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${progress.status === 'error' ? 'bg-red-500' : 'bg-primary'}`}
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-gray-200 mb-3 leading-tight leading-relaxed">{progress.message}</p>

          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <button
              onClick={(e) => { e.stopPropagation(); handleAlternativeDownload(); }}
              className="text-[10px] text-primary hover:text-white transition bg-primary/10 hover:bg-primary px-2 py-1.5 rounded flex items-center justify-center gap-1 font-bold"
            >
              🚀 CAN'T WAIT? DOWNLOAD REGARDLESS
            </button>
            <p className="text-[9px] text-gray-500 text-center italic">
              Uses fallback server if direct links fail
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadButton;
