import { FunctionComponent, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import FilterByDate from "./FilterByDate";
import FilterByGenres from "./FilterByGenres";
import FilterByRuntime from "./FilterByRuntime";
import FilterByRating from "./FilterByRating";
import FilterByLanguage from "./FilterByLanguage";
import FilterByStatus from "./FilterByStatus";

interface FilterByProps {
  currentTab: string;
}

const FilterBy: FunctionComponent<FilterByProps> = ({ currentTab }) => {
  const [openFilter, setOpenFilter] = useState(true);

  return (
    <div
      // @ts-ignore
      className="bg-dark-lighten rounded-md shadow-md px-4 py-3 mt-8"
    >
      <div className="flex justify-between items-center text-white pb-3">
        <p className="text-lg">Filter</p>
        <button onClick={() => setOpenFilter((prev) => !prev)}>
          {openFilter && <FiChevronDown size={20} />}
          {!openFilter && <FiChevronRight size={20} />}
        </button>
      </div>
      {openFilter && (
        <div className="py-3 border-t border-dark-darken">
          <p className="text-lg mb-4 text-white/80 border-b border-white/5 pb-1">Genres</p>
          <FilterByGenres currentTab={currentTab} />

          <p className="text-lg mb-2 mt-8 text-white/80 border-b border-white/5 pb-1">Rating</p>
          <FilterByRating />

          <p className="text-lg mb-2 mt-8 text-white/80 border-b border-white/5 pb-1">Language</p>
          <FilterByLanguage />

          <p className="text-lg mb-2 mt-8 text-white/80 border-b border-white/5 pb-1">Status</p>
          <FilterByStatus />

          <p className="text-lg mb-2 mt-8 text-white/80 border-b border-white/5 pb-1">Runtime</p>
          <FilterByRuntime />

          <p className="text-lg mb-2 mt-8 text-white/80 border-b border-white/5 pb-1">Release Dates</p>
          <FilterByDate />
        </div>
      )}
    </div>
  );
};

export default FilterBy;
