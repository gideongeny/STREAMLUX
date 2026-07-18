import React, { useMemo, useState } from 'react';
import { buildYouTubeLiveEmbedUrl, buildYouTubeWatchUrl } from '../../utils/youtubeLiveTV';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

interface LiveTVYouTubePlayerProps {
  videoId: string;
  channelName: string;
}

const LiveTVYouTubePlayer: React.FC<LiveTVYouTubePlayerProps> = ({ videoId, channelName }) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  const embedUrl = useMemo(() => buildYouTubeLiveEmbedUrl(videoId), [videoId, reloadKey]);

  const openInBrowser = async () => {
    const url = buildYouTubeWatchUrl(videoId);
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      {!showFallback ? (
        <iframe
          key={`${videoId}-${reloadKey}`}
          title={channelName}
          src={embedUrl}
          className="flex-1 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onError={() => setShowFallback(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
          <p className="text-white font-bold text-lg">Stream blocked in embed mode</p>
          <p className="text-gray-400 text-sm max-w-md">
            {channelName} may require opening in the YouTube app or browser on your device.
          </p>
          <button
            type="button"
            onClick={openInBrowser}
            className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl"
          >
            <FiExternalLink /> Open on YouTube
          </button>
        </div>
      )}

      <div className="shrink-0 flex items-center justify-center gap-3 py-2 bg-black/80 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            setShowFallback(false);
            setReloadKey((k) => k + 1);
          }}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white"
        >
          <FiRefreshCw className="w-3 h-3" /> Reload stream
        </button>
        <button
          type="button"
          onClick={openInBrowser}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white"
        >
          <FiExternalLink className="w-3 h-3" /> YouTube app
        </button>
      </div>
    </div>
  );
};

export default LiveTVYouTubePlayer;
