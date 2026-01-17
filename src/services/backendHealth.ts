import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';

/**
 * Backend Health Check Service
 * Automatically wakes up the Render backend if it's sleeping
 */
class BackendHealthService {
    private isWaking = false;
    private isReady = false;
    private wakePromise: Promise<boolean> | null = null;

    /**
     * Wake up the backend by sending a health check request
     * This is called automatically when the app loads
     */
    async wakeBackend(): Promise<boolean> {
        // If already waking or ready, return existing promise/status
        if (this.isReady) return true;
        if (this.wakePromise) return this.wakePromise;

        this.isWaking = true;

        this.wakePromise = this.performHealthCheck();
        const result = await this.wakePromise;

        this.isWaking = false;
        this.isReady = result;
        this.wakePromise = null;

        return result;
    }

    private async performHealthCheck(): Promise<boolean> {
        try {
            const startTime = Date.now();

            // Simple health check endpoint - just needs to wake the server
            await axios.get(BACKEND_URL.replace('/api', '') + '/api/proxy?url=https://httpbin.org/get', {
                timeout: 35000, // 35 seconds to allow for wake-up time
            });

            const duration = Date.now() - startTime;

            // Log wake-up time for debugging (only in development)
            if (process.env.NODE_ENV === 'development') {
                console.log(`Backend ready in ${duration}ms`);
            }

            return true;
        } catch (error) {
            console.warn('Backend health check failed:', error);
            return false;
        }
    }

    /**
     * Check if backend is ready without waking it
     */
    isBackendReady(): boolean {
        return this.isReady;
    }

    /**
     * Check if backend is currently waking up
     */
    isBackendWaking(): boolean {
        return this.isWaking;
    }

    /**
     * Keep backend alive by pinging every 5 minutes when user is active
     * More frequent pings to prevent sleep on Render free tier
     */
    startKeepAlive(): () => void {
        // Initial wake
        this.wakeBackend();

        // Ping every 5 minutes (Render free tier sleeps after 15 min inactivity)
        const interval = setInterval(() => {
            // Only ping if user is actively viewing the page
            if (document.visibilityState === 'visible' && !document.hidden) {
                this.wakeBackend().catch(() => {
                    // Silently fail - don't spam if backend is down
                });
            }
        }, 5 * 60 * 1000); // 5 minutes - keeps it well within 15 min window

        // Also ping on user activity (scroll, click, etc.) to keep it extra alive
        let activityTimer: NodeJS.Timeout;
        const activityEvents = ['scroll', 'click', 'keydown', 'mousemove', 'touchstart'];
        const handleActivity = () => {
            clearTimeout(activityTimer);
            activityTimer = setTimeout(() => {
                if (document.visibilityState === 'visible' && !document.hidden) {
                    this.wakeBackend().catch(() => {});
                }
            }, 2 * 60 * 1000); // Ping 2 minutes after last activity
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Return cleanup function
        return () => {
            clearInterval(interval);
            clearTimeout(activityTimer);
            activityEvents.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }
}

export const backendHealthService = new BackendHealthService();
