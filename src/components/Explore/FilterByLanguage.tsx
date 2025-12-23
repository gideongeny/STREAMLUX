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
            <select
                value={searchParams.get("with_original_language") || ""}
                onChange={handleLanguageChange}
                className="outline-none bg-dark-lighten-2 px-3 py-2 rounded-md text-white w-full appearance-none cursor-pointer"
            >
                {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FilterByLanguage;
