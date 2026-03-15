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
      progress: 50,
      status: 'downloading',
      message: 'Opening Elite Portal...'
    });

    try {
      downloadService.smartRedirect(downloadInfo);
      toast.success('Download portal opened successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Could not open download portal.');
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(null);
      }, 2000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`
          flex items-center gap-2 rounded-full font-black uppercase tracking-widest transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${isDownloading ? 'ring-2 ring-primary/50' : ''}
          ${className}
        `}
      >
        <AiOutlineDownload
          className={`${isDownloading ? 'animate-bounce' : ''}`}
          size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
        />
        <span className="whitespace-nowrap">
          {isDownloading ? 'Opening...' : 'Download'}
        </span>
      </button>
    </div>
  );
};

export default DownloadButton;
