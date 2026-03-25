import { FC, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MdArrowBack, MdFullscreen, MdOpenInNew } from "react-icons/md";
import Title from "../../components/Common/Title";
import { LEAGUE_STREAMS } from "../../shared/constants";

const LeagueStreamWatch: FC = () => {
  const { leagueId } = useParams();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stream = useMemo(
    () => LEAGUE_STREAMS.find((s) => s.leagueId === leagueId),
    [leagueId]
  );

  const requestFullscreen = async () => {
    try {
      const el = containerRef.current;
      if (!el) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyEl = el as any;
      if (anyEl.requestFullscreen) await anyEl.requestFullscreen();
      else if (anyEl.webkitRequestFullscreen) await anyEl.webkitRequestFullscreen();
    } catch {
      // ignore
    }
  };

  if (!stream) {
    return (
      <>
        <Title value="Stream not found | StreamLux Sports" />
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-3xl font-black text-white mb-3">Stream not available</h1>
          <p className="text-gray-400 max-w-xl">
            This league doesn’t have an embedded stream configured yet.
          </p>
          <Link
            to="/sports"
            className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 rounded-xl text-white font-black hover:opacity-90 transition"
          >
            <MdArrowBack size={18} />
            Back to Sports
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Title value={`${stream.title} | StreamLux Sports`} />

      <div className="min-h-screen px-4 md:px-10 pt-6 md:pt-10 pb-14 bg-dark">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                to="/sports"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
              >
                <MdArrowBack size={18} />
                Back
              </Link>
              <div>
                <h1 className="text-xl md:text-3xl font-black text-white">{stream.title}</h1>
                {stream.providerUrl && (
                  <a
                    href={stream.providerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Powered by StreamSports99
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={requestFullscreen}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25 transition font-black text-xs uppercase tracking-widest"
              >
                <MdFullscreen size={18} />
                Fullscreen
              </button>
              <a
                href={stream.src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition font-black text-xs uppercase tracking-widest"
              >
                <MdOpenInNew size={18} />
                Open source
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            ref={containerRef}
            className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl"
          >
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={stream.src}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="no-referrer"
                title={stream.title}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LeagueStreamWatch;

