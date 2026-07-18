/**
 * Background Audio Service
 * Enables audio playback when app is minimized
 */

import { Capacitor } from '@capacitor/core';

interface MediaMetadata {
    title: string;
    artist?: string;
    album?: string;
    artwork?: string;
}

class BackgroundAudioService {
    private isPlaying = false;
    private audioElement: HTMLMediaElement | null = null;

    /**
     * Check if background audio is supported
     */
    isSupported(): boolean {
        return Capacitor.isNativePlatform();
    }

    /**
     * Initialize background audio
     */
    async initialize(audioEl: HTMLMediaElement): Promise<void> {
        if (!this.isSupported()) {
            console.log('Background audio only available on native platforms');
            return;
        }

        this.audioElement = audioEl;
        this.setupMediaSession();
    }

    /**
     * Setup Media Session API (for lock screen controls)
     */
    private setupMediaSession(): void {
        if ('mediaSession' in navigator) {
            // Set up media session handlers
            navigator.mediaSession.setActionHandler('play', () => {
                this.play();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                this.pause();
            });

            navigator.mediaSession.setActionHandler('seekbackward', () => {
                this.seek(-10);
            });

            navigator.mediaSession.setActionHandler('seekforward', () => {
                this.seek(10);
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                // Handle previous track
                console.log('Previous track');
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                // Handle next track
                console.log('Next track');
            });
        }
    }

    /**
     * Update media metadata (shown on lock screen)
     */
    updateMetadata(metadata: MediaMetadata): void {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: metadata.title,
                artist: metadata.artist || 'StreamLux',
                album: metadata.album || 'Streaming',
                artwork: metadata.artwork ? [
                    { src: metadata.artwork, sizes: '512x512', type: 'image/png' }
                ] : undefined,
            });
        }
    }

    /**
     * Play audio
     */
    async play(): Promise<void> {
        if (!this.audioElement) return;

        try {
            await this.audioElement.play();
            this.isPlaying = true;

            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        } catch (error) {
            console.error('Failed to play:', error);
        }
    }

    /**
     * Pause audio
     */
    pause(): void {
        if (!this.audioElement) return;

        this.audioElement.pause();
        this.isPlaying = false;

        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    }

    /**
     * Seek audio
     */
    seek(seconds: number): void {
        if (!this.audioElement) return;

        const newTime = this.audioElement.currentTime + seconds;
        this.audioElement.currentTime = Math.max(0, Math.min(newTime, this.audioElement.duration));
    }

    /**
     * Update playback position (for lock screen)
     */
    updatePosition(position: number, duration: number): void {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setPositionState({
                duration: duration,
                playbackRate: 1.0,
                position: position,
            });
        }
    }

    /**
     * Enable background playback
     */
    enableBackgroundPlayback(): void {
        if (!this.audioElement) return;

        // Prevent audio from stopping when app is minimized
        this.audioElement.setAttribute('playsinline', 'true');

        // On Android, this requires a foreground service
        // which is configured in the AndroidManifest.xml
        console.log('Background playback enabled');
    }

    /**
     * Check if currently playing
     */
    isPlayingAudio(): boolean {
        return this.isPlaying;
    }
}

export const backgroundAudioService = new BackgroundAudioService();
