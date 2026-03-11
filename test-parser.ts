import { getESPNScores } from "./src/services/publicSportsAPI.ts";

async function run() {
  console.log("Testing getESPNScores...");
  const dateStr = new Date().toISOString().split('T')[0];
  const results = await getESPNScores(dateStr);
  console.log("Found matches:", results.length);
  if (results.length > 0) {
    console.log(results[0]);
  }
}
run();
