import { FC, useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdSportsSoccer } from "react-icons/md";

import Sidebar from "../../components/Common/Sidebar";
import SidebarMini from "../../components/Common/SidebarMini";
import Title from "../../components/Common/Title";
import Footer from "../../components/Footer/Footer";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { SPORTS_LEAGUES, SPORTS_CHANNELS, SportsFixtureConfig } from "../../shared/constants";
import { getLiveScores, getUpcomingFixturesAPI } from "../../services/sportsAPI";

const SportsWatch: FC = () => {
  const { leagueId, matchId } = useParams();
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [dynamicFixture, setDynamicFixture] = useState<SportsFixtureConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Channel or dynamic fixture search
  const staticFixture = useMemo(() => {
    if (leagueId === "channel") {
      const channel = SPORTS_CHANNELS.find((item: any) => item.id === matchId);
      if (channel) {
        return {
          id: channel.id,
          homeTeam: channel.name,
          awayTeam: channel.category,
          leagueId: "channel",
          status: "live",
          kickoffTime: new Date().toISOString(),
          kickoffTimeFormatted: "Live Channel",
          venue: channel.country,
          streamSources: [channel.streamUrl]
        } as any;
      }
    }
    return null; // Static fixtures removed in v3.2
  }, [matchId, leagueId]);

  // If not a channel, find in dynamic API data
  useEffect(() => {
    if (!staticFixture && matchId && leagueId !== "channel") {
      const fetchDynamic = async () => {
        setIsLoading(true);
        try {
          const [live, upcoming] = await Promise.all([
            getLiveScores(),
            getUpcomingFixturesAPI(),
          ]);
          const found = [...live, ...upcoming].find(f => f.id === matchId);
          if (found) {
            setDynamicFixture(found);
          }
        } catch (error) {
          console.error("Error fetching match detail:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDynamic();
    }
  }, [staticFixture, matchId]);

  const fixture = staticFixture || dynamicFixture;
  const league = SPORTS_LEAGUES.find((item) => item.id === leagueId);

  const sources = useMemo(() => {
    if (fixture?.streamSources) return fixture.streamSources;

    // Use matchId from URL params or fixture as fallback
    const targetMatchId = matchId || fixture?.matchId;

    if (targetMatchId) {
      // Prioritize sportslive.run with better parameters for instant play
      return [
        `https://sportslive.run/matches/${targetMatchId}?utm_source=StreamLux`,
        `https://strmd.link/watch/${targetMatchId}`,
        `https://streamed.pk/watch/${targetMatchId}`
      ];
    }

    // Fallback: If no sources found at all, generic search
    if (fixture) {
      const searchSlug = `${fixture.homeTeam}-vs-${fixture.awayTeam}`.toLowerCase().replace(/\s+/g, '-');
      const ytQuery = fixture.homeTeam === fixture.awayTeam // Channel mode
        ? `${fixture.homeTeam} live stream`
        : `${fixture.homeTeam} vs ${fixture.awayTeam} live`;

      return [
        `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(ytQuery)}`,
        `https://sportslive.run/live?home=${encodeURIComponent(fixture.homeTeam)}&away=${encodeURIComponent(fixture.awayTeam)}`,
        `https://strmd.link/search?q=${encodeURIComponent(searchSlug)}`
      ];
    }

    return [];
  }, [fixture, matchId]);

  const getSourceDisplayName = (url: string) => {
    if (url.includes("dstv")) return "DStv";
    if (url.includes("showmax")) return "Showmax";
    if (url.includes("canal")) return "Canal+";
    if (url.includes("sky")) return "Sky Sports";
    if (url.includes("bt")) return "BT Sport";
    if (url.includes("beinsports")) return "beIN Sports";
    if (url.includes("supersport")) return "SuperSport";
    if (url.includes("sportslive.run")) return "SportsLive";
    if (url.includes("streamed.pk") || url.includes("strmd.link"))
      return "Streamed";
    return "Official Partner";
  };

  return (
    <>
      <Title
        value={
          fixture
            ? `Watch: ${fixture.homeTeam} vs ${fixture.awayTeam} | StreamLux Sports`
            : "Match not found | StreamLux Sports"
        }
      />

      <div className="flex md:hidden justify-between items-center px-5 my-5">
        <Link to="/" className="flex gap-2 items-center">
          <img
            src="/logo.svg"
            alt="StreamLux Logo"
            className="h-10 w-10"
          />
          <p className="text-xl text-white font-medium tracking-wider uppercase">
            Stream<span className="text-primary">Lux</span>
          </p>
        </Link>
        <button onClick={() => setIsSidebarActive((prev) => !prev)}>
          <GiHamburgerMenu size={25} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {!isMobile && <SidebarMini />}
        {isMobile && (
          <Sidebar
            onCloseSidebar={() => setIsSidebarActive(false)}
            isSidebarActive={isSidebarActive}
          />
        )}

        <div className="flex-grow px-[2vw] md:pt-11 pt-0 pb-10">
          {isLoading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Fetching match details...</p>
            </div>
          ) : !fixture ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-semibold text-white mb-3">
                Match not found
              </p>
              <p className="text-gray-400 mb-6">
                The link you followed is invalid or this match is no longer
                available.
              </p>
              <Link
                to="/sports"
                className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:brightness-110 transition"
              >
                Back to Sports
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      {league?.flag && (
                        <span className="text-base">{league.flag}</span>
                      )}
                      <span>{league?.name}</span>
                    </span>
                    {fixture.round && (
                      <>
                        <span>•</span>
                        <span>{fixture.round}</span>
                      </>
                    )}
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/20 text-primary">
                      <MdSportsSoccer size={20} />
                    </span>
                    <span>
                      {fixture.homeTeam}{" "}
                      <span className="text-gray-400">vs</span> {fixture.awayTeam}
                    </span>
                  </h1>
                  <p className="text-sm text-gray-400 mt-2">
                    {fixture.kickoffTimeFormatted} • {fixture.venue}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide ${fixture.status === "live"
                      ? "bg-red-600/20 text-red-400 border border-red-500/60"
                      : fixture.status === "upcoming"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-400/60"
                        : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/60"
                      }`}
                  >
                    {fixture.status === "live"
                      ? "LIVE"
                      : fixture.status === "upcoming"
                        ? "UPCOMING"
                        : "REPLAY"}
                  </span>
                  {fixture.broadcast && (
                    <p className="text-[11px] text-gray-400">
                      Broadcast partners:{" "}
                      <span className="text-gray-200">
                        {fixture.broadcast?.join(" · ")}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-8 overflow-hidden rounded-2xl shadow-2xl border border-white/5 bg-black aspect-video relative group">
                {sources.length > 0 ? (
                  <>
                    <iframe
                      src={sources[0]}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                      title="Sports Stream"
                    ></iframe>
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-primary text-black text-[10px] font-black px-3 py-1 rounded shadow-lg">
                        STREAMING LIVE
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-10">
                    <p className="text-xl font-bold text-gray-400">Stream Not Available Yet</p>
                    <p className="text-sm text-gray-500 mt-2">Check back closer to kickoff time.</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-300 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Stream troubleshooting & Alternatives:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {sources.map((source: string, index: number) => (
                      <a
                        key={source + index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-primary hover:text-white border border-white/10 transition text-xs md:text-sm font-medium flex items-center gap-2"
                      >
                        Link {index + 1} ({getSourceDisplayName(source)})
                      </a>
                    ))}
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        fixture.homeTeam === fixture.awayTeam // Is channel?
                          ? `${fixture.homeTeam} live stream`
                          : `${fixture.homeTeam} vs ${fixture.awayTeam} live`
                      )}&sp=CAM%253D`} // sp=CAM%253D filters for Live
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white border border-red-500 transition text-xs md:text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                      Find on YouTube (Live)
                    </a>
                    <a
                      href={`https://livesport24.watch/?s=${encodeURIComponent(fixture.homeTeam)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white border border-orange-500 transition text-xs md:text-sm font-medium flex items-center gap-2"
                    >
                      LiveSport24 (External)
                    </a>
                    <a
                      href={`https://dlhd.so/search/${encodeURIComponent(fixture.homeTeam)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 transition text-xs md:text-sm font-medium flex items-center gap-2"
                    >
                      DaddyLive (Backup)
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
                <div>
                  <h2 className="text-white text-lg font-semibold mb-3">
                    Match details
                  </h2>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>
                      <span className="text-gray-400">Competition:</span>{" "}
                      {league?.name}
                    </p>
                    {fixture.round && (
                      <p>
                        <span className="text-gray-400">Stage:</span>{" "}
                        {fixture.round}
                      </p>
                    )}
                    {fixture.referee && (
                      <p>
                        <span className="text-gray-400">Referee:</span>{" "}
                        {fixture.referee}
                      </p>
                    )}
                    {fixture.extraInfo && (
                      <p className="text-gray-300">{fixture.extraInfo}</p>
                    )}
                    <p className="text-xs text-gray-500 pt-3">
                      StreamLux only provides a clean interface and does not
                      host any streams directly. Please ensure you have the
                      right to watch this content in your region.
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-white text-lg font-semibold mb-3">
                    Quick navigation
                  </h2>
                  <div className="flex flex-col gap-2 text-sm">
                    <Link
                      to="/sports"
                      className="px-3 py-2 rounded bg-dark-lighten border border-gray-700 hover:border-primary hover:text-primary transition"
                    >
                      ← Back to Sports hub
                    </Link>
                    <Link
                      to="/"
                      className="px-3 py-2 rounded bg-dark-lighten border border-gray-700 hover:border-primary hover:text-primary transition"
                    >
                      Go to Movies & Series
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SportsWatch;


