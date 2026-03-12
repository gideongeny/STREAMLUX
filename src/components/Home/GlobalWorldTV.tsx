import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Item } from "../../shared/types";
import {
  getAfricanContent,
  getAsianDramas,
  getEuropeanContent,
  getLatinContent,
  getTurkishContent,
  getKoreanContent,
  getJapaneseContent,
  getIndianContent,
  getBritishContent,
  getNigerianContent,
  getBollywoodMovies,
  getNollywoodMovies,
} from "../../services/globalContent";

interface RegionSlider {
  title: string;
  emoji: string;
  items: Item[];
  isLoading: boolean;
}

const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w342";

const GlobalWorldTV: FC = () => {
  const navigate = useNavigate();
  const [sliders, setSliders] = useState<RegionSlider[]>([
    { title: "🇰🇷 K-Dramas & Korean Cinema", emoji: "🇰🇷", items: [], isLoading: true },
    { title: "🇯🇵 Anime & J-Dramas", emoji: "🇯🇵", items: [], isLoading: true },
    { title: "🌍 African Originals", emoji: "🌍", items: [], isLoading: true },
    { title: "🇹🇷 Turkish Dramas (Diziler)", emoji: "🇹🇷", items: [], isLoading: true },
    { title: "🇮🇳 Bollywood & Indian Cinema", emoji: "🇮🇳", items: [], isLoading: true },
    { title: "🌏 Asian Dramas", emoji: "🌏", items: [], isLoading: true },
    { title: "🇬🇧 British & European Originals", emoji: "🇬🇧", items: [], isLoading: true },
    { title: "🌎 Latin American TV & Film", emoji: "🌎", items: [], isLoading: true },
    { title: "🎬 Nollywood Movies", emoji: "🎬", items: [], isLoading: true },
    { title: "💃 Bollywood Movies", emoji: "💃", items: [], isLoading: true },
  ]);

  useEffect(() => {
    const loadAll = async () => {
      // Fetch in batches to avoid hitting rate limits
      const [korean, japanese, african, turkish, indian, asian, british, latin, nollywood, bollywood] =
        await Promise.allSettled([
          getKoreanContent(),
          getJapaneseContent(),
          getAfricanContent(),
          getTurkishContent(),
          getIndianContent(),
          getAsianDramas(),
          getBritishContent(),
          getLatinContent(),
          getNollywoodMovies(),
          getBollywoodMovies(),
        ]);

      setSliders([
        { title: "🇰🇷 K-Dramas & Korean Cinema", emoji: "🇰🇷", items: korean.status === "fulfilled" ? korean.value.slice(0, 20) : [], isLoading: false },
        { title: "🇯🇵 Anime & J-Dramas", emoji: "🇯🇵", items: japanese.status === "fulfilled" ? japanese.value.slice(0, 20) : [], isLoading: false },
        { title: "🌍 African Originals", emoji: "🌍", items: african.status === "fulfilled" ? african.value.slice(0, 20) : [], isLoading: false },
        { title: "🇹🇷 Turkish Dramas (Diziler)", emoji: "🇹🇷", items: turkish.status === "fulfilled" ? turkish.value.slice(0, 20) : [], isLoading: false },
        { title: "🇮🇳 Indian TV & Web Series", emoji: "🇮🇳", items: indian.status === "fulfilled" ? indian.value.slice(0, 20) : [], isLoading: false },
        { title: "🌏 K/J/Thai/Chinese Dramas", emoji: "🌏", items: asian.status === "fulfilled" ? asian.value.slice(0, 20) : [], isLoading: false },
        { title: "🇬🇧 British & European TV", emoji: "🇬🇧", items: british.status === "fulfilled" ? british.value.slice(0, 20) : [], isLoading: false },
        { title: "🌎 Latin American Content", emoji: "🌎", items: latin.status === "fulfilled" ? latin.value.slice(0, 20) : [], isLoading: false },
        { title: "🎬 Nollywood Movies", emoji: "🎬", items: nollywood.status === "fulfilled" ? nollywood.value.slice(0, 20) : [], isLoading: false },
        { title: "💃 Bollywood Movies", emoji: "💃", items: bollywood.status === "fulfilled" ? bollywood.value.slice(0, 20) : [], isLoading: false },
      ]);
    };
    loadAll();
  }, []);

  const handleClick = (item: Item) => {
    if (item.media_type === "movie") {
      navigate(`/movie/${item.id}`);
    } else {
      navigate(`/tv/${item.id}`);
    }
  };

  const visibleSliders = sliders.filter(s => s.isLoading || s.items.length > 0);

  return (
    <div className="mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-white mb-1">🌐 World TV & Cinema</h2>
        <p className="text-gray-400 text-sm">Millions of shows & movies from every nation on the globe</p>
      </motion.div>

      {visibleSliders.map((slider, sliderIndex) => (
        <div key={slider.title} className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            {slider.title}
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {slider.isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-32 h-48 bg-white/5 rounded-xl animate-pulse"
                  />
                ))
              : slider.items.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-32 cursor-pointer group relative"
                    onClick={() => handleClick(item)}
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-lg">
                      <LazyLoadImage
                        src={
                          item.poster_path
                            ? `${TMDB_IMG_BASE}${item.poster_path}`
                            : "/defaultPoster.jpg"
                        }
                        alt={item.title || item.name || ""}
                        className="w-32 h-48 object-cover"
                        effect="opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                        <span className="text-white text-xs font-medium line-clamp-2">
                          {item.title || item.name}
                        </span>
                      </div>
                      {item.vote_average ? (
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-md">
                          ★ {item.vote_average.toFixed(1)}
                        </div>
                      ) : null}
                    </div>
                    <p className="text-gray-300 text-xs mt-1.5 truncate">{item.title || item.name}</p>
                  </motion.div>
                ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalWorldTV;
