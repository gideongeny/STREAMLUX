/**
 * Ad Manager Service
 * Handles AdMob integration for banners, interstitials, and rewarded ads
 */

import { Capacitor } from '@capacitor/core';
import { userStatsService } from './userStats'; // To unlock premium features
import { logger } from '../utils/logger';

import { AdMob } from '@capacitor-community/admob';
let AdMobPlugin: any = AdMob;

export type RewardType = 'download' | 'premium_unlock' | 'remove_watermark';

export interface RewardedAdConfig {
    duration: number; // in seconds
    cooldown: number; // in minutes
}

class AdManager {
    private isInitialized = false;

    // Configuration for different reward types
    private readonly REWARD_CONFIGS: Record<RewardType, RewardedAdConfig> = {
        download: { duration: 15, cooldown: 60 },
        premium_unlock: { duration: 30, cooldown: 1440 }, // 24 hours
        remove_watermark: { duration: 30, cooldown: 120 }
    };

    // Track when user last watched an ad for a specific reward
    private lastWatched: Record<string, number> = {};

    getRewardedAdConfig(type: RewardType): RewardedAdConfig {
        return this.REWARD_CONFIGS[type];
    }

    canWatchRewardedAd(type: RewardType): boolean {
        const lastTime = this.lastWatched[type] || 0;
        const now = Date.now();
        const cooldownMs = this.REWARD_CONFIGS[type].cooldown * 60 * 1000;
        return now - lastTime > cooldownMs;
    }

    markRewardedAdWatched(type: RewardType): void {
        this.lastWatched[type] = Date.now();
        // Here you would also trigger the actual reward logic (e.g. unlock download)
    }

    // TEST IDs (Replace with real IDs in production)
    private readonly BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
    private readonly INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
    private readonly REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

    async initialize(): Promise<void> {
        if (!Capacitor.isNativePlatform()) {
            logger.log('AdMob only available on native platforms');
            return;
        }

        if (this.isInitialized) return;

        try {
            await AdMobPlugin.initialize();
            this.isInitialized = true;
            logger.log('AdMob initialized');
        } catch (error) {
            logger.error('AdMob initialization failed:', error);
        }
    }

    /**
     * Show Banner Ad
     */
    async showBanner(): Promise<void> {
        if (!this.isInitialized || !AdMobPlugin) return;

        try {
            const options: any = {
                adId: this.BANNER_ID,
                adSize: 'ADAPTIVE_BANNER',
                position: 'BOTTOM_CENTER',
                margin: 0,
                isTesting: true
            };
            await AdMobPlugin.showBanner(options);
        } catch (error) {
            logger.error('Failed to show banner:', error);
        }
    }

    /**
     * Hide Banner Ad
     */
    async hideBanner(): Promise<void> {
        if (!this.isInitialized || !AdMobPlugin) return;
        try {
            await AdMobPlugin.hideBanner();
        } catch (error) {
            logger.error('Failed to hide banner:', error);
        }
    }

    /**
     * Show Interstitial Ad (e.g., before playing video)
     */
    async showInterstitial(): Promise<void> {
        if (!this.isInitialized || !AdMobPlugin) return;

        try {
            const options: any = {
                adId: this.INTERSTITIAL_ID,
                isTesting: true
            };
            await AdMobPlugin.prepareInterstitial(options);
            await AdMobPlugin.showInterstitial();
        } catch (error) {
            logger.error('Failed to show interstitial:', error);
        }
    }

    /**
     * Show Rewarded Ad (e.g., to unlock downloads)
     */
    async showRewardedAd(): Promise<boolean> {
        if (!this.isInitialized || !AdMobPlugin) return false;

        return new Promise(async (resolve) => {
            let rewardHandler: any = null;
            let closeHandler: any = null;

            try {
                const options: any = {
                    adId: this.REWARDED_ID,
                    isTesting: true
                };

                await AdMobPlugin.prepareRewardVideoAd(options);

                // Use type assertion for event names
                rewardHandler = await AdMobPlugin.addListener('onRewardVideoReward' as any, (reward: any) => {
                    logger.log('User rewarded:', reward);
                    resolve(true);
                    if (rewardHandler && typeof rewardHandler.remove === 'function') {
                        rewardHandler.remove();
                    }
                    if (closeHandler && typeof closeHandler.remove === 'function') {
                        closeHandler.remove();
                    }
                });

                closeHandler = await AdMobPlugin.addListener('onRewardVideoAdDismissed' as any, () => {
                    resolve(false);
                    if (rewardHandler && typeof rewardHandler.remove === 'function') {
                        rewardHandler.remove();
                    }
                    if (closeHandler && typeof closeHandler.remove === 'function') {
                        closeHandler.remove();
                    }
                });

                await AdMobPlugin.showRewardVideoAd();
            } catch (error) {
                logger.error('Failed to show rewarded ad:', error);
                if (rewardHandler && typeof rewardHandler.remove === 'function') {
                    rewardHandler.remove();
                }
                if (closeHandler && typeof closeHandler.remove === 'function') {
                    closeHandler.remove();
                }
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
