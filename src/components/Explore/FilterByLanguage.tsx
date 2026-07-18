import React, { FunctionComponent } from "react";
import { useSearchParams } from "react-router-dom";

const FilterByLanguage: FunctionComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const languages = [
        { label: "Default", value: "" },
        { label: "English", value: "en" },
        { label: "Spanish", value: "es" },
        { label: "French", value: "fr" },
        { label: "German", value: "de" },
        { label: "Chinese", value: "zh" },
        { label: "Japanese", value: "ja" },
        { label: "Korean", value: "ko" },
        { label: "Hindi", value: "hi" },
        { label: "Arabic", value: "ar" },
        { label: "Swahili", value: "sw" },
        { label: "Indonesian", value: "id" },
        { label: "Portuguese", value: "pt" },
        { label: "Filipino", value: "tl" },
        { label: "Urdu", value: "ur" },
        { label: "Chinese", value: "zh" },
        { label: "Turkish", value: "tr" },
    ];

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) {
            searchParams.delete("with_original_language");
        } else {
            searchParams.set("with_original_language", value);
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-2 mt-4">
            <label className="text-white/70 text-sm">Original Language</label>
            <div className="relative w-full">
                <select
                    value={searchParams.get("with_original_language") || ""}
                    onChange={handleLanguageChange}
                    className="outline-none bg-dark-lighten px-4 py-2.5 rounded-xl text-white w-full appearance-none cursor-pointer border border-white/5 hover:border-white/20 transition-all focus:ring-2 focus:ring-primary/50"
                >
                    {languages.map((lang) => (
                        <option key={lang.value} value={lang.value} className="bg-dark text-white">
                            {lang.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default FilterByLanguage;
