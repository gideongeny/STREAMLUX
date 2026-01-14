import { FC, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdSportsSoccer } from "react-icons/md";

import Sidebar from "../../components/Common/Sidebar";
import SidebarMini from "../../components/Common/SidebarMini";
import Title from "../../components/Common/Title";
import Footer from "../../components/Footer/Footer";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { SPORTS_FIXTURES, SPORTS_LEAGUES } from "../../shared/constants";

const SportsWatch: FC = () => {
  const { leagueId, matchId } = useParams();
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  const fixture = SPORTS_FIXTURES.find(
    (item) => item.id === matchId && item.leagueId === leagueId
  );
  const league = SPORTS_LEAGUES.find((item) => item.id === leagueId);

  const sources = useMemo(
    () => fixture?.streamSources ?? [],
    [fixture?.streamSources]
  );

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
          {!fixture ? (
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
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide ${
                      fixture.status === "live"
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
                        {fixture.broadcast.join(" · ")}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                {sources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-700 rounded-lg px-6 py-10">
                    <p className="text-white font-semibold mb-2">
                      No external streams configured yet
                    </p>
                    <p className="text-sm text-gray-400 max-w-md">
                      Ask the administrator to add one or more official partner
                      links (for example SportsLive, Streamed or a licensed
                      broadcaster). They will appear here as buttons that open a
                      new tab.
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-800 rounded-lg p-4 bg-dark-lighten/60">
                    <p className="text-sm text-gray-300 mb-3">
                      Choose where to watch. You&apos;ll be redirected to the
                      partner website in a new tab:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {sources.map((source) => (
                        <a
                          key={source}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full bg-primary/10 border border-primary/70 text-sm text-primary hover:bg-primary hover:text-white transition"
                        >
                          Watch on {getSourceDisplayName(source)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
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


