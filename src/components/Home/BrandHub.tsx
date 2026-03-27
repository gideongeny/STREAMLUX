import { FC } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BRANDS = [
  {
    id: "disney",
    name: "Disney",
    logo: "/logos/Walt-Disney-Logo-1.png",
    glowClass: "glow-disney",
  },
  {
    id: "pixar",
    name: "Pixar",
    logo: "/logos/Pixar-emblem.jpg",
    glowClass: "glow-pixar",
  },
  {
    id: "marvel",
    name: "Marvel",
    logo: "/logos/Marvel_Studios_logo.jpg",
    glowClass: "glow-marvel",
  },
  {
    id: "starwars",
    name: "Star Wars",
    logo: "/logos/Star-wars-logo-new-tall.jpg",
    glowClass: "glow-starwars",
  },
  {
    id: "natgeo",
    name: "National Geographic",
    logo: "/logos/Natgeologo.svg",
    glowClass: "glow-natgeo",
  },
  {
    id: "dc",
    name: "DC",
    logo: "/logos/DC_Comics_2024.svg.png",
    glowClass: "glow-pixar",
  },
  {
    id: "007",
    name: "James Bond",
    logo: "/logos/png-clipart-logo-brand-white-james-bond-miscellaneous-angle.png",
    glowClass: "glow-starwars",
  },
  {
    id: "nickelodeon",
    name: "Nickelodeon",
    logo: "/logos/Nickelodeon_2023_logo.png",
    glowClass: "glow-natgeo",
  },
  {
    id: "cartoonnetwork",
    name: "Cartoon Network",
    logo: "/logos/Cartoon-Network-logo.jpg",
    glowClass: "glow-starwars",
  },
];

const BrandHub: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-8">
      {BRANDS.map((brand) => (
        <motion.div
          key={brand.id}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/?brand=${brand.id}`)}
          className={`relative w-[calc(50%-8px)] md:w-[calc(20%-16px)] lg:w-[calc(11%-16px)] aspect-[16/9] rounded-xl border border-white/10 overflow-hidden cursor-pointer flex items-center justify-center transition-all duration-300 group ${brand.glowClass}`}
        >
          {/* Animated background noise/stars for Star Wars or subtle shimmer for others */}
          <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
            <div className="tw-shimmer h-full w-full" />
          </div>

          {/* Logo Image */}
          <img 
            src={brand.logo} 
            alt={brand.name} 
            className="w-[80%] h-[80%] object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            onError={(e) => {
               e.currentTarget.style.display = 'none';
               const parent = e.currentTarget.parentElement;
               if (parent) {
                  const text = document.createElement('span');
                  text.className = "text-[10px] font-black uppercase tracking-tighter text-white/40";
                  text.innerText = brand.name;
                  parent.appendChild(text);
               }
            }}
          />

          {/* Inner Light Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          
          {/* Hover highlight line */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_#fff]" />
        </motion.div>
      ))}
    </div>
  );
};

export default BrandHub;
