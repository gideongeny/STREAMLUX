import React from 'react';
import { motion } from 'framer-motion';
import { SportMatch } from './types';
import { useNavigate } from 'react-router-dom';

interface MatchCardProps {
  match: SportMatch;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to the player page
    // Using dummy leagueId if not available to match existing route pattern
    const leagueId = match.leagueId || 'general';
    const matchId = match.id;
    console.log(`Navigating to match ${matchId} with link: ${match.link}`);
    navigate(`/sports/${leagueId}/${matchId}/watch`, { state: { streamUrl: match.link } });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/5 bg-[#0F0F0F]/60 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 shadow-2xl"
    >
      {/* Background Glows */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-[60px] group-hover:bg-primary/20 transition-colors" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 blur-[60px]" />

      <div className="p-6 h-full flex flex-col justify-between">
        {/* Header: Sport & Status */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-widest text-[#888]">
              {match.sport || 'Sports'} • {match.leagueName || 'League'}
            </span>
          </div>
          {match.isLive ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black text-red-500 tracking-tighter uppercase">LIVE</span>
            </div>
          ) : (
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {match.kickoffTimeFormatted}
            </div>
          )}
        </div>

        {/* Teams & Logos */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className={`flex flex-col items-center gap-3 flex-1 ${match.isCompetition ? 'w-full' : ''}`}>
            <div className="w-16 h-16 rounded-full bg-white/5 p-2 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
              <img 
                src={match.homeTeamLogo || '/placeholder.svg'} 
                alt={match.homeTeam} 
                className="w-full h-full object-contain"
                onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
              />
            </div>
            <span className={`text-sm font-bold text-white text-center line-clamp-1 ${match.isCompetition ? 'text-lg' : ''}`}>{match.homeTeam}</span>
          </div>

          {!match.isCompetition && (
            <>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xl font-black text-white/20 italic tracking-tighter">VS</span>
                    {match.isLive && (
                    <div className="text-xl font-bold text-primary tabular-nums">
                        {match.homeScore ?? 0}:{match.awayScore ?? 0}
                    </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 rounded-full bg-white/5 p-2 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                    <img 
                        src={match.awayTeamLogo || '/placeholder.svg'} 
                        alt={match.awayTeam} 
                        className="w-full h-full object-contain"
                        onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                    />
                    </div>
                    <span className="text-sm font-bold text-white text-center line-clamp-1">{match.awayTeam}</span>
                </div>
            </>
          )}
          
          {match.isCompetition && match.awayTeam && (
              <div className="flex flex-col items-center justify-center flex-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Location</span>
                  <span className="text-xs font-bold text-gray-400 text-center line-clamp-2">{match.awayTeam}</span>
              </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-medium uppercase truncate max-w-[120px]">
                {match.venue || 'Arena'}
            </span>
            <span className="text-[10px] text-primary font-bold group-hover:translate-x-1 transition-transform">
                WATCH NOW →
            </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;
