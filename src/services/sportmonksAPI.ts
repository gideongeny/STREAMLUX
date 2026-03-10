import axios from "axios";
import { proxyUrl } from "./corsProxy";

const SPORTMONKS_TOKEN = "Vgv86BZzG0YVUQCYdXT16Xxzr1qCSVxxntce0-UYXmcqJ_aodkoq39Fv2E6f";
const BASE_URL = "https://api.sportmonks.com/v3/football";

const fetchFromSportmonks = async (endpoint: string, params: Record<string, string> = {}) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append("api_token", SPORTMONKS_TOKEN);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const proxiedUrl = proxyUrl(url.toString());
    const response = await axios.get(proxiedUrl);
    return response.data;
};

/**
 * Fetch live scores for football matches currently in progress.
 */
export const getLiveScores = async () => {
    try {
        const data = await fetchFromSportmonks("/livescores/inplay", {
            include: "participants;scores;periods;events;league.country;round"
        });
        return data?.data || [];
    } catch (error) {
        console.error("Sportmonks Live Scores error:", error);
        return [];
    }
};

/**
 * Fetch upcoming matches for a specific team.
 */
export const getTeamSchedule = async (teamId: string = "3468") => {
    try {
        const data = await fetchFromSportmonks(`/schedules/teams/${teamId}`);
        return data?.data || [];
    } catch (error) {
        console.error("Sportmonks Team Schedule error:", error);
        return [];
    }
};

/**
 * Fetch detailed information for a specific match fixture.
 */
export const getMatchDetails = async (fixtureId: string) => {
    try {
        const data = await fetchFromSportmonks(`/fixtures/${fixtureId}`, {
            include: "participants;league;venue;state;scores;events.type;events.period;events.player;statistics.type;sidelined.sideline.player;sidelined.sideline.type;weatherReport"
        });
        return data?.data;
    } catch (error) {
        console.error("Sportmonks Match Details error:", error);
        return null;
    }
};

/**
 * Fetch fixtures with advanced details like lineups, odds, etc.
 */
export const getAdvancedFixtures = async () => {
    try {
        const data = await fetchFromSportmonks("/fixtures", {
            include: "lineups.details.type;odds.bookmaker;sidelined.sideline;statistics.type;tvStations.tvStation;lineups.player;odds.market;events.subType;events.player;state.type"
        });
        return data?.data || [];
    } catch (error) {
        console.error("Sportmonks Advanced Fixtures error:", error);
        return [];
    }
};
