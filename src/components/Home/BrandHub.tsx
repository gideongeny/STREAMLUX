import { FC, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import "swiper/css";
import { MdMovie } from "react-icons/md";

const BRANDS = [
  {
    id: "disney",
    name: "Walt Disney",
    logo: "/logos/Walt-Disney-Logo-1.png",
    video: "/videos/disney.mp4",
    glowColor: "#1a73e8",
    bg: "#001a4d",
  },
  {
    id: "pixar",
    name: "Pixar",
    logo: "/logos/Pixar-emblem.jpg",
    video: "/videos/pixar.mp4",
    glowColor: "#a1c4fd",
    bg: "#000d2e",
  },
  {
    id: "marvel",
    name: "Marvel",
    logo: "/logos/Marvel_Studios_logo.jpg",
    video: "/videos/marvel.mp4",
    glowColor: "#ed1d24",
    bg: "#1a0002",
  },
  {
    id: "starwars",
    name: "Star Wars",
    logo: "/logos/Star-wars-logo-new-tall.jpg",
    video: "/videos/starwars.mp4",
    glowColor: "#ffe81f",
    bg: "#0a0a00",
  },
  {
    id: "natgeo",
    name: "Nat Geo",
    logo: "/logos/Natgeologo.svg",
    video: "/videos/natgeo.mp4",
    glowColor: "#ffcc00",
    bg: "#1a1100",
  },
  {
    id: "dc",
    name: "DC",
    logo: "/logos/DC_Comics_2024.svg.png",
    video: "/videos/dc.mp4",
    glowColor: "#004de5",
    bg: "#000820",
  },
  {
    id: "007",
    name: "James Bond",
    logo: "/logos/png-clipart-logo-brand-white-james-bond-miscellaneous-angle.png",
    video: "/videos/007.mp4",
    glowColor: "#c9a84c",
    bg: "#0d0a00",
  },
  {
    id: "nickelodeon",
    name: "Nickelodeon",
    logo: "/logos/Nickelodeon_2023_logo.png",
    video: "/videos/nickelodeon.mp4",
    glowColor: "#ff7000",
    bg: "#1a0800",
  },
  {
    id: "cartoonnetwork",
    name: "Cartoon Network",
    logo: "/logos/Cartoon-Network-logo.jpg",
    video: "/videos/cartoonnetwork.mp4",
    glowColor: "#00b4d8",
    bg: "#001020",
  },
];

interface BrandCardProps {
  brand: (typeof BRANDS)[0];
  onClick: () => void;
}

const BrandCard: FC<BrandCardProps> = ({ brand, onClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      // Ensure the promise is handled correctly to avoid "The play() request was interrupted"
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented
        });
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -8 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-2xl border border-white/10 overflow-hidden cursor-pointer group"
      style={{ aspectRatio: "2/3", backgroundColor: brand.bg }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${brand.glowColor}88 0%, transparent 70%)`,
        }}
      />
      <video
        ref={videoRef}
        src={brand.video}
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]"
      />
      <div className="absolute inset-0 bg-black/60 z-[2] group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
      <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-2 p-3 transition-opacity duration-500 group-hover:opacity-0 pointer-events-none">
        <img
          src={brand.logo}
          alt={brand.name}
          className="w-full max-h-[55%] object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.35)] group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const txt = document.createElement("span");
              txt.className = "text-[11px] font-black uppercase tracking-tighter text-white text-center px-1";
              txt.innerText = brand.name;
              parent.appendChild(txt);
            }
          }}
        />
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/90 transition-colors duration-300 text-center">
          {brand.name}
        </span>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[4]"
        style={{
          backgroundColor: brand.glowColor,
          boxShadow: `0 0 12px ${brand.glowColor}`,
        }}
      />
    </motion.div>
  );
};

interface BrandHubProps {
  className?: string;
}

const BrandHub: FC<BrandHubProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <div className={`py-6 md:py-10 ${className || ""}`}>
      <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
        <div>
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
            <MdMovie className="text-primary text-2xl md:text-3xl" />
            Brand <span className="text-primary">Universe</span>
          </h2>
          <p className="text-gray-400 text-[10px] md:text-xs mt-0.5 md:mt-1">
            Featured Studios • Automatic Discovery
          </p>
        </div>
      </div>

      <div className="pl-4 md:pl-0">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          slidesPerView={2.5}
          spaceBetween={10}
          breakpoints={{
            640: { slidesPerView: 3.2, spaceBetween: 15 },
            1024: { slidesPerView: 5.2, spaceBetween: 15 },
            1280: { slidesPerView: 9, spaceBetween: 15 },
          }}
          className="w-full overflow-visible"
        >
          {BRANDS.map((brand) => (
            <SwiperSlide key={brand.id}>
              <BrandCard
                brand={brand}
                onClick={() => {
                  let tab = "movie";
                  try {
                    const stored = localStorage.getItem("currentTab");
                    if (stored?.includes("tv")) tab = "tv";
                  } catch {
                    /* ignore */
                  }
                  navigate(`/?tab=${tab}&brand=${brand.id}`);
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default BrandHub;
