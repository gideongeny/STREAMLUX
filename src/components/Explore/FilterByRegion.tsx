import { FunctionComponent } from "react";
import { useSearchParams } from "react-router-dom";

interface Region {
    id: string;
    name: string;
    flag: string;
}

const regions: Region[] = [
    { id: "", name: "All Regions", flag: "🌍" },
    { id: "africa", name: "Africa", flag: "🌍" },
    { id: "nollywood", name: "Nollywood (Nigeria)", flag: "🇳🇬" },
    { id: "kenya", name: "Kenya", flag: "🇰🇪" },
    { id: "south africa", name: "South Africa", flag: "🇿🇦" },
    { id: "asia", name: "Asia", flag: "🌏" },
    { id: "korea", name: "South Korea", flag: "🇰🇷" },
    { id: "japan", name: "Japan", flag: "🇯🇵" },
    { id: "china", name: "China", flag: "🇨🇳" },
    { id: "india", name: "India (Bollywood)", flag: "🇮🇳" },
    { id: "philippines", name: "Philippines", flag: "🇵🇭" },
    { id: "thailand", name: "Thailand", flag: "🇹🇭" },
    { id: "latin", name: "Latin America", flag: "🌎" },
    { id: "mexico", name: "Mexico", flag: "🇲🇽" },
    { id: "brazil", name: "Brazil", flag: "🇧🇷" },
    { id: "middleeast", name: "Middle East", flag: "🕌" },
    { id: "turkey", name: "Turkey", flag: "🇹🇷" },
];

const FilterByRegion: FunctionComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentRegion = searchParams.get("region") || "";

    const handleRegionChange = (regionId: string) => {
        if (regionId === "") {
            searchParams.delete("region");
        } else {
            searchParams.set("region", regionId);
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                    <button
                        key={region.id}
                        onClick={() => handleRegionChange(region.id)}
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
