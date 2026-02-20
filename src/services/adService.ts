// Monetag Ad Integration Service
// Professional ad monetization with interstitials and push notifications

export interface MonetizationConfig {
    multiTagId: string;
    pushNotificationId: string;
    interstitialFrequency: number; // minutes between interstitials
}

class AdService {
    private lastInterstitialTime: number = 0;
    private config: MonetizationConfig = {
        multiTagId: '', // Set this in your Monetag dashboard
        pushNotificationId: '',
        interstitialFrequency: 5, // 5 minutes between ads
    };
    private isNativeApp: boolean = false;

    constructor() {
        // Detect if running in Capacitor (native app)
        this.isNativeApp = this.detectNativeApp();
    }

    /**
     * Detect if app is running in Capacitor (Android/iOS)
     */
    private detectNativeApp(): boolean {
        try {
            // Check for Capacitor
            if (typeof window !== 'undefined') {
                return !!(window as any).Capacitor ||
                    !!(window as any).cordova ||
                    navigator.userAgent.includes('StreamLuxApp');
            }
        } catch (e) {
            console.warn('Error detecting native app:', e);
        }
        return false;
    }

    /**
     * Check if ads should be shown (disabled in native app)
     */
    private shouldShowAds(): boolean {
        return !this.isNativeApp;
    }

    /**
     * Initialize Monetag scripts
     */
    init(config: Partial<MonetizationConfig>) {
        // Don't initialize ads in native app
        if (!this.shouldShowAds()) {
            console.log('StreamLux: Ads disabled in native app');
            return;
        }

        try {
            this.config = { ...this.config, ...config };
            this.loadMultiTag();
            this.setupPushNotifications();
        } catch (error) {
            console.warn("StreamLux AdService init failed:", error);
        }
    }

    /**
     * Load Monetag MultiTag script
     */
    private loadMultiTag() {
        if (!this.config.multiTagId) return;

        try {
            const script = document.createElement('script');
            script.src = `//thubanoa.com/${this.config.multiTagId}/invoke.js`;
            script.async = true;
            script.setAttribute('data-cfasync', 'false');

            script.onerror = () => {
                console.warn("StreamLux AdScript failed to load - likely adblocker");
            };

            document.head.appendChild(script);
        } catch (e) {
            console.warn("Failed to append ad script", e);
        }
    }

    /**
     * Setup push notification subscription
     */
    private setupPushNotifications() {
        if (!this.config.pushNotificationId) return;

        try {
            const script = document.createElement('script');
            script.innerHTML = `
                (function(d,z,s){
                    s.src='https://'+d+'/400/'+z;
                    try{(document.body||document.documentElement).appendChild(s)}catch(e){}
                })('glizauvo.net',${this.config.pushNotificationId},document.createElement('script'))
            `;
            document.body.appendChild(script);
        } catch (e) {
            console.warn("Failed to setup push notifications", e);
        }
    }

    /**
     * Show interstitial ad on page transition
     */
    showInterstitial(): boolean {
        try {
            const now = Date.now();
            const timeSinceLastAd = (now - this.lastInterstitialTime) / 1000 / 60; // minutes

            // Check frequency cap
            if (timeSinceLastAd < this.config.interstitialFrequency) {
                return false;
            }

            // Trigger Monetag interstitial
            if (typeof (window as any).monetag !== 'undefined') {
                // Wrap in try-catch in case the ad provider throws
                try {
                    (window as any).monetag.showInterstitial();
                    this.lastInterstitialTime = now;
                    return true;
                } catch (adError) {
                    console.warn("Monetag showInterstitial threw an error:", adError);
                    return false;
                }
            }
        } catch (error) {
            console.error("Error in showInterstitial:", error);
        }

        return false;
    }

    /**
     * Check if user should see ad (respects frequency cap and platform)
     */
    shouldShowAd(): boolean {
        // Never show ads in native app
        if (!this.shouldShowAds()) {
            return false;
        }

        try {
            const now = Date.now();
            const timeSinceLastAd = (now - this.lastInterstitialTime) / 1000 / 60;
            return timeSinceLastAd >= this.config.interstitialFrequency;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if current page should trigger ads
     */
    shouldTriggerOnPage(pathname: string): boolean {
        if (!pathname) return false;
        try {
            const adPages = [
                '/movie/',
                '/tv/',
                '/sports/',
                '/explore',
                '/search',
                '/bookmarked',
                '/youtube/'
            ];

            return adPages.some(page => pathname.includes(page));
        } catch (e) {
            return false;
        }
    }

    /**
     * Request push notification permission
     */
    requestPushPermission() {
        try {
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().catch(err => console.warn("Notification permission request failed", err));
            }
        } catch (e) {
            console.warn("Error requesting push permission", e);
        }
    }
}

export const adService = new AdService();
