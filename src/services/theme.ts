import { toast } from "react-toastify";
import { safeStorage } from "../utils/safeStorage";

export const themes = [
    { name: "Classic", color: "#ff6b35", glow: "rgba(255, 107, 53, 0.3)" },
    { name: "Oscar Gold", color: "#FFD700", glow: "rgba(255, 215, 0, 0.4)" },
    { name: "Neon Pulse", color: "#BC13FE", glow: "rgba(188, 19, 254, 0.5)" },
    { name: "Deep Sea", color: "#00CED1", glow: "rgba(0, 206, 209, 0.3)" },
    { name: "Emerald", color: "#10b981", glow: "rgba(16, 185, 129, 0.3)" },
];

export const themeService = {
    applyTheme: (color: string, glow?: string) => {
        const finalGlow = glow || `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.3)`;

        document.documentElement.style.setProperty("--color-primary", color);
        document.documentElement.style.setProperty("--color-primary-glow", finalGlow);
        safeStorage.set("theme_primary_color", color);
        safeStorage.set("theme_primary_glow", finalGlow);

        let styleTag = document.getElementById("dynamic-primary-color");
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "dynamic-primary-color";
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = `
            :root {
                --color-primary: ${color};
                --color-primary-glow: ${finalGlow};
            }
            .text-primary { color: ${color} !important; }
            .bg-primary { background-color: ${color} !important; }
            .border-primary { border-color: ${color} !important; }
            .shadow-primary { shadow-color: ${finalGlow} !important; }
        `;
    },

    setThemeByName: (name: string) => {
        const theme = themes.find((t) => t.name === name);
        if (theme) {
            themeService.applyTheme(theme.color, theme.glow);
            safeStorage.set("theme_name", name);
            toast.success(`Atmosphere switched to ${name}!`, {
                position: "top-right",
                autoClose: 2000,
            });
        }
    },

    initialize: () => {
        const savedColor = safeStorage.get("theme_primary_color");
        const savedGlow = safeStorage.get("theme_primary_glow");
        if (savedColor) {
            themeService.applyTheme(savedColor, savedGlow || undefined);
        }
    },
};
