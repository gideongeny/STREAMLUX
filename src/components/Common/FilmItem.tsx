import { FunctionComponent } from "react";
import { AiFillStar } from "react-icons/ai";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { Item } from "../../shared/types";
import { resizeImage } from "../../shared/utils";

interface FilmItemProps {
  item: Item;
  onClick?: (item: Item) => void;
}

const FilmItem: FunctionComponent<FilmItemProps> = ({ item, onClick }) => {
  // Check if movie is unreleased
  const isUnreleased = item.media_type === "movie" && item.release_date
    ? new Date(item.release_date) > new Date()
    : false;

  const releaseDate = item.media_type === "movie" && item.release_date
    ? new Date(item.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const content = (
    <div className="shadow-sm bg-dark-darken pb-2 rounded-md overflow-hidden hover:scale-105 hover:brightness-110 transition duration-300 relative group cursor-pointer">
      <LazyLoadImage
        alt="Poster film"
        src={
          item.youtubeId
            ? item.poster_path
            : item.media_type === "person"
              ? resizeImage(item.profile_path || "", "w342")
              : resizeImage(item.poster_path, "w342")
        }
        className="object-cover w-full aspect-[2/3]"
        effect="blur"
      />
      <p className="whitespace-nowrap overflow-hidden text-ellipsis text-base text-gray-300 mt-1 text-center px-2 group-hover:text-white transition duration-300">
        {item.title || item.name}
      </p>
      {isUnreleased && releaseDate && (
        <p className="text-xs text-amber-400 text-center px-2 mt-1">
          Releases: {releaseDate}
        </p>
      )}
      {!item.youtubeId && (
        <div className="bg-primary px-2 py-1 rounded-full absolute top-[5%] left-[8%] z-20 flex items-center gap-1 text-white text-xs">
          {item.vote_average?.toFixed(1)}
          <AiFillStar size={15} />
        </div>
      )}
      {item.youtubeId && (
        <div className="bg-red-600 px-2 py-0.5 rounded absolute top-[5%] left-[8%] z-20 flex items-center gap-1 text-white text-[10px] font-bold uppercase">
          YouTube
        </div>
      )}
      {isUnreleased && (
        <div className="bg-amber-500 px-2 py-1 rounded-full absolute top-[5%] right-[8%] z-20 text-black text-xs font-semibold">
          Coming Soon
        </div>
      )}
    </div>
  );

  if (onClick || item.youtubeId) {
    return (
      <div onClick={() => onClick ? onClick(item) : null}>
        {content}
      </div>
    );
  }

  return (
    <Link
      to={
        item.media_type === "movie"
          ? `/movie/${item.id}`
          : item.media_type === "tv"
            ? `/tv/${item.id}`
            : `/`
      }
    >
      {content}
    </Link>
  );
};

export default FilmItem;
