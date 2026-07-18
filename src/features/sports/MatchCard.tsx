import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SportMatch } from './types';
import { useNavigate } from 'react-router-dom';
import { SPORT_BACKDROP_BY_CATEGORY } from '../../services/sportsLiveFeeds';
import { format } from 'date-fns';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

interface MatchCardProps {
  match: SportMatch;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();

  const coverImage = useMemo(() => {
    const sportKey = (match.sport || match.sportsCategory || 'soccer').toLowerCase();
    const backdropKey =
      Object.keys(SPORT_BACKDROP_BY_CATEGORY).find((k) => sportKey.includes(k)) || 'default';
    const fallback = SPORT_BACKDROP_BY_CATEGORY[backdropKey] || SPORT_BACKDROP_BY_CATEGORY.default;
    return match.poster_path || match.thumb || match.fanart || fallback;
  }, [match]);

  const handleWatch = () => {
    const home = encodeURIComponent(match.homeTeam || '');
    const away = encodeURIComponent(match.awayTeam || '');
    const sport = encodeURIComponent(match.sport || match.sportsCategory || 'football');
    navigate(`/sports/arena/${match.id}?home=${home}&away=${away}&sport=${sport}`, {
      state: { matchData: match },
    });
  };

  const formattedTime = useMemo(() => {
    if (!match.kickoffTimeFormatted) return '';
    try {
      const date = new Date(match.kickoffTimeFormatted);
      if (isNaN(date.getTime())) return '';
      return format(date, 'hh:mm a');
    } catch {
      return '';
    }
  }, [match.kickoffTimeFormatted]);

  const sportName = match.sport || match.sportsCategory || 'Sport';
  const displayTitle = `${match.homeTeam} vs ${match.awayTeam}`;

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleWatch}
      aria-label={displayTitle}
      className="group relative w-full flex flex-col rounded-2xl overflow-hidden bg-[#111111] shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/5 cursor-pointer text-left transition-all"
    >
      {/* Top Image Section */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
        <img
          src={coverImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = SPORT_BACKDROP_BY_CATEGORY.default;
          }}
        />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Tags Row */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
          {/* Status Tag */}
          <div className="flex gap-2">
            {match.isLive ? (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-red-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>
                LIVE
              </span>
            ) : (
              formattedTime && (
                <span className="px-2 py-1 rounded-[4px] bg-black/70 text-white text-[10px] font-bold tracking-widest uppercase backdrop-blur-sm border border-white/10 shadow-sm">
                  {formattedTime}
                </span>
              )
            )}
          </div>

          {/* Right Icons (Simulated views/league tag) */}
          <div className="flex flex-col gap-1.5 items-end">
            {(match.watchfootyStreams?.length || match.streamUrl || match.isLive) ? (
               <span className="flex items-center gap-1 px-2 py-1 rounded-[4px] bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[9px] font-bold">
                 <MdOutlineRemoveRedEye size={12} />
                 {Math.floor(Math.random() * 50) + 10}k
               </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom Text Section */}
      <div className="p-4 flex flex-col gap-1.5 bg-gradient-to-b from-[#1a1a1a] to-[#111111]">
        <h3 className="text-white font-bold text-[14px] leading-snug line-clamp-2 pr-2">
          {displayTitle}
        </h3>
        <p className="text-[#888] text-[12px] font-medium tracking-wide flex items-center gap-1.5 mt-1">
          <span className="capitalize">{sportName}</span>
          {formattedTime && (
            <>
              <span className="text-white/20">|</span>
              <span>{formattedTime}</span>
            </>
          )}
        </p>
      </div>
    </motion.button>
  );
};

export default MatchCard;
