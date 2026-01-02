/**
 * Ad Manager Service
 * Handles AdMob integration for banners, interstitials, and rewarded ads
 */

import { AdMob, AdOptions, BannerAdOptions, BannerAdSize, BannerAdPosition, AdLoadInfo, RewardAdOptions, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { userStatsService } from './userStats'; // To unlock premium features

class AdManager {
    private isInitialized = false;

    // TEST IDS (Replace with real IDs in production)
    private readonly BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
    private readonly INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
    private readonly REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

    async initialize(): Promise<void> {
        if (!Capacitor.isNativePlatform()) {
            console.log('AdMob only available on native platforms');
            return;
        }

        if (this.isInitialized) return;

        try {
            await AdMob.initialize({
                requestTrackingAuthorization: true,
                testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Add test device IDs here
                initializeForTesting: true,
            });
            this.isInitialized = true;
            console.log('AdMob initialized');
        } catch (error) {
            console.error('AdMob initialization failed:', error);
        }
    }

    /**
     * Show Banner Ad
     */
    async showBanner(): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const options: BannerAdOptions = {
                adId: this.BANNER_ID,
                adSize: BannerAdSize.ADAPTIVE_BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: true
            };
            await AdMob.showBanner(options);
        } catch (error) {
            console.error('Failed to show banner:', error);
        }
    }

    /**
     * Hide Banner Ad
     */
    async hideBanner(): Promise<void> {
        if (!this.isInitialized) return;
        try {
            await AdMob.hideBanner();
        } catch (error) {
            console.error('Failed to hide banner:', error);
        }
    }

    /**
     * Show Interstitial Ad (e.g., before playing video)
     */
    async showInterstitial(): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const options: AdOptions = {
                adId: this.INTERSTITIAL_ID,
                isTesting: true
            };
            await AdMob.prepareInterstitial(options);
            await AdMob.showInterstitial();
        } catch (error) {
            console.error('Failed to show interstitial:', error);
        }
    }

    /**
     * Show Rewarded Ad (e.g., to unlock downloads)
     */
    async showRewardedAd(): Promise<boolean> {
        if (!this.isInitialized) return false;

        return new Promise(async (resolve) => {
            try {
                const options: RewardAdOptions = {
                    adId: this.REWARDED_ID,
                    isTesting: true
                };

                await AdMob.prepareRewardVideoAd(options);

                const rewardHandler = AdMob.addListener('onRewardVideoReward', (reward: AdMobRewardItem) => {
                    console.log('User rewarded:', reward);
                    // Grant premium access for 24h as a reward example
                    // In a real app, update user status in DB
                    resolve(true);
                    rewardHandler.remove();
                });

                const closeHandler = AdMob.addListener('onRewardVideoAdDismissed', () => {
                    resolve(false); // Closed without reward? Logic depends on when reward fires
                    closeHandler.remove();
                });

                await AdMob.showRewardVideoAd();
            } catch (error) {
                console.error('Failed to show rewarded ad:', error);
                resolve(false);
            }
        });
    }
}

export const adManager = new AdManager();

// Auto-init
if (Capacitor.isNativePlatform()) {
    adManager.initialize();
}
