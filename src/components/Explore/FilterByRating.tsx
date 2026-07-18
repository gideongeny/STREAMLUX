import React, { FunctionComponent } from "react";
import { useSearchParams } from "react-router-dom";

const FilterByRating: FunctionComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "0") {
            searchParams.delete("vote_average.gte");
        } else {
            searchParams.set("vote_average.gte", value);
        }
        setSearchParams(searchParams);
    };

    const currentRating = searchParams.get("vote_average.gte") || "0";

    return (
        <div className="flex flex-col gap-2 mt-4">
            <div className="flex justify-between items-center">
                <label className="text-white/70">Minimum Rating: {currentRating}</label>
            </div>
            <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={currentRating}
                onChange={handleRatingChange}
                className="w-full h-2 bg-dark-lighten-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
                <span>0</span>
                <span>5</span>
                <span>10</span>
            </div>
        </div>
    );
};

export default FilterByRating;
