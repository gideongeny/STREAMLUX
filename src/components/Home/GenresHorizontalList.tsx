import { FC } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const GENRES = [
  // 🎬 MOVIE HIGHLIGHTS
  { id: 28, name: "Action", type: "movie", color: "from-red-500/20 to-orange-500/5" },
  { id: 12, name: "Adventure", type: "movie", color: "from-emerald-500/20 to-teal-500/5" },
  { id: 16, name: "Animation", type: "movie", color: "from-blue-500/20 to-cyan-500/5" },
  { id: 35, name: "Comedy", type: "movie", color: "from-yellow-500/20 to-amber-500/5" },
  { id: 80, name: "Crime", type: "movie", color: "from-slate-700/40 to-slate-900/10" },
  { id: 99, name: "Documentary", type: "movie", color: "from-green-600/20 to-emerald-800/5" },
  { id: 18, name: "Drama", type: "movie", color: "from-purple-500/20 to-pink-500/5" },
  { id: 10751, name: "Family", type: "movie", color: "from-sky-400/20 to-blue-600/5" },
  { id: 14, name: "Fantasy", type: "movie", color: "from-fuchsia-500/20 to-purple-600/5" },
  { id: 27, name: "Horror", type: "movie", color: "from-red-900/40 to-black/20" },
  { id: 10402, name: "Music", type: "movie", color: "from-pink-500/20 to-rose-500/5" },
  { id: 9648, name: "Mystery", type: "movie", color: "from-indigo-600/20 to-blue-800/5" },
  { id: 10749, name: "Romance", type: "movie", color: "from-rose-400/20 to-pink-600/5" },
  { id: 878, name: "Sci-Fi", type: "movie", color: "from-cyan-500/20 to-blue-500/5" },
  { id: 53, name: "Thriller", type: "movie", color: "from-slate-600/30 to-gray-800/10" },
];

const GenresHorizontalList: FC<{ currentTab: string }> = ({ currentTab }) => {
  const { t } = useTranslation();

  // Optionally filter by movie/tv based on currentTab, but mostly we'll show all or highlight ones.
  // For cinematic richness, we'll display them as glass pill buttons
  return (
    <div className="mb-8 overflow-hidden">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4 pt-2 px-2 mask-linear-fade">
        {GENRES.map((genre, index) => (
          <Link
            key={genre.id}
            to={`/explore?genre=${genre.id}&type=${genre.type}`}
          >
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex-shrink-0 px-6 py-3 rounded-full border border-white/[0.05] bg-gradient-to-br ${genre.color} hover:border-primary/40 backdrop-blur-md shadow-lg hover:shadow-neon-primary transition-all duration-300 group`}
            >
              <span className="text-white text-xs md:text-sm font-black uppercase tracking-[0.15em] group-hover:text-primary transition-colors">
                {t(genre.name)}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
      <style>{`
        .mask-linear-fade {
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </div>
  );
};

export default GenresHorizontalList;
