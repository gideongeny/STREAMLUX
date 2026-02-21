import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { FunctionComponent, MouseEvent } from "react";
import { AiFillStar } from "react-icons/ai";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { Item } from "../../shared/types";
import { hapticImpact, resizeImage } from "../../shared/utils";
import { useState, useEffect, useRef } from "react";
import axios from "../../shared/axios";

interface FilmItemProps {
  item: Item;
}

const FilmItem: FunctionComponent<FilmItemProps> = ({ item }) => {
  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(async () => {
      setIsHovered(true);
      if (!trailerKey && !item.isYouTube) {
        try {
          const res = await axios.get(`/${item.media_type}/${item.id}/videos`);
          const trailer = res.data.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
          if (trailer) setTrailerKey(trailer.key);
        } catch (err) {
          console.error("Failed to fetch hover trailer:", err);
        }
      }
    }, 600);
  };

  // Check if movie is unreleased
  const isUnreleased = item.media_type === "movie" && item.release_date
    ? new Date(item.release_date) > new Date()
    : false;

  const releaseDate = item.media_type === "movie" && item.release_date
    ? new Date(item.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <Link
      to={
        item.isYouTube && item.youtubeId
          ? `/youtube/${item.youtubeId}`
          : item.media_type === "movie"
            ? `/movie/${item.id}`
            : item.media_type === "tv"
              ? `/tv/${item.id}`
              : `/`
      }
      onClick={() => hapticImpact()}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="shadow-sm bg-dark-darken pb-2 rounded-md overflow-hidden transition-all duration-300 relative group hover:shadow-[0_0_25px_rgba(255,107,53,0.35)] tw-focus-ring"
      >
        {/* Moving Glossy Highlight (Holographic Glint) */}
        <motion.div
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
            left: useTransform(mouseXSpring, [-0.5, 0.5], ["-100%", "100%"]),
            top: useTransform(mouseYSpring, [-0.5, 0.5], ["-100%", "100%"]),
            rotate: 45,
          }}
          className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-[2]"
        />

        {/* Depth Aura (Reflective Glow) */}
        <motion.div
          style={{
            background: "radial-gradient(circle at center, var(--color-primary) 0%, transparent 70%)",
            opacity: useTransform(mouseXSpring, [-0.5, 0.5], [0.1, 0.3]),
          }}
          className="absolute inset-0 pointer-events-none z-10 blur-3xl group-hover:block hidden"
        />

        {/* Video Preview Overlay */}
        <AnimatePresence>
          {isHovered && (trailerKey || item.isYouTube) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black overflow-hidden pointer-events-none"
            >
              <iframe
                src={`https://www.youtube.com/embed/${item.isYouTube ? item.youtubeId : trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${item.isYouTube ? item.youtubeId : trailerKey}&rel=0&modestbranding=1`}
                className="w-full h-full scale-[1.5] object-cover"
                allow="autoplay; encrypted-media"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-60" />
            </motion.div>
          )}
        </AnimatePresence>

        <LazyLoadImage
          alt="Poster film"
          src={
            item.media_type === "person"
              ? resizeImage(item.profile_path || "", "w342")
              : resizeImage(item.poster_path, "w342")
          }
          className="object-cover"
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
        <div className="bg-primary px-2 py-1 rounded-full absolute top-[5%] left-[8%] z-20 flex items-center gap-1 text-white text-xs">
          {item.vote_average?.toFixed(1)}
          <AiFillStar size={15} />
        </div>
        {isUnreleased && (
          <div className="bg-amber-500 px-2 py-1 rounded-full absolute top-[5%] right-[8%] z-20 text-black text-xs font-semibold">
            Coming Soon
          </div>
        )}
        {item.vote_average > 7.5 && !isUnreleased && (
          <motion.div
            animate={{ boxShadow: ["0 0 0px #ff6b35", "0 0 15px #ff6b35", "0 0 0px #ff6b35"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-black/80 backdrop-blur-md border border-primary/50 text-white px-3 py-1 rounded-full absolute top-[5%] right-[5%] z-20 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Trending
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
};

export default FilmItem;
