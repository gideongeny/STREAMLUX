import { useState, useCallback, useRef } from 'react';
import { DownloadEngine, ExtractedStream, DownloadStage } from '../services/DownloadEngine';

/**
 * Media information required to build the final file name.
 */
export interface MediaInfo {
    id: string | number;
    title: string;
    year: number | string;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
}

/**
 * Return type of the useMediaDownload hook.
 */
export interface UseMediaDownloadReturn {
    progress: number;               // 0‑100
    status: DownloadStage;
    isDownloading: boolean;
    error: string | null;
    startDownload: (sourceUrl: string, isIframe?: boolean) => Promise<void>;
    cancelDownload: () => void;
}

/**
 * React hook for downloading media with progress tracking.
 * @param mediaInfo - Object containing title, year, type, and optional season/episode.
 * @param proxy - Optional proxy URL.
 */
export function useMediaDownload(
    mediaInfo: MediaInfo,
    _proxy: string = '/api-proxy/'
): UseMediaDownloadReturn {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<DownloadStage>('Initializing...');
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const cancelDownload = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsDownloading(false);
        setProgress(0);
        setStatus('Initializing...');
    }, []);

    const startDownload = useCallback(
        async (_sourceUrl: string, _isIframe: boolean = true) => {
            cancelDownload();
            setError(null);
            setIsDownloading(true);
            setProgress(30);
            setStatus('Opening Download Page...');

            // The user wants a 2-second status "Openining Download Page..." so they know it worked
            setTimeout(() => {
                try {
                    // 1. Calculate the exact DL URL
                    // Use the id passed in mediaInfo for reliability
                    const tmdbId = mediaInfo.id;
                    
                    let dlUrl = "";
                    if (mediaInfo.type === 'movie') {
                        dlUrl = `https://dl.vidsrc.vip/movie/${tmdbId}`;
                    } else {
                        dlUrl = `https://dl.vidsrc.vip/tv/${tmdbId}/${mediaInfo.season || 1}/${mediaInfo.episode || 1}`;
                    }

                    // Strict Parameter Check & Console Log
                    console.log('Target URL:', dlUrl);

                    // 2. Safe Open
                    window.open(dlUrl, '_blank', 'noopener,noreferrer');
                    
                    setProgress(100);
                    setStatus('Redirecting...');
                    
                    // Reset UI after redirect
                    setTimeout(() => {
                        setIsDownloading(false);
                        setProgress(0);
                        setStatus('Initializing...');
                    }, 1000);
                } catch (err: any) {
                    setError('Failed to generate redirect link');
                    setIsDownloading(false);
                }
            }, 2000);
        },
        [mediaInfo, cancelDownload]
    );

    return {
        progress,
        status,
        isDownloading,
        error,
        startDownload,
        cancelDownload,
    };
}