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
      await downloadService.downloadMovie(downloadInfo, (progressUpdate) => {
        setProgress(progressUpdate);
        
        if (progressUpdate.status === 'completed') {
          if (progressUpdate.message.includes('page') || progressUpdate.message.includes('interface')) {
            toast.info('Download interface opened! Video will download automatically if possible.');
          } else {
            toast.success('Download started! Check your downloads folder.');
          }
        } else if (progressUpdate.status === 'error') {
          toast.error(progressUpdate.message);
        }
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again or use the download page.');
    } finally {
      // Keep downloading state for a bit to show completion
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
      message: 'Opening download link...'
    });

    try {
      await downloadService.downloadMovie(downloadInfo, (progressUpdate) => {
        setProgress(progressUpdate);
        
        if (progressUpdate.status === 'completed') {
          toast.success('Download page opened successfully!');
        } else if (progressUpdate.status === 'error') {
          toast.error(progressUpdate.message);
        }
      });
    } catch (error) {
      console.error('Alternative download failed:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-md p-3 text-white text-sm z-50 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Download Progress</span>
            <span className="text-primary">{Math.round(progress.progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-300 mb-2">{progress.message}</p>
          
          {progress.status === 'error' && (
            <button
              onClick={handleAlternativeDownload}
              className="text-xs text-primary hover:text-blue-300 underline"
            >
              Try alternative download method
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadButton;
