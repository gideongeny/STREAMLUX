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
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 p-3 rounded-2xl w-full bg-white/5 border border-white/5 hover:border-primary/20 group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors relative z-10">
                    <MdLanguage size={22} className="text-primary" />
                </div>
                <div className="flex-1 text-left hidden md:block relative z-10">
                    <p className="text-[10px] uppercase tracking-[0.15em] font-black text-gray-500 mb-0.5">Locale</p>
                    <p className="font-bold text-white leading-tight flex items-center gap-2">
                        {currentLang.label}
                        <span className="text-sm opacity-60 uppercase">{currentLang.code}</span>
                    </p>
                </div>
                <MdKeyboardArrowUp
                    size={20}
                    className={`transition-transform duration-500 hidden md:block relative z-10 ${isHovered ? "rotate-0" : "rotate-180"}`}
                />
            </button>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 w-full mt-2 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
                    >
                        <div className="max-h-[350px] overflow-y-auto scrollbar-hide py-2 px-1">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-300 group ${i18n.language === lang.code
                                            ? "bg-primary/10 text-primary shadow-inner shadow-primary/5"
                                            : "hover:bg-white/5 text-gray-400 hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg grayscale-[0.5] group-hover:grayscale-0 transition-all">{lang.flag}</span>
                                        <span className="font-bold text-sm tracking-tight">{lang.label}</span>
                                    </div>
                                    {i18n.language === lang.code && (
                                        <motion.div layoutId="activeCheck">
                                            <MdCheck size={18} className="text-primary" />
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
