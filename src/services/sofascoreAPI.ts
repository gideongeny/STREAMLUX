import axios from '../shared/axios';
import { SportsFixtureConfig } from '../shared/constants';

const getApiBase = () => "";

export const getSofaScoreLive = async (): Promise<SportsFixtureConfig[]> => {
    const sports = ['football', 'basketball', 'baseball'];
    const allFixtures: SportsFixtureConfig[] = [];

    try {
        const results = await Promise.allSettled(
            sports.map(sport => axios.post(`${getApiBase()}/external`, {
                provider: "sofascore",
                endpoint: `/sport/${sport}/events/live`,
                params: {}
            }))
        );

        results.forEach((res, idx) => {
            // Check for both raw response and the wrapped backend response
            const data = res.status === 'fulfilled' ? (res.value.data?.data || res.value.data) : null;
            
            if (data?.events) {
                data.events.forEach((event: any) => {
                    allFixtures.push({
                        id: `sofa-${event.id}`,
                        homeTeam: event.homeTeam.name,
                        awayTeam: event.awayTeam.name,
                        homeTeamLogo: `https://api.sofascore.app/api/v1/team/${event.homeTeam.id}/image`,
                        awayTeamLogo: `https://api.sofascore.app/api/v1/team/${event.awayTeam.id}/image`,
                        homeScore: event.homeScore?.current || 0,
                        awayScore: event.awayScore?.current || 0,
                        status: event.status.type === 'inprogress' ? 'live' : 'upcoming',
                        isLive: event.status.type === 'inprogress',
                        minute: event.status.type === 'inprogress' ? `${event.displayClock || 'Live'}` : 'Upcoming',
                        leagueName: event.tournament.name,
                        sportsCategory: sports[idx].charAt(0).toUpperCase() + sports[idx].slice(1),
                        kickoffTimeFormatted: new Date(event.startTimestamp * 1000).toISOString()
                    });
                });
            }
        });

        return allFixtures;
    } catch (error) {
        console.error("SofaScore proxy fetch error:", error);
        return [];
    }
};

export const getSofaScoreScheduled = async (): Promise<SportsFixtureConfig[]> => {
    const sports = ['football', 'basketball', 'baseball'];
    const allFixtures: SportsFixtureConfig[] = [];
    const today = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];

    try {
        const fetchPromises: any[] = [];
        
        sports.forEach(sport => {
            fetchPromises.push(axios.post(`${getApiBase()}/external`, {
                provider: "sofascore",
                endpoint: `/sport/${sport}/events/scheduled/${today}`,
                params: {}
            }));
            fetchPromises.push(axios.post(`${getApiBase()}/external`, {
                provider: "sofascore",
                endpoint: `/sport/${sport}/events/scheduled/${tomorrow}`,
                params: {}
            }));
        });

        const results = await Promise.allSettled(fetchPromises);

        results.forEach((res, idx) => {
            const sportIdx = Math.floor(idx / 2);
            const data = res.status === 'fulfilled' ? (res.value.data?.data || res.value.data) : null;
            
            if (data?.events) {
                data.events.forEach((event: any) => {
                    // Only add if not finished and not already added
                    if (event.status.type !== 'finished' && !allFixtures.some(f => f.id === `sofa-${event.id}`)) {
                        allFixtures.push({
                            id: `sofa-${event.id}`,
                            homeTeam: event.homeTeam.name,
                            awayTeam: event.awayTeam.name,
                            homeTeamLogo: `https://api.sofascore.app/api/v1/team/${event.homeTeam.id}/image`,
                            awayTeamLogo: `https://api.sofascore.app/api/v1/team/${event.awayTeam.id}/image`,
                            homeScore: 0,
                            awayScore: 0,
                            status: event.status.type === 'inprogress' ? 'live' : 'upcoming',
                            isLive: event.status.type === 'inprogress',
                            minute: event.status.type === 'inprogress' ? `${event.displayClock || 'Live'}` : 'Upcoming',
                            leagueName: event.tournament.name,
                            sportsCategory: sports[sportIdx].charAt(0).toUpperCase() + sports[sportIdx].slice(1),
                            kickoffTimeFormatted: new Date(event.startTimestamp * 1000).toISOString()
                        });
                    }
                });
            }
        });

        return allFixtures;
    } catch (error) {
        console.error("SofaScore scheduled fetch error:", error);
        return [];
    }
};
