import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillStar, AiOutlineClose, AiOutlineGlobal } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LazyLoadImage, LazyLoadComponent } from "react-lazy-load-image-component";
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
import { resizeImage } from "../../shared/utils";
import { safeStorage } from "../../utils/safeStorage";

interface RegionSlider {
  title: string;
  emoji: string;
  items: Item[];
  isLoading: boolean;
}

const GlobalWorldTV: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sliders, setSliders] = useState<RegionSlider[]>([
    { title: t("K-Dramas & Korean Cinema"), emoji: "🇰🇷", items: [], isLoading: true },
    { title: t("Anime & J-Dramas"), emoji: "🇯🇵", items: [], isLoading: true },
    { title: t("African Originals"), emoji: "🌍", items: [], isLoading: true },
    { title: t("Turkish Dramas (Diziler)"), emoji: "🇹🇷", items: [], isLoading: true },
    { title: t("Bollywood & Indian Cinema"), emoji: "🇮🇳", items: [], isLoading: true },
    { title: t("Asian Dramas"), emoji: "🌏", items: [], isLoading: true },
    { title: t("British & European Originals"), emoji: "🇬🇧", items: [], isLoading: true },
    { title: t("Latin American TV & Film"), emoji: "🌎", items: [], isLoading: true },
    { title: t("Nollywood Movies"), emoji: "🎬", items: [], isLoading: true },
    { title: t("Bollywood Movies"), emoji: "💃", items: [], isLoading: true },
  ]);

  useEffect(() => {
    const loadAll = async () => {
      const cacheKey = "global-world-tv-cache";
      const cachedData = safeStorage.getParsed<RegionSlider[] | null>(cacheKey, null);
      
      if (cachedData) {
        setSliders(cachedData);
        return; // Zero-latency hydration
      }

      // Fetch in batches to avoid hitting rate limits
      const [korean, japanese, african, turkish, indian, asian, british, latin, nollywood, bollywood] =
        await Promise.allSettled([
          getKoreanContent().then(res => res.slice(0, 30)),
          getJapaneseContent().then(res => res.slice(0, 30)),
          getAfricanContent().then(res => res.slice(0, 30)),
          getTurkishContent().then(res => res.slice(0, 30)),
          getIndianContent().then(res => res.slice(0, 30)),
          getAsianDramas().then(res => res.slice(0, 30)),
          getBritishContent().then(res => res.slice(0, 30)),
          getLatinContent().then(res => res.slice(0, 30)),
          getNollywoodMovies().then(res => res.slice(0, 30)),
          getBollywoodMovies().then(res => res.slice(0, 30)),
        ]);

      const newSliders: RegionSlider[] = [
        { title: t("K-Dramas & Korean Cinema"), emoji: "🇰🇷", items: korean.status === "fulfilled" ? korean.value.slice(0, 20) : [], isLoading: false },
        { title: t("Anime & J-Dramas"), emoji: "🇯🇵", items: japanese.status === "fulfilled" ? japanese.value.slice(0, 20) : [], isLoading: false },
        { title: t("African Originals"), emoji: "🌍", items: african.status === "fulfilled" ? african.value.slice(0, 20) : [], isLoading: false },
        { title: t("Turkish Dramas (Diziler)"), emoji: "🇹🇷", items: turkish.status === "fulfilled" ? turkish.value.slice(0, 20) : [], isLoading: false },
        { title: t("Indian TV & Web Series"), emoji: "🇮🇳", items: indian.status === "fulfilled" ? indian.value.slice(0, 20) : [], isLoading: false },
        { title: t("K/J/Thai/Chinese Dramas"), emoji: "🌏", items: asian.status === "fulfilled" ? asian.value.slice(0, 20) : [], isLoading: false },
        { title: t("British & European TV"), emoji: "🇬🇧", items: british.status === "fulfilled" ? british.value.slice(0, 20) : [], isLoading: false },
        { title: t("Latin American Content"), emoji: "🌎", items: latin.status === "fulfilled" ? latin.value.slice(0, 20) : [], isLoading: false },
        { title: t("Nollywood Movies"), emoji: "🎬", items: nollywood.status === "fulfilled" ? nollywood.value.slice(0, 20) : [], isLoading: false },
        { title: t("Bollywood Movies"), emoji: "💃", items: bollywood.status === "fulfilled" ? bollywood.value.slice(0, 20) : [], isLoading: false },
      ];
      
      setSliders(newSliders);
      safeStorage.set(cacheKey, JSON.stringify(newSliders));
    };
    loadAll();
  }, []);

  const handleClick = (item: Item) => {
    if ((item as any).isScraped) {
      navigate(`/movie/${item.id}?src=${encodeURIComponent((item as any).scrapedUrl)}&scraped=true`);
      return;
    }
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
        <h2 className="text-2xl font-bold text-white mb-1">🌐 {t("World TV & Cinema")}</h2>
        <p className="text-gray-400 text-sm">{t("Millions of shows & movies from every nation on the globe")}</p>
      </motion.div>

      {visibleSliders.map((slider, sliderIndex) => (
        <div key={slider.title} className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            {slider.emoji} {slider.title}
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
                  <LazyLoadComponent key={item.id} placeholder={<div className="flex-shrink-0 w-32 h-48 bg-dark-lighten rounded-xl animate-pulse" />}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-32 cursor-pointer group relative block"
                    onClick={() => handleClick(item)}
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-lg bg-dark/40 block w-full">
                      <LazyLoadImage
                        src={(item as any).isScraped ? "/logo.svg" : resizeImage(item.poster_path, "w342")}
                        alt={item.title || item.name || ""}
                        className="w-32 h-48 object-cover block"
                        wrapperClassName="w-full block"
                        effect="opacity"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent ${(item as any).isScraped ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200 flex items-end p-2`}>
                        <div className="flex flex-col gap-0.5">
                          {(item as any).isScraped && (
                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-black/40 px-1 py-0.5 rounded w-fit">
                              {(item as any).provider || 'SCRAPED'}
                            </span>
                          )}
                          {/* Rating Badge */}
                          {item.vote_average != null && item.vote_average > 0 && (
                              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                  <AiFillStar className="text-primary text-xs" />
                                  <span className="text-white text-[10px] font-black tracking-tighter">
                                      {(item.vote_average || 0).toFixed(1)}
                                  </span>
                              </div>
                          )}
                          <span className="text-white text-xs font-medium line-clamp-2">
                            {item.title || item.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs mt-1.5 truncate">{item.title || item.name}</p>
                  </motion.div>
                  </LazyLoadComponent>
                ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalWorldTV;
