/**
 * Biometric Authentication Service
 * Enables fingerprint/face unlock for Android
 */

import { Capacitor } from '@capacitor/core';

export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'none';

interface BiometricOptions {
    reason?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    negativeButtonText?: string;
}

class BiometricAuthService {
    private isAvailable = false;
    private biometricType: BiometricType = 'none';

    /**
     * Check if biometric authentication is available
     */
    async checkAvailability(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) {
            return false;
        }

        try {
            // This would use @capacitor/biometric-auth plugin
            // Placeholder implementation
            this.isAvailable = true;
            this.biometricType = 'fingerprint'; // Default
            return true;
        } catch (error) {
            console.error('Biometric check failed:', error);
            return false;
        }
    }

    /**
     * Authenticate with biometrics
     */
    async authenticate(options?: BiometricOptions): Promise<boolean> {
        if (!this.isAvailable) {
            console.warn('Biometric authentication not available');
            return false;
        }

        try {
            const defaultOptions: BiometricOptions = {
                reason: 'Verify your identity',
                title: 'Authentication Required',
                subtitle: 'StreamLux',
                description: 'Use your biometric to unlock',
                negativeButtonText: 'Use PIN',
                ...options,
            };

            // This would trigger the biometric prompt
            // Placeholder implementation
            console.log('Biometric authentication requested:', defaultOptions);

            // Simulate successful authentication
            return true;
        } catch (error) {
            console.error('Biometric authentication failed:', error);
            return false;
        }
    }

    /**
     * Get available biometric type
     */
    getBiometricType(): BiometricType {
        return this.biometricType;
    }

    /**
     * Check if biometric is available
     */
    isBiometricAvailable(): boolean {
        return this.isAvailable;
    }

    /**
     * Lock profile with biometric
     */
    async lockProfile(profileId: string): Promise<void> {
        localStorage.setItem(`profile_locked_${profileId}`, 'true');
    }

    /**
     * Unlock profile with biometric
     */
    async unlockProfile(profileId: string): Promise<boolean> {
        const isLocked = localStorage.getItem(`profile_locked_${profileId}`) === 'true';

        if (!isLocked) {
            return true; // Already unlocked
        }

        const authenticated = await this.authenticate({
            reason: 'Unlock profile',
            title: 'Profile Locked',
            description: 'Use your biometric to unlock this profile',
        });

        if (authenticated) {
            localStorage.removeItem(`profile_locked_${profileId}`);
            return true;
        }

        return false;
    }

    /**
     * Check if profile is locked
     */
    isProfileLocked(profileId: string): boolean {
        return localStorage.getItem(`profile_locked_${profileId}`) === 'true';
    }

    /**
     * Enable biometric for app
     */
    async enableBiometric(): Promise<boolean> {
        const available = await this.checkAvailability();
        if (available) {
            localStorage.setItem('biometric_enabled', 'true');
            return true;
        }
        return false;
    }

    /**
     * Disable biometric for app
     */
    disableBiometric(): void {
        localStorage.removeItem('biometric_enabled');
    }

    /**
     * Check if biometric is enabled
     */
    isBiometricEnabled(): boolean {
        return localStorage.getItem('biometric_enabled') === 'true';
    }
}

export const biometricAuthService = new BiometricAuthService();

// Auto-check availability on load
if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
    biometricAuthService.checkAvailability();
}
