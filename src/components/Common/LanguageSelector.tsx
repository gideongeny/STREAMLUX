import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdLanguage, MdCheck, MdKeyboardArrowUp } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { safeStorage } from "../../utils/safeStorage";
import { apiCache } from "../../shared/apiCache";

const LANGUAGES = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "id", label: "Indonesian", flag: "🇮🇩" },
    { code: "pt", label: "Portuguese", flag: "🇵🇹" },
    { code: "tl", label: "Filipino", flag: "🇵🇭" },
    { code: "ur", label: "Urdu", flag: "🇵🇰" },
    { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
    { code: "zh", label: "Chinese", flag: "🇨🇳" },
];

interface LanguageSelectorProps {
    className?: string;
}

const LanguageSelector: FC<LanguageSelectorProps> = ({ className = "" }) => {
    const { i18n } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);

    const handleLanguageChange = async (code: string) => {
        await i18n.changeLanguage(code);
        safeStorage.set("streamlux_language", code);
        // Flush API cache so TMDB re-fetches everything in the new locale
        apiCache.clear();
        setIsHovered(false);
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: code }));
    };

    const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#555] hover:text-white hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-500 shrink-0"
                title="Select Language"
            >
                <MdLanguage size={16} className="md:w-5 md:h-5" />
            </button>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0a]/95 backdrop-blur-[40px] border border-white/[0.08] rounded-2xl shadow-cinema-card overflow-hidden z-[100]"
                    >
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar py-2">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full px-4 py-2.5 flex items-center justify-between transition-all duration-300 group ${i18n.language === lang.code
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-white/[0.05] text-gray-400 hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-base grayscale-[0.5] group-hover:grayscale-0 transition-all">{lang.flag}</span>
                                        <span className="font-bold text-xs tracking-wide">{lang.label}</span>
                                    </div>
                                    {i18n.language === lang.code && (
                                        <motion.div layoutId="activeCheck">
                                            <MdCheck size={16} className="text-primary" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSelector;
