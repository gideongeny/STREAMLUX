import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const useYouTubeIframe = (
  videoId: string | null,
  onStateChange?: (state: number) => void,
  onReady?: (player: any) => void
) => {
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsReady(true);
      };
    } else if (window.YT && window.YT.Player) {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !videoId || !containerRef.current) return;

    if (!playerRef.current) {
      // Create new player
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            if (onReady) onReady(event.target);
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            if (onStateChange) onStateChange(event.data);
          },
        },
      });
    } else {
      // Update existing player
      playerRef.current.loadVideoById(videoId);
    }

    return () => {
      // Don't destroy on unmount if we just change videos, 
      // but in this hook we let the consumer handle destruction if needed
    };
  }, [isReady, videoId]);

  return { containerRef, playerRef };
};
