export const vibeService = {
    extractAverageColor: (imageUrl: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageUrl;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (!context) return resolve("#ff6b35");

                canvas.width = 50;
                canvas.height = 50;
                context.drawImage(img, 0, 0, 50, 50);
                
                // Sample 5 points (Corners + Center) to find the most "vibrant" one
                const points = [
                    [10, 10], [40, 10], [10, 40], [40, 40], [25, 25]
                ];
                
                let bestColor = { r: 255, g: 107, b: 53, vibe: 0 };
                
                for (const [x, y] of points) {
                    const data = context.getImageData(x, y, 1, 1).data;
                    const r = data[0];
                    const g = data[1];
                    const b = data[2];
                    
                    // Calculate "Vibrancy" (deviation from gray/black)
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const delta = max - min;
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    
                    // We want something colorful (high delta) and not pitch black (brightness > 30)
                    if (delta > bestColor.vibe && brightness > 30 && brightness < 220) {
                        bestColor = { r, g, b, vibe: delta };
                    }
                }

                resolve(`rgb(${bestColor.r}, ${bestColor.g}, ${bestColor.b})`);
            };
            img.onerror = () => resolve("#ff6b35");
        });
    },

    extractColorFromVideo: (video: HTMLVideoElement): string => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return "#ff6b35";

        canvas.width = 10;
        canvas.height = 10;
        context.drawImage(video, 0, 0, 10, 10);
        const data = context.getImageData(0, 0, 10, 10).data;

        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }
        r = Math.floor(r / (data.length / 4));
        g = Math.floor(g / (data.length / 4));
        b = Math.floor(b / (data.length / 4));

        return `rgb(${r}, ${g}, ${b})`;
    },

    applyVibe: (color: string) => {
        // Extract RGB values for the glow
        const match = color.match(/\d+/g);
        if (match && match.length >= 3) {
            const glow = `rgba(${match[0]}, ${match[1]}, ${match[2]}, 0.4)`;
            document.documentElement.style.setProperty("--color-primary-glow", glow);
        }
        
        document.documentElement.style.setProperty("--color-primary", color);
        document.documentElement.style.setProperty("--vibe-transition", "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)");
    },

    resetVibe: () => {
        document.documentElement.style.setProperty("--color-primary", "#ff6b35");
        document.documentElement.style.setProperty("--color-primary-glow", "rgba(255, 107, 53, 0.3)");
    }
};
