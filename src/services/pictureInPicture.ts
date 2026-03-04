/**
 * Picture-in-Picture Service
 * Enables PiP mode for video playback on Android
 */

import { Capacitor } from '@capacitor/core';

class PictureInPictureService {
    private isInPiPMode = false;
    private videoElement: HTMLVideoElement | null = null;

    /**
     * Check if PiP is supported
     */
    isSupported(): boolean {
        if (!Capacitor.isNativePlatform()) {
            // Web PiP support
            return document.pictureInPictureEnabled;
        }
        // Android PiP is supported on Android 8.0+
        return Capacitor.getPlatform() === 'android';
    }

    /**
     * Enter PiP mode
     */
    async enterPiP(videoEl?: HTMLVideoElement): Promise<boolean> {
        if (!this.isSupported()) {
            console.warn('PiP not supported on this platform');
            return false;
        }

        try {
            if (Capacitor.isNativePlatform()) {
                // Android native PiP
                // This will be handled by Android system when user presses home button
                // We just need to ensure the activity is configured correctly
                this.isInPiPMode = true;
                return true;
            } else {
                // Web PiP
                if (videoEl && !document.pictureInPictureElement) {
                    await videoEl.requestPictureInPicture();
                    this.videoElement = videoEl;
                    this.isInPiPMode = true;
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Failed to enter PiP:', error);
            return false;
        }
    }

    /**
     * Exit PiP mode
     */
    async exitPiP(): Promise<void> {
        try {
            if (!Capacitor.isNativePlatform() && document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            }
            this.isInPiPMode = false;
            this.videoElement = null;
        } catch (error) {
            console.error('Failed to exit PiP:', error);
        }
    }

    /**
     * Check if currently in PiP mode
     */
    isPiPActive(): boolean {
        if (!Capacitor.isNativePlatform()) {
            return !!document.pictureInPictureElement;
        }
        return this.isInPiPMode;
    }

    /**
     * Setup PiP event listeners
     */
    setupPiPListeners(videoEl: HTMLVideoElement): void {
        if (!Capacitor.isNativePlatform()) {
            videoEl.addEventListener('enterpictureinpicture', () => {
                this.isInPiPMode = true;
                console.log('Entered PiP mode');
            });

            videoEl.addEventListener('leavepictureinpicture', () => {
                this.isInPiPMode = false;
                console.log('Left PiP mode');
            });
        }
    }

    /**
     * Auto-enter PiP on app minimize (Android)
     */
    enableAutoEnterOnMinimize(): void {
        if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
            // This is handled by Android manifest configuration
            // android:supportsPictureInPicture="true"
            console.log('Auto PiP enabled via manifest');
        }
    }
}

export const pictureInPictureService = new PictureInPictureService();
