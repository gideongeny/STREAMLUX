import { FunctionComponent } from "react";
import { AiFillStar } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useNavigate } from "react-router-dom";
import { Item } from "../../shared/types";
import { resizeImage } from "../../shared/utils";
import Skeleton from "./Skeleton";

interface RightbarFilmsProps {
  films: Item[] | undefined;
  name: string;
  limitNumber?: number;
  isLoading: boolean;
  className?: string;
}

const RightbarFilms: FunctionComponent<RightbarFilmsProps> = ({
  films,
  name,
  limitNumber = 20,
  isLoading,
  className = "",
}) => {
  const navigate = useNavigate();

  return (
    <div className={className}>
      <p className="mb-6 text-xl font-medium flex justify-between items-center text-white">
        <span>{name}</span>
        <BsThreeDotsVertical size={20} />
      </p>

      <div className="flex flex-col gap-5">
        {isLoading ? (
          [...Array(3)].map((_, index) => (
            <div key={index} className="flex gap-4 items-center h-20 animate-pulse">
              <div className="shrink-0 w-24 h-16 bg-white/5 rounded-md" />
              <div className="flex-grow flex flex-col gap-2">
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          ))
        ) : (
          (films || []).slice(0, limitNumber).map((item) => (
            <Link
              to={`/${item.media_type || "movie"}/${item.id}`}
              key={item.id}
              className="flex gap-4 group items-center"
            >
              <div className="shrink-0 w-24 h-16 rounded-md overflow-hidden bg-dark-lighten shadow-lg">
                <LazyLoadImage
                  src={resizeImage(item.backdrop_path || item.poster_path || "", "w154")}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <div className="flex flex-col justify-center gap-1 overflow-hidden">
                <p className="text-white text-sm font-bold truncate group-hover:text-primary transition duration-300">
                  {item.title || item.name}
                </p>
                <div className="flex items-center gap-2">
                  {item.vote_average != null && item.vote_average > 0 && (
                    <div className="flex items-center gap-1 text-primary text-[10px] font-black">
                      <AiFillStar size={10} />
                      <span>{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">
                    {item.media_type || "Movie"}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <button
        onClick={() => navigate("/explore")}
        className="w-full py-3 bg-white/5 hover:bg-primary/20 text-white font-bold rounded-xl mt-6 transition duration-300 border border-white/5 hover:border-primary/30"
      >
        View All Content
      </button>
    </div>
  );
};

export default RightbarFilms;
