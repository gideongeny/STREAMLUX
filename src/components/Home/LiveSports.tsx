import { FC } from "react";
import ErrorBoundary from "../Common/ErrorBoundary";
import LiveGamesSlider from "../Sports/LiveGamesSlider";

const LiveSports: FC = () => {
  return (
    <ErrorBoundary fallback={null}>
      <div className="mt-12 space-y-8">
        {/* Live Matches Section - MovieBox Style */}
        <ErrorBoundary fallback={null}>
          <LiveGamesSlider type="live" title="Live" />
        </ErrorBoundary>
        
        {/* Upcoming Matches Section - MovieBox Style */}
        <ErrorBoundary fallback={null}>
          <LiveGamesSlider type="upcoming" title="Upcoming" />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default LiveSports;

