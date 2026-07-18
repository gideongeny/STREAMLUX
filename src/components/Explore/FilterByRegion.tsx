import { FunctionComponent } from "react";
import { useSearchParams } from "react-router-dom";

interface Region {
    id: string;
    name: string;
    flag: string;
    defaultType?: "movie" | "tv";
}

const regions: Region[] = [
    { id: "", name: "All Regions", flag: "🌍" },
    { id: "africa", name: "Africa", flag: "🌍", defaultType: "movie" },
    { id: "nollywood", name: "Nollywood (Nigeria)", flag: "🇳🇬", defaultType: "movie" },
    { id: "kenya", name: "Kenya", flag: "🇰🇪", defaultType: "movie" },
    { id: "south africa", name: "South Africa", flag: "🇿🇦", defaultType: "movie" },
    { id: "asia", name: "Asia", flag: "🌏" },
    { id: "korea", name: "South Korea", flag: "🇰🇷", defaultType: "tv" },
    { id: "japan", name: "Japan", flag: "🇯🇵", defaultType: "tv" },
    { id: "china", name: "China", flag: "🇨🇳", defaultType: "tv" },
    { id: "india", name: "India (Bollywood)", flag: "🇮🇳", defaultType: "movie" },
    { id: "philippines", name: "Philippines", flag: "🇵🇭", defaultType: "tv" },
    { id: "thailand", name: "Thailand", flag: "🇹🇭", defaultType: "tv" },
    { id: "latin", name: "Latin America", flag: "🌎", defaultType: "tv" },
    { id: "mexico", name: "Mexico", flag: "🇲🇽", defaultType: "tv" },
    { id: "brazil", name: "Brazil", flag: "🇧🇷", defaultType: "tv" },
    { id: "middleeast", name: "Middle East", flag: "🕌", defaultType: "movie" },
    { id: "turkey", name: "Turkey", flag: "🇹🇷", defaultType: "tv" },
];

const FilterByRegion: FunctionComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentRegion = searchParams.get("region") || "";

    const handleRegionChange = (region: Region) => {
        if (region.id === "") {
            searchParams.delete("region");
        } else {
            searchParams.set("region", region.id);
            if (region.defaultType) {
                searchParams.set("type", region.defaultType);
            }
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                    <button
                        key={region.id}
                        onClick={() => handleRegionChange(region)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-300 flex items-center gap-1.5 ${currentRegion === region.id
                                ? "bg-primary text-white"
                                : "bg-dark-lighten-2 text-gray-300 hover:bg-gray-700"
                            }`}
                    >
                        <span>{region.flag}</span>
                        <span>{region.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterByRegion;
