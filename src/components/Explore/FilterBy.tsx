import { motion, AnimatePresence } from "framer-motion";
import { FunctionComponent, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import FilterByDate from "./FilterByDate";
import FilterByGenres from "./FilterByGenres";
import FilterByRuntime from "./FilterByRuntime";
import FilterByRating from "./FilterByRating";
import FilterByRegion from "./FilterByRegion";

interface FilterByProps {
  currentTab: "movie" | "tv";
}

const FilterBy: FunctionComponent<FilterByProps> = ({ currentTab }) => {


  const [openFilter, setOpenFilter] = useState(true);

  return (
    <div

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
          <p className="text-lg mb-3 text-white/80">Region</p>
          <FilterByRegion />

          <p className="text-lg mb-3 mt-6 text-white/80">Genres</p>
          <FilterByGenres currentTab={currentTab} />

          <p className="text-lg mb-2 mt-6 text-white/80">Rating</p>
          <FilterByRating />

          <p className="text-lg mb-2 mt-6 text-white/80">Runtime</p>
          <FilterByRuntime />

          <p className="text-lg mb-2 mt-6 text-white/80">Release Dates</p>
          <FilterByDate />
        </div>
      )}
    </div>
  );
};

export default FilterBy;
