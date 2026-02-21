import { toast } from "react-toastify";
import { safeStorage } from "../utils/safeStorage";

export const themes = [
    { name: "Classic", color: "#FF4500", gradient: "from-orange-500 to-red-600" },
    { name: "Deep Sea", color: "#00CED1", gradient: "from-blue-600 to-cyan-400" },
    { name: "Nebula", color: "#8A2BE2", gradient: "from-purple-600 to-pink-500" },
    { name: "Royal", color: "#FFD700", gradient: "from-yellow-400 to-orange-400" },
];

export const themeService = {
    applyTheme: (color: string) => {
        // Update CSS variable
        document.documentElement.style.setProperty("--color-primary", color);
        safeStorage.set("theme_primary_color", color);

        // Also update Tailwind's primary color by injecting a style tag
        let styleTag = document.getElementById("dynamic-primary-color");
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "dynamic-primary-color";
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = `
            :root {
                --color-primary: ${color};
            }
            .text-primary { 
                color: ${color} !important; 
            }
            .bg-primary { 
                background-color: ${color} !important; 
            }
            .border-primary { 
                border-color: ${color} !important; 
            }
            .ring-primary {
                --tw-ring-color: ${color} !important;
            }
            .from-primary {
                --tw-gradient-from: ${color} !important;
            }
            .to-primary {
                --tw-gradient-to: ${color} !important;
            }
            .accent-primary {
                accent-color: ${color} !important;
            }
        `;
    },

    setThemeByName: (name: string) => {
        const theme = themes.find((t) => t.name === name);
        if (theme) {
            themeService.applyTheme(theme.color);
            toast.success(`Theme switched to ${name}!`, {
                position: "top-right",
                autoClose: 2000,
            });
        }
    },

    initialize: () => {
        const savedColor = safeStorage.get("theme_primary_color");
        if (savedColor) {
            themeService.applyTheme(savedColor);
        }
    },
};
