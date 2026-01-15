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
     * Keep backend alive by pinging every 10 minutes
     * Call this only if user is actively using the app
     */
    startKeepAlive(): () => void {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.wakeBackend();
            }
        }, 10 * 60 * 1000); // 10 minutes

        // Return cleanup function
        return () => clearInterval(interval);
    }
}

export const backendHealthService = new BackendHealthService();
