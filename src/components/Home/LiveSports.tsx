import { FC } from "react";
import { Link } from "react-router-dom";
import ErrorBoundary from "../Common/ErrorBoundary";
import LiveGamesSlider from "../Sports/LiveGamesSlider";
import { SPORTS_CHANNELS } from "../../shared/constants";

const LiveSports: FC = () => {
  return (
    <ErrorBoundary fallback={null}>
      <div className="mt-12 space-y-12">
        {/* Live Matches Section - MovieBox Style */}
        <ErrorBoundary fallback={null}>
          <LiveGamesSlider type="live" title="Live Now" />
        </ErrorBoundary>

        {/* Live Sports Channels Section */}
        <div className="px-4 md:px-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Sports Channels
            </h3>
            <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Premium Streams</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {SPORTS_CHANNELS.map((channel) => (
              <Link
                key={channel.id}
                to={`/sports/channel/${channel.id}/watch`}
                className="group relative"
              >
                <div className="aspect-video relative rounded-xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/10 to-transparent group-hover:border-primary/50 transition duration-500 shadow-xl">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="max-w-[80%] max-h-[70%] object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                          <span className="text-xl font-black">{channel.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                  {/* Live Badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 shadow-lg text-[8px] font-black text-white uppercase tracking-tighter">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                    Live
                  </div>
                </div>
                <h3 className="mt-2 text-xs text-gray-400 font-bold group-hover:text-primary transition truncate px-1 uppercase tracking-wider">
                  {channel.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Matches Section - MovieBox Style */}
        <ErrorBoundary fallback={null}>
          <LiveGamesSlider type="upcoming" title="Upcoming Matches" />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default LiveSports;

