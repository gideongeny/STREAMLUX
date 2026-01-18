// Backend Keep-Alive Service
// Prevents Render free tier from sleeping after 15 minutes of inactivity

class PingService {
    private pingInterval: NodeJS.Timeout | null = null;
    private readonly PING_FREQUENCY = 10 * 60 * 1000; // 10 minutes
    private readonly BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';
    private isActive: boolean = false;

    /**
     * Start pinging the backend to keep it alive
     */
    start() {
        if (this.pingInterval) {
            console.log('Ping service already running');
            return;
        }

        console.log('Starting backend keep-alive service...');
        this.isActive = true;

        // Ping immediately
        this.ping();

        // Then ping every 10 minutes
        this.pingInterval = setInterval(() => {
            this.ping();
        }, this.PING_FREQUENCY);
    }

    /**
     * Stop the ping service
     */
    stop() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
            this.isActive = false;
            console.log('Backend keep-alive service stopped');
        }
    }

    /**
     * Ping the backend health endpoint
     */
    private async ping() {
        try {
            const startTime = Date.now();
            const response = await fetch(`${this.BACKEND_URL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const responseTime = Date.now() - startTime;

            if (response.ok) {
                const data = await response.json();
                console.log(`Backend ping successful (${responseTime}ms):`, data);
            } else {
                console.warn(`Backend ping failed with status ${response.status}`);
            }
        } catch (error) {
            console.error('Backend ping error:', error);
        }
    }

    /**
     * Check if the service is running
     */
    isRunning(): boolean {
        return this.isActive;
    }

    /**
     * Manually trigger a ping
     */
    async triggerPing() {
        await this.ping();
    }
}

export const pingService = new PingService();

// Auto-start the service when the app loads
if (typeof window !== 'undefined') {
    // Wait for the app to be fully loaded
    window.addEventListener('load', () => {
        // Start pinging after 30 seconds to avoid initial load overhead
        setTimeout(() => {
            pingService.start();
        }, 30000);
    });

    // Stop pinging when the page is about to unload
    window.addEventListener('beforeunload', () => {
        pingService.stop();
    });
}
