import { FC } from "react";
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Sports Channels
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {SPORTS_CHANNELS.map((channel) => (
              <a
                key={channel.id}
                href={channel.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-36 md:w-44 group"
              >
                <div className="aspect-video relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900 group-hover:border-primary/50 transition duration-300 shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary border border-primary/20">
                        <span className="text-xl md:text-2xl font-bold">{channel.name.charAt(0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-red-600 animate-pulse text-[8px] font-bold text-white uppercase">
                    Live
                  </div>
                </div>
                <h3 className="mt-2 text-sm text-gray-200 font-medium group-hover:text-primary transition truncate">
                  {channel.name}
                </h3>
              </a>
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

