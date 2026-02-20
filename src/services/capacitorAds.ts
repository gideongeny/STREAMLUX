/**
 * StreamLux AdMob Integration (Capacitor)
 * 
 * App ID:        ca-app-pub-1281448884303417~9595144052
 * Banner:        ca-app-pub-1281448884303417/2591576419
 * Interstitial:  ca-app-pub-1281448884303417/4423967607
 * Rewarded:      ca-app-pub-1281448884303417/7216392727
 * CA Interst:    ca-app-pub-1281448884303417/1797804269
 * Banner 2:      ca-app-pub-1281448884303417/9484722593
 * 
 * NO AdSense, NO PopAds. Only Google AdMob SDK.
 */

import { Capacitor } from '@capacitor/core';

// ── Ad Unit IDs ────────────────────────────────────────────────
const AD_UNITS = {
    banner: 'ca-app-pub-1281448884303417/2591576419',
    interstitial: 'ca-app-pub-1281448884303417/4423967607',
    rewarded: 'ca-app-pub-1281448884303417/7216392727',
    // Test IDs used in dev/web builds only
    bannerTest: 'ca-app-pub-3940256099942544/6300978111',
    interstitialTest: 'ca-app-pub-3940256099942544/1033173712',
};

// Only run on Android/iOS
const isNative = Capacitor.isNativePlatform();

let admobPlugin: any = null;

/**
 * Initialize AdMob — call once on app startup.
 */
export async function initializeAdMob(): Promise<void> {
    if (!isNative) return;
    try {
        const { AdMob } = await import('@capacitor-community/admob');
        admobPlugin = AdMob;
        await AdMob.initialize();
        console.log('[AdMob] Initialized');
    } catch (e) {
        console.warn('[AdMob] Failed to initialize:', e);
    }
}

/**
 * Show a banner ad at the bottom of the screen.
 * Call this once when the home screen mounts.
 */
export async function showBannerAd(): Promise<void> {
    if (!isNative || !admobPlugin) return;
    try {
        const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
        await AdMob.showBanner({
            adId: AD_UNITS.banner,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false,
        });
        console.log('[AdMob] Banner shown');
    } catch (e) {
        console.warn('[AdMob] Banner error:', e);
    }
}

/**
 * Remove the banner ad (call when leaving a page that shows it).
 */
export async function hideBannerAd(): Promise<void> {
    if (!isNative || !admobPlugin) return;
    try {
        const { AdMob } = await import('@capacitor-community/admob');
        await AdMob.removeBanner();
    } catch (e) {
        console.warn('[AdMob] Remove banner error:', e);
    }
}

/**
 * Load and show an interstitial ad.
 * Best called after a natural break, e.g. after navigating to a film page.
 */
export async function showInterstitialAd(): Promise<void> {
    if (!isNative || !admobPlugin) return;
    try {
        const { AdMob } = await import('@capacitor-community/admob');
        await AdMob.prepareInterstitial({ adId: AD_UNITS.interstitial, isTesting: false });
        await AdMob.showInterstitial();
        console.log('[AdMob] Interstitial shown');
    } catch (e) {
        console.warn('[AdMob] Interstitial error:', e);
    }
}

/**
 * Load and show a rewarded ad.
 */
export async function showRewardedAd(): Promise<void> {
    if (!isNative || !admobPlugin) return;
    try {
        const { AdMob } = await import('@capacitor-community/admob');
        await AdMob.prepareRewardVideoAd({ adId: AD_UNITS.rewarded, isTesting: false });
        await AdMob.showRewardVideoAd();
        console.log('[AdMob] Rewarded ad shown');
    } catch (e) {
        console.warn('[AdMob] Rewarded ad error:', e);
    }
}
