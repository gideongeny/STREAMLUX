// hooks/useMediaDownload.ts

import { useState, useCallback, useRef } from 'react';
import { DownloadEngine, ExtractedStream } from '../services/DownloadEngine';

/**
 * Media information required to build the final file name.
 */
export interface MediaInfo {
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
    isDownloading: boolean;
    error: string | null;
    startDownload: (sourceUrl: string, isIframe?: boolean) => Promise<void>;
    cancelDownload: () => void;
}

/**
 * React hook for downloading media with progress tracking.
 * @param mediaInfo - Object containing title, year, type, and optional season/episode.
 * @param proxy - Optional proxy URL (defaults to 'https://cors-anywhere.herokuapp.com/').
 */
export function useMediaDownload(
    mediaInfo: MediaInfo,
    proxy: string = 'https://cors-anywhere.herokuapp.com/'
): UseMediaDownloadReturn {
    const [progress, setProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const engine = useRef<DownloadEngine>(new DownloadEngine(proxy)).current;

    const cancelDownload = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsDownloading(false);
        setProgress(0);
    }, []);

    const startDownload = useCallback(
        async (sourceUrl: string, isIframe: boolean = true) => {
            // Abort any ongoing download
            cancelDownload();

            setError(null);
            setIsDownloading(true);
            setProgress(0);

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                // 1. Obtain the direct stream URL
                let stream: ExtractedStream;
                if (isIframe) {
                    stream = await engine.extractFromIframe(sourceUrl);
                } else {
                    // Assume sourceUrl is already a direct stream; guess type from extension
                    const type = sourceUrl.includes('.m3u8') ? 'hls' : 'mp4';
                    stream = { url: sourceUrl, type };
                }

                // 2. Download the stream with progress
                const data = await engine.downloadStream(
                    stream.url,
                    stream.type,
                    (percent) => {
                        if (!abortController.signal.aborted) {
                            setProgress(percent);
                        }
                    },
                    abortController.signal
                );

                // 3. Build the file name
                let fileName = '';
                if (mediaInfo.type === 'movie') {
                    fileName = `${mediaInfo.title} (${mediaInfo.year}).mp4`;
                } else {
                    const season = mediaInfo.season?.toString().padStart(2, '0') || '01';
                    const episode = mediaInfo.episode?.toString().padStart(2, '0') || '01';
                    fileName = `${mediaInfo.title} (${mediaInfo.year}) - S${season}E${episode}.mp4`;
                }

                // 4. Trigger browser download
                const blob = new Blob([data], { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                setProgress(100);
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    setError('Download cancelled');
                } else {
                    setError(err.message || 'Download failed');
                }
            } finally {
                setIsDownloading(false);
                abortControllerRef.current = null;
            }
        },
        [mediaInfo, engine, cancelDownload]
    );

    return {
        progress,
        isDownloading,
        error,
        startDownload,
        cancelDownload,
    };
}