import { FC, useEffect, useState } from "react";
import { TVChannel } from "../../utils/tvChannelMap";
import { liveTVService } from "../../services/liveTVService";
import { FiTv } from "react-icons/fi";

const resolveLogo = (logo: string | undefined): string => {
  if (!logo) return '';
  if (logo.startsWith('http')) return logo;
  const commonExtensions: Record<string, string> = {
    'bbc': '.png',
    'nbc': '.png',
    'cnn_logo_3': '.png',
    'hbo': '.png',
    'showtime': '.png',
    'cinemax': '.png',
    'tbs': '.png',
    'fox': '.png',
    'abc': '.png',
    'espn': '.png'
  };
  const ext = commonExtensions[logo.toLowerCase()] || '.png';
  return `/images/logos/${logo}${ext}`;
};

const LiveTVTicker: FC = () => {
  const [channels, setChannels] = useState<TVChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Stagger mount by 150ms to avoid network/CPU collision with Sports Ticker
    const timer = setTimeout(() => {
      const unsubscribe = liveTVService.subscribeToLiveChannels((updatedChannels) => {
        setChannels(updatedChannels);
        setIsLoading(false);
      }, { category: 'All' }, 120000); // 2 minutes refresh

      return () => unsubscribe();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || channels.length === 0) {
    return null;
  }

  // Duplicate channels for seamless loop
  const displayChannels = [...channels, ...channels];

  return (
    <div className="bg-dark/50 border-y border-white/5 py-3 overflow-hidden backdrop-blur-md">
      <div className="flex items-center gap-8 animate-scroll">
        {displayChannels.map((channel, index) => {
          const logoUrl = resolveLogo(channel.logo);
          return (
            <div
              key={`${channel.id}-${index}`}
              className="flex items-center gap-4 shrink-0 px-4 group cursor-pointer"
            >
              {/* Channel Logo */}
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={channel.name}
                    className="w-full h-full object-contain p-1 grayscale group-hover:grayscale-0 transition-all"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const icon = document.createElement('div');
                        icon.className = "text-[10px] font-black text-primary";
                        icon.innerText = channel.name.charAt(0);
                        parent.appendChild(icon);
                      }
                    }}
                  />
                ) : (
                  <FiTv className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                )}
              </div>

              {/* Channel Name */}
              <div className="flex flex-col">
                <span className="text-white text-xs font-black uppercase tracking-widest group-hover:text-primary transition-colors">
                  {channel.name}
                </span>
                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                  {channel.category}
                </span>
              </div>

              {/* Live Indicator */}
              <div className="flex items-center gap-2 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[7px] font-black text-red-500 uppercase tracking-widest">LIVE</span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes scroll-tv {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          width: fit-content;
          animation: scroll-tv 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LiveTVTicker;
