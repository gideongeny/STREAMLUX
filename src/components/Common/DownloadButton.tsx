import React, { FC, useState } from 'react';
import { offlineDownloadService } from '../../services/offlineDownload';
import { downloadService, DownloadInfo } from '../../services/download';
import { Capacitor } from '@capacitor/core';

interface DownloadButtonProps {
  // Option 1: Direct Props
  itemId?: string;
  title?: string;
  type?: 'movie' | 'tv';
  thumbnail?: string;
  url?: string;
  fileSize?: number; // Renamed to avoid conflict with visual size
  seasonNumber?: number;
  episodeNumber?: number;

  // Option 2: DownloadObject Helper
  downloadInfo?: DownloadInfo;

  // Visual Props
  className?: string;
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg'; // Visual size
}

const DownloadButton: FC<DownloadButtonProps> = ({
  itemId,
  title,
  type,
  thumbnail,
  url,
  fileSize = 500000000, // Default 500MB
  seasonNumber,
  episodeNumber,
  downloadInfo,
  className = '',
  variant = 'solid',
  size = 'md',
}) => {
  const [quality, setQuality] = useState<'480p' | '720p' | '1080p'>('720p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Resolve values from direct props or downloadInfo
  const finalItemId = itemId || (downloadInfo ? downloadService.generateDownloadId(downloadInfo) : '');
  const finalTitle = title || downloadInfo?.title || '';
  const finalType = type || downloadInfo?.mediaType || 'movie';
  const finalThumbnail = thumbnail || downloadInfo?.posterPath || '';
  // For URL, if downloadInfo is provided, we default to the first source or empty (resolution happens elsewhere normally, but for quick download we pick one)
  // Realistically, direct download requires a resolved URL. DownloadOptions handles resolution.
  // This button implies a direct action. We will use the first source as a placeholder or direct link.
  const finalUrl = url || (downloadInfo?.sources && downloadInfo.sources.length > 0 ? downloadInfo.sources[0] : '');

  const finalSeason = seasonNumber || downloadInfo?.seasonId;
  const finalEpisode = episodeNumber || downloadInfo?.episodeId;

  const isDownloaded = offlineDownloadService.isDownloaded(finalItemId);

  if (!Capacitor.isNativePlatform()) {
    return null; // Only show on native platforms
  }

  const handleDownload = async () => {
    if (!finalUrl || !finalItemId) {
      alert('Invalid download source');
      return;
    }

    try {
      await offlineDownloadService.addToQueue({
        id: finalItemId,
        title: finalTitle,
        type: finalType,
        thumbnail: finalThumbnail,
        url: finalUrl,
        quality,
        size: fileSize,
        seasonNumber: finalSeason,
        episodeNumber: finalEpisode,
      });

      window.alert(`${finalTitle} added to download queue!`);
    } catch (error) {
      console.error('Download error:', error);
      window.alert('Failed to start download. Please try again.');
    }
  };

  const handleRemoveDownload = async () => {
    if (window.confirm(`Remove ${finalTitle} from downloads?`)) {
      await offlineDownloadService.cancelDownload(finalItemId);
    }
  };

  // Visual styling based on size
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  if (isDownloaded) {
    return (
      <button
        onClick={handleRemoveDownload}
        className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors ${sizeClasses[size]} ${className}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Downloaded
      </button>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setShowQualityMenu(!showQualityMenu)}
        className={`flex items-center justify-center gap-2 ${variant === 'outline'
          ? 'border border-primary text-primary hover:bg-primary/10'
          : 'bg-primary hover:bg-primary-dark text-white'
          } rounded-lg font-semibold transition-colors w-full ${sizeClasses[size]}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </button>

      {showQualityMenu && (
        <div className="absolute top-full mt-2 left-0 bg-dark-lighten rounded-lg shadow-xl border border-gray-700 overflow-hidden z-20 min-w-[150px]">
          <button
            onClick={() => { setQuality('480p'); setShowQualityMenu(false); handleDownload(); }}
            className="block w-full px-4 py-3 text-left hover:bg-dark-lighten-2 transition-colors text-white"
          >
            <div className="font-semibold text-sm">480p</div>
            <div className="text-xs text-gray-400">~{Math.round(fileSize * 0.3 / 1024 / 1024)}MB</div>
          </button>
          <button
            onClick={() => { setQuality('720p'); setShowQualityMenu(false); handleDownload(); }}
            className="block w-full px-4 py-3 text-left hover:bg-dark-lighten-2 transition-colors text-white border-t border-gray-700"
          >
            <div className="font-semibold text-sm">720p</div>
            <div className="text-xs text-gray-400">~{Math.round(fileSize * 0.6 / 1024 / 1024)}MB</div>
          </button>
          <button
            onClick={() => { setQuality('1080p'); setShowQualityMenu(false); handleDownload(); }}
            className="block w-full px-4 py-3 text-left hover:bg-dark-lighten-2 transition-colors text-white border-t border-gray-700"
          >
            <div className="font-semibold text-sm">1080p</div>
            <div className="text-xs text-gray-400">~{Math.round(fileSize / 1024 / 1024)}MB</div>
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadButton;
