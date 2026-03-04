import express, { Request, Response } from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'StreamLux backend is running'
    });
});

// Ping endpoint (alternative to health)
router.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({
        pong: true,
        timestamp: new Date().toISOString()
    });
});

// Keep-alive endpoint with more detailed info
router.get('/keep-alive', (req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        },
        nodeVersion: process.version,
        platform: process.platform,
    });
});

export default router;
