import { getESPNScores, getUpcomingFixturesAPI } from "./src/services/publicSportsAPI.js";

async function test() {
  console.log("Fetching upcoming fixtures...");
  const pub = await getUpcomingFixturesAPI();
  console.log("Total upcoming fixtures:", pub.length);
  if (pub.length > 0) {
    console.log("Sample:", pub[0]);
  } else {
    console.log("No upcoming fixtures found from APIs.");
  }
}

test();
