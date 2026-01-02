import React, { FC, useState } from 'react';
import { offlineDownloadService } from '../../services/offlineDownload';
import { Capacitor } from '@capacitor/core';

interface DownloadButtonProps {
  itemId: string;
  title: string;
  type: 'movie' | 'tv';
  thumbnail: string;
  url: string;
  size?: number;
  seasonNumber?: number;
  episodeNumber?: number;
}

const DownloadButton: FC<DownloadButtonProps> = ({
  itemId,
  title,
  type,
  thumbnail,
  url,
  size = 500000000, // Default 500MB
  seasonNumber,
  episodeNumber,
}) => {
  const [quality, setQuality] = useState<'480p' | '720p' | '1080p'>('720p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const isDownloaded = offlineDownloadService.isDownloaded(itemId);

  if (!Capacitor.isNativePlatform()) {
    return null; // Only show on native platforms
  }

  const handleDownload = async () => {
    try {
      await offlineDownloadService.addToQueue({
        id: itemId,
        title,
        type,
        thumbnail,
        url,
        quality,
        size,
        seasonNumber,
        episodeNumber,
      });

      window.alert(`${title} added to download queue!`);
    } catch (error) {
      console.error('Download error:', error);
      window.alert('Failed to start download. Please try again.');
    }
  };

  const handleRemoveDownload = async () => {
    if (window.confirm(`Remove ${title} from downloads?`)) {
      await offlineDownloadService.cancelDownload(itemId);
    }
  };

  if (isDownloaded) {
    return (
      <button
        onClick={handleRemoveDownload}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Downloaded
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowQualityMenu(!showQualityMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white font-semibold transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download ({quality})
      </button>

      {showQualityMenu && (
        <div className="absolute top-full mt-2 bg-dark-lighten rounded-lg shadow-xl border border-gray-700 overflow-hidden z-10">
          <button
            onClick={() => { setQuality('480p'); setShowQualityMenu(false); handleDownload(); }}
            className="block w-full px-4 py-3 text-left hover:bg-dark-lighten-2 transition-colors text-white"
          >
            <div className="font-semibold">480p</div>
            <div className="text-sm text-gray-400">~{Math.round(size * 0.3 / 1024 / 1024)}MB</div>
          </button>
          <button
            onClick={() => { setQuality('720p'); setShowQualityMenu(false); handleDownload(); }}
            className="block w-full px-4 py-3 text-left hover:bg-dark-lighten-2 transition-colors text-white border-t border-gray-700"
          >
            <div className="font-semibold">720p (Recommended)</div>
            <div className="text-sm text-gray-400">~{Math.round(size * 0.6 / 1024 / 1024)}MB</div>
          </button>
          <button
            onClick={() => { setQuality('1080p'); setShowQualityMenu(false); handleDownload(); }}
            className="block w-full px-4 py-3 text-left hover:bg-dark-lighten-2 transition-colors text-white border-t border-gray-700"
          >
            <div className="font-semibold">1080p (HD)</div>
            <div className="text-sm text-gray-400">~{Math.round(size / 1024 / 1024)}MB</div>
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadButton;
