import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiSearch, FiPlay, FiCompass } from "react-icons/fi";
import SEO from "../components/Common/SEO";

// ─── Cinematic 404 / Error Page ───────────────────────────────────────────────
// World-class error page with animated film-reel, ambient glow, and curated CTAs.
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { icon: <FiHome size={16} />, label: "Home", to: "/" },
  { icon: <FiSearch size={16} />, label: "Search", to: "/search" },
  { icon: <FiPlay size={16} />, label: "Movies", to: "/?tab=movie" },
  { icon: <FiCompass size={16} />, label: "Explore", to: "/explore" },
];

const FILM_FRAMES = Array.from({ length: 8 });

const Error: FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(12);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/", { replace: true });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  return (
    <>
      <SEO title="404 — Page Not Found | StreamLux" description="This page doesn't exist. Go back to StreamLux and keep watching." />

      <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6 relative overflow-hidden">

        {/* ── Ambient glow blobs ──────────────────────────────────────────── */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" style={{ animationDelay: "1.5s" }} />

        {/* ── Animated Film Reel ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-10 relative"
        >
          {/* Outer reel ring */}
          <div className="relative w-36 h-36 md:w-44 md:h-44">
            {/* Rotating sprocket holes */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              {FILM_FRAMES.map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 rounded-full border-2 border-white/20 bg-dark"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-54px)`,
                  }}
                />
              ))}
            </motion.div>

            {/* Main reel circle */}
            <div className="absolute inset-3 rounded-full border-4 border-white/10 bg-dark-lighten flex items-center justify-center shadow-2xl">
              {/* Hub */}
              <div className="w-14 h-14 rounded-full border-2 border-primary/30 bg-dark flex items-center justify-center shadow-inner">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              </div>
              {/* Spokes */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-0.5 h-5 bg-white/10 origin-bottom"
                  style={{
                    bottom: "50%",
                    left: "50%",
                    marginLeft: "-1px",
                    transform: `rotate(${deg}deg) translateY(100%)`,
                  }}
                />
              ))}
            </div>

            {/* Primary glow ring */}
            <div className="absolute inset-0 rounded-full border border-primary/20 shadow-[0_0_40px_rgba(255,107,53,0.15)]" />
          </div>
        </motion.div>

        {/* ── 404 Text ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="text-center space-y-4 max-w-lg"
        >
          {/* Big 404 */}
          <div className="relative inline-block">
            <span className="text-[7rem] md:text-[10rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 select-none">
              404
            </span>
            <span className="absolute inset-0 flex items-center justify-center text-[7rem] md:text-[10rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-primary/60 to-primary/20 blur-sm select-none">
              404
            </span>
          </div>

          <h1 className="text-white font-black text-2xl md:text-3xl tracking-tight -mt-4">
            Scene Not Found
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            This page got cut from the final edit. The reel is empty — but your
            next favorite film is just a click away.
          </p>

          {/* Countdown */}
          <p className="text-gray-600 text-xs">
            Redirecting to home in{" "}
            <span className="text-primary font-bold">{countdown}s</span>
          </p>
        </motion.div>

        {/* ── Quick Links ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md"
        >
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center gap-2 py-4 px-3 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-primary/30 rounded-2xl text-white/60 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <span className="text-primary group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-xs font-bold">{link.label}</span>
            </Link>
          ))}
        </motion.div>

        {/* ── Film strip decoration ────────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden opacity-[0.03] pointer-events-none select-none h-12">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="shrink-0 w-16 h-full border-x border-white/80 bg-white/20 mr-1" />
          ))}
        </div>
      </div>
    </>
  );
};

export default Error;
