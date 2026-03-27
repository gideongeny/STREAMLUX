import { FC } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BRANDS = [
  {
    id: "disney",
    name: "Disney",
    logo: "/logos/Walt-Disney-Logo-1.png",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/disney_brand_hub_hover_low.mp4",
    glowClass: "glow-disney",
  },
  {
    id: "pixar",
    name: "Pixar",
    logo: "/logos/Pixar-emblem.jpg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/pixar_brand_hub_hover_low.mp4",
    glowClass: "glow-pixar",
  },
  {
    id: "marvel",
    name: "Marvel",
    logo: "/logos/Marvel_Studios_logo.jpg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/marvel_brand_hub_hover_low.mp4",
    glowClass: "glow-marvel",
  },
  {
    id: "starwars",
    name: "Star Wars",
    logo: "/logos/Star-wars-logo-new-tall.jpg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/star_wars_brand_hub_hover_low.mp4",
    glowClass: "glow-starwars",
  },
  {
    id: "natgeo",
    name: "National Geographic",
    logo: "/logos/Natgeologo.svg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/national_geographic_brand_hub_hover_low.mp4",
    glowClass: "glow-natgeo",
  },
  {
    id: "dc",
    name: "DC",
    logo: "/logos/DC_Comics_2024.svg.png",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/marvel_brand_hub_hover_low.mp4", // DC fallback to Marvel's energetic feel
    glowClass: "glow-pixar",
  },
  {
    id: "007",
    name: "James Bond",
    logo: "/logos/png-clipart-logo-brand-white-james-bond-miscellaneous-angle.png",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/marvel_brand_hub_hover_low.mp4", // Spy-like energetic fallback
    glowClass: "glow-starwars",
  },
  {
    id: "nickelodeon",
    name: "Nickelodeon",
    logo: "/logos/Nickelodeon_2023_logo.png",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/pixar_brand_hub_hover_low.mp4", // Animation fallback
    glowClass: "glow-natgeo",
  },
  {
    id: "cartoonnetwork",
    name: "Cartoon Network",
    logo: "/logos/Cartoon-Network-logo.jpg",
    video: "https://vod-bgc-na-east-1.media.dssott.com/bgui/ps01/disney/bgui/pixar_brand_hub_hover_low.mp4", // Animation fallback
    glowClass: "glow-starwars",
  },
];

interface BrandHubProps {
  className?: string;
}

const BrandHub: FC<BrandHubProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 py-8 ${className || ""}`}>
      {BRANDS.map((brand) => (
        <motion.div
          key={brand.id}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/?brand=${brand.id}`)}
          className={`relative w-[calc(50%-8px)] md:w-[calc(20%-16px)] lg:w-[calc(11%-16px)] aspect-[16/9] rounded-xl border border-white/10 overflow-hidden cursor-pointer flex items-center justify-center transition-all duration-300 group ${brand.glowClass}`}
        >
          {/* Animated Video Background on Hover */}
          {brand.video && (
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 bg-dark"
            >
              <source src={brand.video} type="video/mp4" />
            </video>
          )}

          {/* Fallback shimmer if no video or loading */}
          <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-0 transition-opacity z-[1]">
            <div className="tw-shimmer h-full w-full" />
          </div>

          {/* Logo Image */}
          <img 
            src={brand.logo} 
            alt={brand.name} 
            className="w-[85%] h-[85%] object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            onError={(e) => {
               e.currentTarget.style.display = 'none';
               const parent = e.currentTarget.parentElement;
               if (parent) {
                  const title = document.createElement('span');
                  title.className = "text-[10px] font-black uppercase tracking-tighter text-white/40";
                  title.innerText = brand.name;
                  parent.appendChild(title);
               }
            }}
          />

          {/* Inner Light Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-[11]" />
          
          {/* Hover highlight line */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_#fff] z-[12]" />
        </motion.div>
      ))}
    </div>
  );
};

export default BrandHub;
