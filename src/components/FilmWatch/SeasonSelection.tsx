import { FunctionComponent, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DetailSeason, Episode } from "../../shared/types";
import Skeleton from "../Common/Skeleton";

interface SeasonSelectionProps {
  detailSeasons?: DetailSeason[];
  seasonId?: number;
  episodeId?: number;
}

const SeasonSelection: FunctionComponent<SeasonSelectionProps> = ({
  detailSeasons,
  seasonId,
  episodeId,
}) => {
  const [activeSeason, setActiveSeason] = useState<number>(seasonId || 1);

  // Sync active season if props change (e.g. user navigates via URL)
  useEffect(() => {
    if (seasonId) {
      setActiveSeason(seasonId);
    }
  }, [seasonId]);

  const currentSeasonData = detailSeasons?.find(
    (season) => season.season_number === activeSeason
  );

  if (!detailSeasons) {
    return (
      <div className="animate-pulse">
        <Skeleton className="h-10 w-full mb-4 rounded-md" />
        <div className="grid grid-cols-5 gap-2">
          {new Array(10).fill("").map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
      {/* Header/Resources Info - mimicking MovieBox style */}
      <div className="mb-4">
        <h3 className="text-white font-bold text-lg mb-1">Episodes</h3>
        <p className="text-gray-400 text-xs">
          Select a season and episode to watch.
        </p>
      </div>

      {/* Season Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {detailSeasons.filter(s => s.season_number > 0).map((season) => (
            <button
              key={season.id}
              onClick={() => setActiveSeason(season.season_number)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeSeason === season.season_number
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
            >
              S{season.season_number < 10 ? `0${season.season_number}` : season.season_number}
            </button>
          ))}
        </div>
      </div>

      {/* Episode Grid */}
      {currentSeasonData ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {currentSeasonData.episodes.map((episode: Episode) => {
            const isActive =
              episode.episode_number === episodeId &&
              currentSeasonData.season_number === seasonId;

            return (
              <Link
                key={episode.id}
                to={{
                  pathname: "",
                  search: `?season=${currentSeasonData.season_number}&episode=${episode.episode_number}`,
                }}
                className={`aspect-square flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-300 relative group ${isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105"
                  }`}
                title={episode.name}
              >
                {/* Episode Number */}
                <span>{episode.episode_number}</span>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-32 bg-black/90 text-white text-[10px] p-2 rounded border border-white/10 z-50 text-center pointer-events-none whitespace-normal">
                  {episode.name}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          No episodes found for this season.
        </div>
      )}
    </div>
  );
};

export default SeasonSelection;
