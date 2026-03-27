import { FC } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BRANDS = [
  {
    id: "disney",
    name: "Walt Disney",
    logo: "/logos/Walt-Disney-Logo-1.png",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/disney_brand_hub_hover_low.mp4",
    glowColor: "#1a73e8",
  },
  {
    id: "pixar",
    name: "Pixar",
    logo: "/logos/Pixar-emblem.jpg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/pixar_brand_hub_hover_low.mp4",
    glowColor: "#a1c4fd",
  },
  {
    id: "marvel",
    name: "Marvel",
    logo: "/logos/Marvel_Studios_logo.jpg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/marvel_brand_hub_hover_low.mp4",
    glowColor: "#ed1d24",
  },
  {
    id: "starwars",
    name: "Star Wars",
    logo: "/logos/Star-wars-logo-new-tall.jpg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/star_wars_brand_hub_hover_low.mp4",
    glowColor: "#ffe81f",
  },
  {
    id: "natgeo",
    name: "Nat Geo",
    logo: "/logos/Natgeologo.svg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/national_geographic_brand_hub_hover_low.mp4",
    glowColor: "#ffcc00",
  },
  {
    id: "dc",
    name: "DC",
    logo: "/logos/DC_Comics_2024.svg.png",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/marvel_brand_hub_hover_low.mp4",
    glowColor: "#004de5",
  },
  {
    id: "007",
    name: "James Bond",
    logo: "/logos/png-clipart-logo-brand-white-james-bond-miscellaneous-angle.png",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/marvel_brand_hub_hover_low.mp4",
    glowColor: "#c9a84c",
  },
  {
    id: "nickelodeon",
    name: "Nickelodeon",
    logo: "/logos/Nickelodeon_2023_logo.png",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/pixar_brand_hub_hover_low.mp4",
    glowColor: "#ff7000",
  },
  {
    id: "cartoonnetwork",
    name: "Cartoon Network",
    logo: "/logos/Cartoon-Network-logo.jpg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/pixar_brand_hub_hover_low.mp4",
    glowColor: "#ffffff",
  },
];

interface BrandHubProps {
  className?: string;
}

const BrandHub: FC<BrandHubProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <div className={`py-10 ${className || ""}`}>
      {/* Section heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">
            🎬 Brand <span className="text-primary">Universe</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1">Click any studio to explore their full catalogue</p>
        </div>
      </div>

      {/* Cards grid — larger on desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 md:gap-4">
        {BRANDS.map((brand) => (
          <motion.div
            key={brand.id}
            whileHover={{ scale: 1.06, y: -6 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(`/?brand=${brand.id}`)}
            className="relative rounded-2xl border border-white/10 overflow-hidden cursor-pointer group"
            style={{ aspectRatio: "2/3" }}
          >
            {/* Ambient glow from brand color */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-0 pointer-events-none blur-xl"
              style={{ backgroundColor: brand.glowColor }}
            />

            {/* Hover video */}
            {brand.video && (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]"
              >
                <source src={brand.video} type="video/mp4" />
              </video>
            )}

            {/* Dark base */}
            <div className="absolute inset-0 bg-[#0d0d0d] z-[2] group-hover:opacity-30 transition-opacity duration-300" />

            {/* Logo */}
            <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center p-2 gap-2">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full max-h-[55%] object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const txt = document.createElement("span");
                    txt.className = "text-[11px] font-black uppercase tracking-tighter text-white text-center";
                    txt.innerText = brand.name;
                    parent.appendChild(txt);
                  }
                }}
              />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">
                {brand.name}
              </span>
            </div>

            {/* Bottom glow bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity z-[4] shadow-lg"
              style={{ backgroundColor: brand.glowColor }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BrandHub;
