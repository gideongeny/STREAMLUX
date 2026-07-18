import { SportsFixtureConfig } from "../shared/constants";
import { enrichFixturesCovers, fetchCricHdChannels } from "./sportsLiveFeeds";

export {
  getLiveFixturesAPI,
  getUpcomingFixturesAPI,
  subscribeToLiveScores,
  getLiveScores,
  getESPNScores,
} from "./publicSportsAPI";

const getApiBase = () => getBackendBase() + "/api";

export const getSportsCategory = (name: string): string => {
  name = name.toLowerCase();
  if (name.includes("football") || name.includes("soccer") || name.includes("premier")) return "soccer";
  if (name.includes("basketball") || name.includes("nba")) return "basketball";
  if (name.includes("baseball") || name.includes("mlb")) return "baseball";
  if (name.includes("hockey") || name.includes("nhl")) return "hockey";
  if (name.includes("tennis") || name.includes("atp") || name.includes("wta")) return "tennis";
  if (name.includes("f1") || name.includes("formula") || name.includes("racing")) return "f1";
  if (name.includes("ufc") || name.includes("mma") || name.includes("fighting")) return "ufc";
  if (name.includes("nfl") || name.includes("american")) return "nfl";
  if (name.includes("cricket")) return "cricket";
  if (name.includes("volleyball")) return "volleyball";
  if (name.includes("golf")) return "golf";
  if (name.includes("rugby")) return "rugby";
  if (name.includes("wwe") || name.includes("wrestling")) return "wwe";
  return "epl";
};

/** Premium replay / live TV row — CricHd + IPTV-style sports channels */
export const getVarietySports = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const crichd = await fetchCricHdChannels();
    return enrichFixturesCovers(
      crichd.map((c) => ({
        ...c,
        status: "replay",
        title: c.homeTeam,
        isUpcomingMarquee: true,
      }))
    );
  } catch {
    return [];
  }
};

export const getMatchLink = (fixture: SportsFixtureConfig): string => {
  if (fixture.streamUrl) {
    return `/sports/arena/${fixture.id}?home=${encodeURIComponent(fixture.homeTeam)}&away=${encodeURIComponent(fixture.awayTeam)}&sport=${encodeURIComponent(fixture.sportsCategory || fixture.sport || "soccer")}`;
  }
  if (fixture.youtubeId) {
    return `/sports/arena/${fixture.id}?home=${encodeURIComponent(fixture.homeTeam)}&away=${encodeURIComponent(fixture.awayTeam)}`;
  }
  return `/sports/arena/${fixture.id}?home=${encodeURIComponent(fixture.homeTeam)}&away=${encodeURIComponent(fixture.awayTeam)}&sport=${encodeURIComponent(fixture.sportsCategory || fixture.sport || "soccer")}`;
};

export const getMatchEvents = async (_id: string): Promise<any[]> => [];
export const getMatchStatistics = async (_id: string): Promise<any[]> => [];
