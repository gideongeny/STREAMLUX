import React, { FunctionComponent } from "react";
import { useSearchParams } from "react-router-dom";

const FilterByStatus: FunctionComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const statuses = [
        { label: "All", value: "" },
        { label: "Released", value: "released" },
        { label: "Upcoming", value: "upcoming" },
    ];

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) {
            searchParams.delete("status");
        } else {
            searchParams.set("status", value);
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-2 mt-4">
            <label className="text-white/70 text-sm">Status</label>
            <select
                value={searchParams.get("status") || ""}
                onChange={handleStatusChange}
                className="outline-none bg-dark-lighten-2 px-3 py-2 rounded-md text-white w-full appearance-none cursor-pointer"
            >
                {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FilterByStatus;
