import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { MdStar, MdStarBorder, MdStarHalf } from 'react-icons/md';
import { safeStorage } from '../../utils/safeStorage';

interface StarRatingProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  tmdbRating?: number; // 0-10
  compact?: boolean;
}

const StarRating: FC<StarRatingProps> = ({ mediaId, mediaType, tmdbRating, compact = false }) => {
  const storageKey = `rating_${mediaType}_${mediaId}`;
  const savedRating = safeStorage.getParsed<number>(storageKey, 0);

  const [userRating, setUserRating] = useState<number>(savedRating);
  const [hovered, setHovered] = useState<number>(0);
  const [showThanks, setShowThanks] = useState(false);

  const displayRating = hovered || userRating;
  const tmdbStars = tmdbRating ? tmdbRating / 2 : 0; // convert 10-scale to 5-star

  const handleRate = (star: number) => {
    setUserRating(star);
    safeStorage.set(storageKey, String(star));
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 2000);
  };

  const renderTmdbStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(tmdbStars)) {
        stars.push(<MdStar key={i} className="text-yellow-400" size={compact ? 12 : 14} />);
      } else if (i - tmdbStars < 1 && i - tmdbStars > 0) {
        stars.push(<MdStarHalf key={i} className="text-yellow-400" size={compact ? 12 : 14} />);
      } else {
        stars.push(<MdStarBorder key={i} className="text-gray-600" size={compact ? 12 : 14} />);
      }
    }
    return stars;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">{renderTmdbStars()}</div>
        {tmdbRating && (
          <span className="text-[10px] text-gray-400 font-semibold">{tmdbRating.toFixed(1)}</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* TMDB Rating */}
      {tmdbRating !== undefined && (
        <div className="flex items-center gap-2">
          <div className="flex">{renderTmdbStars()}</div>
          <span className="text-xs text-gray-400">{tmdbRating.toFixed(1)}<span className="text-gray-600">/10</span></span>
        </div>
      )}

      {/* User Rating */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Your Rating</p>
        <div className="flex items-center gap-1 relative">
          {[1, 2, 3, 4, 5].map(star => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleRate(star)}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              className="transition-all duration-150"
            >
              {star <= displayRating ? (
                <MdStar className="text-yellow-400" size={20} />
              ) : (
                <MdStarBorder className="text-gray-600" size={20} />
              )}
            </motion.button>
          ))}
          {showThanks && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-primary font-semibold ml-2"
            >
              ✓ Rated!
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StarRating;
