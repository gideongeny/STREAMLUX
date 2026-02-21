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

                canvas.width = 1;
                canvas.height = 1;
                context.drawImage(img, 0, 0, 1, 1);
                const data = context.getImageData(0, 0, 1, 1).data;
                const r = data[0];
                const g = data[1];
                const b = data[2];

                // Ensure color isn't too dark or too light for UI
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (brightness < 40) return resolve("#ff6b35"); // Default primary if too dark

                resolve(`rgb(${r}, ${g}, ${b})`);
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
        document.documentElement.style.setProperty("--color-primary", color);
        // Add a transition effect to the primary color
        document.documentElement.style.setProperty("--vibe-transition", "all 0.8s ease-in-out");
    },

    resetVibe: () => {
        document.documentElement.style.setProperty("--color-primary", "#ff6b35");
    }
};
