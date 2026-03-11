async function test() {
  try {
    const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard");
    const data = await res.json();
    console.log("ESPN Events count:", data.events ? data.events.length : 0);
    if (data.events && data.events.length > 0) {
      console.log("Sample event:", data.events[0].name, data.events[0].status.type.name);
    }
  } catch (e) {
    console.log("Error:", e);
  }
}
test();
