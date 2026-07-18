import React from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Track, setTrack, play } from '../../store/slice/musicSlice';
import { FiPlay } from 'react-icons/fi';

interface UpNextQueueProps {
  queue: Track[];
  currentTrack: Track;
}

const UpNextQueue: React.FC<UpNextQueueProps> = ({ queue, currentTrack }) => {
  const dispatch = useDispatch();
  
  const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
  const upcomingTracks = queue.slice(currentIndex + 1);

  if (queue.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <p className="text-gray-500 font-bold tracking-widest uppercase">Queue is empty</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Up Next</h2>
        <p className="text-sm text-primary font-bold tracking-widest uppercase mt-1">{upcomingTracks.length} Tracks Remaining</p>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {queue.map((track, index) => {
          const isPlaying = track.id === currentTrack.id;
          const isPlayed = index < currentIndex;
          
          return (
            <motion.div 
              key={`${track.id}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                dispatch(setTrack(track));
                dispatch(play());
              }}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${isPlaying ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'} ${isPlayed ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg">
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                   <FiPlay className={`w-5 h-5 ${isPlaying ? 'text-primary' : 'text-white'}`} />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-bold uppercase tracking-wide line-clamp-1 ${isPlaying ? 'text-primary' : 'text-white'}`}>
                  {track.title}
                </span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest line-clamp-1 mt-0.5">
                  {track.artist}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UpNextQueue;
