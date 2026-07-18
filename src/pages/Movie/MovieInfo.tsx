import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useParams, Link } from "react-router-dom";
import FilmDetail from "../../components/FilmDetail/FilmDetail";
import SEO from "../../components/Common/SEO";
import { getMovieFullDetail } from "../../services/movie";
import { DetailMovie, FilmInfo } from "../../shared/types";
import { useTranslation } from "react-i18next";
import { MdMovieFilter, MdSearch, MdHome } from "react-icons/md";
import { motion } from "framer-motion";
import AdBanner from "../../components/Ads/AdBanner";

const MovieInfo: FC = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isYouTube = id?.length === 11 || id?.startsWith('yt-');

  const { data, isError, isLoading } = useQuery<FilmInfo, Error>(
    ["movieDetail", id, i18n.language],
    () => getMovieFullDetail(id as string)
  );
  
  if (isError) {
    return (
      <div className="min-h-screen bg-cinema-black flex items-center justify-center px-6 relative overflow-hidden">
        {/* Cinematic ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-md relative z-10 sl-glass-card p-10 shadow-premium-lg"
        >
          <div className="w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-cinema-glow">
            <MdMovieFilter size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight uppercase sl-text-gradient">Content Not Available</h1>
          <p className="text-[#888] text-sm mb-10 leading-relaxed font-medium">
            This movie isn't available right now. It may be region-restricted, removed, or still being added to our database.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link
              to="/search"
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-accent-ember px-6 py-3.5 rounded-full text-white text-[11px] font-bold uppercase tracking-widest hover:scale-105 hover:shadow-neon-primary transition-all duration-500"
            >
              <MdSearch size={18} />
              Search Titles
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-white/[0.03] border border-white/[0.06] px-6 py-3.5 rounded-full text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-500"
            >
              <MdHome size={18} />
              Go Home
            </Link>
          </div>
          <p className="text-[#555] text-[10px] font-bold uppercase tracking-widest mt-10">
            ID: {id}
          </p>
        </motion.div>
      </div>
    );
  }

  if (isLoading || !data) return null;

  return (
    <>
      <SEO
        title={(data?.detail as DetailMovie)?.title}
        description={data?.detail?.overview}
        image={data?.detail?.poster_path ? `https://image.tmdb.org/t/p/w500${data?.detail?.poster_path}` : undefined}
      />
      <div className="pt-20">
        <AdBanner position="details" />
      </div>
      <FilmDetail {...data} />
    </>
  );
};

export default MovieInfo;

