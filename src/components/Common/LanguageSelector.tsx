import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdLanguage, MdCheck, MdKeyboardArrowUp } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { safeStorage } from "../../utils/safeStorage";

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
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 p-3 rounded-2xl w-full bg-white/5 border border-white/5 hover:border-primary/30 group"
            >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MdLanguage size={24} className="text-primary" />
                </div>
                <div className="flex-1 text-left hidden md:block">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Language</p>
                    <p className="font-bold text-white leading-tight">{currentLang.label}</p>
                </div>
                <MdKeyboardArrowUp
                    size={20}
                    className={`transition-transform duration-300 hidden md:block ${isHovered ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-0 w-full mb-2 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                    >
                        <div className="max-h-[300px] overflow-y-auto scrollbar-hide py-2">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors ${i18n.language === lang.code ? "text-primary" : "text-gray-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{lang.flag}</span>
                                        <span className="font-bold text-sm">{lang.label}</span>
                                    </div>
                                    {i18n.language === lang.code && <MdCheck size={18} />}
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
