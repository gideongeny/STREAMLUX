import { FC, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiPlay, FiInfo, FiStar } from "react-icons/fi";
import axios from "../../shared/axios";
import { resizeImage } from "../../shared/utils";
import { Item } from "../../shared/types";

// ─── Hero Carousel ────────────────────────────────────────────────────────────
// Fully data-driven from TMDB trending API. No hardcoded static slides.
// Supports keyboard navigation, pause-on-hover, and graceful loading states.
// ─────────────────────────────────────────────────────────────────────────────

const TRANSITION_DURATION = 7000; // ms per slide

const HeroCarousel: FC = () => {
  const [slides, setSlides] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch trending content for slides ──────────────────────────────────────
  useEffect(() => {
    axios
      .get("/trending/all/week")
      .then((res) => {
        const results: Item[] = (Array.isArray(res.data?.results) ? res.data.results : [])
          .filter((i: Item) => i.backdrop_path && (i.title || i.name) && i.overview)
          .slice(0, 6);
        setSlides(results);
      })
      .catch(() => {/* silently degrade */})
      .finally(() => setIsLoading(false));
  }, []);

  // ── Auto-advance with progress bar ─────────────────────────────────────────
  useEffect(() => {
    if (slides.length === 0 || isPaused) return;
    setProgress(0);

    const step = 100 / (TRANSITION_DURATION / 100);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + step;
      });
    }, 100);

    const slideTimer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
      setProgress(0);
    }, TRANSITION_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideTimer);
    };
  }, [slides.length, index, isPaused]);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, [slides.length]);

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // ── Skeleton loading state ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden rounded-3xl bg-dark-lighten md:h-[420px] h-[260px] animate-pulse border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-lighten via-dark-lighten-2 to-dark-lighten animate-pulse" />
        <div className="absolute bottom-8 left-8 right-8 space-y-3">
          <div className="h-4 w-24 rounded-full bg-white/10" />
          <div className="h-8 w-64 rounded-lg bg-white/10" />
          <div className="h-4 w-96 rounded-full bg-white/5" />
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const current = slides[index];
  const mediaType = current.media_type === "movie" ? "movie" : "tv";
  const title = current.title || current.name || "";
  const genres = current.genre_ids?.slice(0, 3) ?? [];
  const rating = current.vote_average?.toFixed(1);
  const year = (current.release_date || current.first_air_date || "").slice(0, 4);

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl group border border-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] md:h-[420px] h-[260px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label={`Hero carousel — currently showing: ${title}`}
    >
      {/* ── Background Backdrop ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${resizeImage(current.backdrop_path || "", "w1280")})`,
          }}
        >
          {/* Multi-layer cinematic gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark/98 via-dark/70 to-dark/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/30" />
          {/* Film grain texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Content Layer ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${current.id}`}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative h-full flex flex-col justify-end pb-8 md:pb-10 px-6 md:px-12 max-w-2xl space-y-2 md:space-y-3"
        >
          {/* Rating + Year badges */}
          <div className="flex items-center gap-3 flex-wrap">
            {rating && (
              <span className="flex items-center gap-1 bg-primary/20 border border-primary/40 text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                <FiStar size={10} />
                {rating}
              </span>
            )}
            {year && (
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                {year}
              </span>
            )}
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
              {mediaType === "movie" ? "🎬 Film" : "📺 Series"}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white font-black text-2xl md:text-4xl leading-tight tracking-tight drop-shadow-2xl line-clamp-2">
            {title}
          </h2>

          {/* Overview */}
          <p className="text-gray-400 text-xs md:text-sm line-clamp-2 max-w-xl font-medium leading-relaxed hidden sm:block">
            {current.overview}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <Link
              to={`/${mediaType}/${current.id}/watch`}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 md:py-3 md:px-8 rounded-xl text-xs md:text-sm shadow-xl shadow-primary/25 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <FiPlay size={14} className="fill-white" />
              Watch Now
            </Link>
            <Link
              to={`/${mediaType}/${current.id}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-2.5 px-5 md:py-3 md:px-7 rounded-xl text-xs md:text-sm border border-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <FiInfo size={14} />
              More Info
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Progress Bars ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 px-6 md:px-12 pb-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIndex(i); setProgress(0); }}
            className="h-0.5 flex-1 rounded-full bg-white/20 overflow-hidden cursor-pointer hover:bg-white/30 transition-colors"
            aria-label={`Go to slide ${i + 1}`}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: i === index ? `${progress}%` : i < index ? "100%" : "0%",
              }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </button>
        ))}
      </div>

      {/* ── Slide Dots ──────────────────────────────────────────────────────── */}
      <div className="absolute top-5 right-5 flex gap-1.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIndex(i); setProgress(0); }}
            className={`rounded-full transition-all duration-400 ${i === index ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Arrow Navigation ────────────────────────────────────────────────── */}
      <button
        onClick={goPrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 shadow-lg"
        aria-label="Previous slide"
      >
        <FiChevronLeft size={22} />
      </button>
      <button
        onClick={goNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 shadow-lg"
        aria-label="Next slide"
      >
        <FiChevronRight size={22} />
      </button>

      {/* ── Pause indicator ─────────────────────────────────────────────────── */}
      {isPaused && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white/50 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 z-20 pointer-events-none">
          ⏸ Paused
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
