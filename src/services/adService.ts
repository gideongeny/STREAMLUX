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
        interstitialFrequency: 10, // 10 minutes between ads
    };

    /**
     * Initialize Monetag scripts
     */
    init(config: Partial<MonetizationConfig>) {
        this.config = { ...this.config, ...config };
        this.loadMultiTag();
        this.setupPushNotifications();
    }

    /**
     * Load Monetag MultiTag script
     */
    private loadMultiTag() {
        if (!this.config.multiTagId) return;

        const script = document.createElement('script');
        script.src = `//thubanoa.com/${this.config.multiTagId}/invoke.js`;
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        document.head.appendChild(script);
    }

    /**
     * Setup push notification subscription
     */
    private setupPushNotifications() {
        if (!this.config.pushNotificationId) return;

        const script = document.createElement('script');
        script.innerHTML = `
      (function(d,z,s){
        s.src='https://'+d+'/400/'+z;
        try{(document.body||document.documentElement).appendChild(s)}catch(e){}
      })('glizauvo.net',${this.config.pushNotificationId},document.createElement('script'))
    `;
        document.body.appendChild(script);
    }

    /**
     * Show interstitial ad on page transition
     */
    showInterstitial(): boolean {
        const now = Date.now();
        const timeSinceLastAd = (now - this.lastInterstitialTime) / 1000 / 60; // minutes

        // Check frequency cap
        if (timeSinceLastAd < this.config.interstitialFrequency) {
            return false;
        }

        // Trigger Monetag interstitial
        if (typeof (window as any).monetag !== 'undefined') {
            (window as any).monetag.showInterstitial();
            this.lastInterstitialTime = now;
            return true;
        }

        return false;
    }

    /**
     * Check if user should see ad (respects frequency cap)
     */
    shouldShowAd(): boolean {
        const now = Date.now();
        const timeSinceLastAd = (now - this.lastInterstitialTime) / 1000 / 60;
        return timeSinceLastAd >= this.config.interstitialFrequency;
    }

    /**
     * Check if current page should trigger ads
     */
    shouldTriggerOnPage(pathname: string): boolean {
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
    }

    /**
     * Request push notification permission
     */
    requestPushPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

export const adService = new AdService();
