import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { FunctionComponent, MouseEvent, memo, useState, useEffect, useRef } from "react";
import { AiFillStar } from "react-icons/ai";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { Item } from "../../shared/types";
import { hapticImpact, resizeImage } from "../../shared/utils";
import axios from "../../shared/axios";
import { Capacitor } from "@capacitor/core";

interface FilmItemProps {
  item: Item;
}

const FilmItem: FunctionComponent<FilmItemProps> = ({ item }) => {
  const isNative = Capacitor.isNativePlatform();

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [isHovered, setIsHovered] = useState(false);
  const [isFullyHovered, setIsFullyHovered] = useState(false); // Used for tilt
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const tiltTimer = useRef<NodeJS.Timeout | null>(null);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const glintLeft = useTransform(mouseXSpring, [-0.5, 0.5], ["-100%", "100%"]);
  const glintTop = useTransform(mouseYSpring, [-0.5, 0.5], ["-100%", "100%"]);
  const auraOpacity = useTransform(mouseXSpring, [-0.5, 0.5], [0.1, 0.3]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isNative) return; // Disable tilt tracking on native/mobile

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
    setIsFullyHovered(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (tiltTimer.current) clearTimeout(tiltTimer.current);
  };

  const handleMouseEnter = () => {
    // Phase 1: Simple hover (for glint/border)
    setIsHovered(true);

    // Phase 2: Detailed hover (for video/tilt) - Delayed to prevent scroll lag
    hoverTimer.current = setTimeout(async () => {
      if (!trailerKey && !item.isYouTube) {
        try {
          const res = await axios.get(`/${item.media_type}/${item.id}/videos`);
          const trailer = res.data.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
          if (trailer) setTrailerKey(trailer.key);
        } catch (err) { }
      }
      setIsFullyHovered(true);
    }, 800);
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
      className="block w-full"
    >
      <motion.div
        style={{
          rotateX: !isNative && isFullyHovered ? rotateX : 0,
          rotateY: !isNative && isFullyHovered ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        layoutId={`item-${item.id}`}
        className="shadow-sm bg-dark-darken pb-2 rounded-md overflow-hidden transition-all duration-300 relative group hover:shadow-[0_0_25px_rgba(255,107,53,0.35)] tw-focus-ring will-change-transform"
      >
        {/* Moving Glossy Highlight - Disabled on native for perf */}
        {!isNative && (
          <motion.div
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
              left: glintLeft,
              top: glintTop,
              rotate: 45,
            }}
            className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-[2]"
          />
        )}

        {/* Depth Aura (Reflective Glow) */}
        <motion.div
          style={{
            background: "radial-gradient(circle at center, var(--color-primary) 0%, transparent 70%)",
            opacity: auraOpacity,
          }}
          className="absolute inset-0 pointer-events-none z-10 blur-3xl group-hover:block hidden"
        />

        {/* Video Preview Overlay */}
        <AnimatePresence>
          {isFullyHovered && (trailerKey || item.isYouTube) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black overflow-hidden pointer-events-none"
            >
              <iframe
                src={`https://www.youtube.com/embed/${item.isYouTube ? item.youtubeId : trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${item.isYouTube ? item.youtubeId : trailerKey}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
                className="w-full h-full scale-[1.5] object-cover"
                allow="autoplay; encrypted-media"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-60" />
            </motion.div>
          )}
        </AnimatePresence>

        <LazyLoadImage
          alt={item.title || item.name}
          src={
            item.media_type === "person"
              ? resizeImage(item.profile_path || "", "w342")
              : item.poster_path
                ? resizeImage(item.poster_path, "w342")
                : "https://via.placeholder.com/342x513?text=No+Poster"
          }
          className="object-cover w-full aspect-[2/3]"
          effect="blur"
          threshold={300}
          onError={(e: any) => {
            e.target.src = "https://via.placeholder.com/342x513?text=No+Poster";
          }}
        />
        <p className="whitespace-nowrap overflow-hidden text-ellipsis text-[13px] font-medium text-gray-300 mt-2 text-center px-2 group-hover:text-white transition duration-300">
          {item.title || item.name}
        </p>

        <div className="bg-primary/90 backdrop-blur-sm px-1.5 py-0.5 rounded absolute top-[5%] left-[8%] z-20 flex items-center gap-0.5 text-white text-[10px] font-bold">
          {item.vote_average?.toFixed(1) || "7.0"}
          <AiFillStar size={10} />
        </div>

        {item.vote_average > 8 && !isUnreleased && (
          <div className="bg-black/60 backdrop-blur-md border border-primary/30 text-white px-2 py-0.5 rounded absolute top-[5%] right-[5%] z-20 text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
            Top Hit
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default memo(FilmItem, (prev, next) => {
  return prev.item.id === next.item.id;
});
