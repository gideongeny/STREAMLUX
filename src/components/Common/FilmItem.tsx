import { FunctionComponent } from "react";
import { AiFillStar, AiOutlineInfoCircle, AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaPlay } from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { Item } from "../../shared/types";
import { resizeImage } from "../../shared/utils";
import { useBookmark } from "../../hooks/useBookmark";

import { prefetchData } from "../../shared/axios";

interface FilmItemProps {
  item: Item;
  onClick?: (item: Item) => void;
}

const FilmItem: FunctionComponent<FilmItemProps> = ({ item, onClick }) => {
  const { isBookmarked, toggleBookmark } = useBookmark(item);

  const handleMouseEnter = () => {
    // Prefetch detail and watch data
    if (item.media_type === "movie") {
      prefetchData(`/movie/${item.id}`, { append_to_response: "videos,credits,recommendations,similar,external_ids" });
    } else if (item.media_type === "tv") {
      prefetchData(`/tv/${item.id}`, { append_to_response: "videos,credits,recommendations,similar,external_ids" });
    }
  };

  // Check if movie is unreleased
  const isUnreleased = item.media_type === "movie" && item.release_date
    ? new Date(item.release_date) > new Date()
    : false;

  const releaseDate = item.media_type === "movie" && item.release_date
    ? new Date(item.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const linkTo = item.youtubeId
    ? `/youtube/${item.youtubeId}`
    : item.media_type === "movie"
      ? `/movie/${item.id}`
      : item.media_type === "tv"
        ? `/tv/${item.id}`
        : `/`;

  const content = (
    <div
      onMouseEnter={handleMouseEnter}
      className="shadow-sm bg-dark-darken pb-2 rounded-md overflow-hidden hover:scale-105 hover:brightness-110 transition duration-300 relative group cursor-pointer h-full flex flex-col"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <LazyLoadImage
          alt="Poster film"
          src={
            item.youtubeId
              ? item.poster_path
              : item.media_type === "person"
                ? resizeImage(item.profile_path || "", "w342")
                : resizeImage(item.poster_path, "w342")
          }
          className="object-cover w-full h-full"
          effect="blur"
          style={{ height: '100%' }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-2 z-10 backdrop-blur-[2px]">
          {/* Action Buttons */}
          <div className="flex items-center gap-3 scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
            {/* Play Button */}
            {!isUnreleased && (
              <Link
                to={item.media_type === 'movie' ? `/movie/${item.id}/watch` : `/tv/${item.id}/watch`}
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all shadow-lg"
                title="Watch Now"
              >
                <FaPlay className="ml-1" size={14} />
              </Link>
            )}

            {/* Bookmark Button */}
            <button
              onClick={toggleBookmark}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center hover:scale-110 transition-all shadow-lg ${isBookmarked ? 'bg-primary border-primary text-white' : 'bg-black/40 border-white text-white hover:bg-white hover:text-black'}`}
              title={isBookmarked ? "Remove from List" : "Add to List"}
            >
              {isBookmarked ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
            </button>
          </div>

          {/* Info Button / More details */}
          <Link
            to={linkTo}
            className="text-white text-xs font-medium border border-white/50 px-3 py-1.5 rounded-full hover:bg-white hover:text-black transition-colors flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100"
          >
            <AiOutlineInfoCircle size={14} />
            <span>Details</span>
          </Link>
        </div>

        <div className="bg-primary/80 px-2 py-0.5 rounded-full absolute top-[5%] left-[8%] z-20 flex items-center gap-1 text-white text-[10px]">
          {item.vote_average > 0 ? item.vote_average.toFixed(1) : "HD"}
          {item.vote_average > 0 && <AiFillStar size={12} />}
        </div>

        {/* Language Badge */}
        {item.original_language && (
          <div className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full absolute top-[18%] left-[8%] z-20 text-white text-[9px] font-medium border border-white/20">
            {item.original_language.toUpperCase()}
          </div>
        )}

        {isUnreleased && (
          <div className="bg-amber-500 px-2 py-1 rounded-full absolute top-[5%] right-[8%] z-20 text-black text-xs font-semibold">
            Coming Soon
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-end px-2 pt-2 pb-1">
        <p className="whitespace-nowrap overflow-hidden text-ellipsis text-base text-gray-300 text-center group-hover:text-white transition duration-300 font-medium">
          {item.title || item.name}
        </p>

        {isUnreleased && releaseDate && (
          <p className="text-xs text-amber-400 text-center mt-0.5">
            {releaseDate}
          </p>
        )}
      </div>
    </div>
  );

  if (onClick && !item.youtubeId) {
    return (
      <div onClick={() => onClick(item)}>
        {content}
      </div>
    );
  }

  return (
    <Link to={linkTo} className="block h-full">
      {content}
    </Link>
  );
};

export default FilmItem;
