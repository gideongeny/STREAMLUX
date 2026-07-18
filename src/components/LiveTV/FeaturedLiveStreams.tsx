import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STREAMS = [
  {
    id: "fox-news",
    name: "FOX News",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Fox_News_Channel_logo.svg"
  },
  {
    id: "nickelodeon",
    name: "Nickelodeon TV",
    logo: "/logos/Nickelodeon_2023_logo.png"
  },
  {
    id: "cnn",
    name: "CNN",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg"
  }
];

const StreamCard: FC<{ stream: typeof STREAMS[0]; idx: number }> = ({ stream, idx }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      className="group"
    >
      <Link to={`/live-tv/${stream.id}`} className="block no-underline">
        <div className="max-w-[800px] mx-auto font-ui">
          <div className="bg-[#1a1a2e] px-4 py-3 rounded-t-lg border border-[#333] border-b-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                  src={stream.logo} 
                  alt={stream.name} 
                  className="h-5 w-auto object-contain brightness-200" 
                  onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <h3 className="m-0 text-white text-sm font-black uppercase tracking-widest">
                  {stream.name} - Watch Live
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-b-lg border border-[#333] border-t-0 bg-[#0f0f1e]">
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group/player bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center group-hover/player:scale-110 group-hover/player:bg-primary/40 transition-all duration-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                   <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                </div>
                <p className="mt-4 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] group-hover/player:text-white transition-colors">Click to Watch Full Screen</p>
                
                {/* Decorative Glassmorphism Elements */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                   <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Premium Quality</span>
                </div>
              </div>
          </div>
          <div className="bg-[#1a1a2e] px-4 py-2 rounded-b-lg border border-[#333] border-t-0 text-center">
            <span className="text-green-500 no-underline text-[10px] font-bold uppercase tracking-widest">
              Direct Access Powered by StreamSports99
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const FeaturedLiveStreams: FC = () => {
  return (
    <div className="py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">
            Featured <span className="text-white/20">Live Streams</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {STREAMS.map((stream, idx) => (
            <StreamCard key={stream.name} stream={stream} idx={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedLiveStreams;
