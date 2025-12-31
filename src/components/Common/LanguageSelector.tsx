import { FC } from "react";
import { useTranslation } from "react-i18next";
import { MdLanguage } from "react-icons/md";

const LANGUAGES = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "id", label: "Indonesian", flag: "🇮🇩" },
    { code: "pt", label: "Portuguese", flag: "🇵🇹" },
    { code: "tl", label: "Filipino", flag: "🇵🇭" },
    { code: "ur", label: "Urdu", flag: "🇵🇰" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
];

interface LanguageSelectorProps {
    className?: string;
}

const LanguageSelector: FC<LanguageSelectorProps> = ({ className = "" }) => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        localStorage.setItem("streamlux_language", code);
    };

    return (
        <div className={`relative group ${className}`}>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg w-full">
                <MdLanguage size={24} />
                <span className="font-medium flex-1 text-left hidden md:block">
                    {LANGUAGES.find((l) => l.code === i18n.language)?.label || "Language"}
                </span>
            </button>

            {/* Dropdown (Hover) */}
            <div className="absolute top-full left-0 mt-2 w-48 bg-dark-lighten rounded-xl shadow-xl p-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform origin-top-left z-50 border border-gray-700">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${i18n.language === lang.code
                            ? "bg-primary text-white"
                            : "text-gray-300 hover:bg-white/10"
                            }`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSelector;
