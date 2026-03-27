import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
import { safeStorage } from "../../utils/safeStorage";
import SectionSlider from "../Slider/SectionSlider";

interface RegionSlider {
  title: string;
  emoji: string;
  items: Item[];
  isLoading: boolean;
}

const GlobalWorldTV: FC = () => {
  const { t } = useTranslation();
  const [sliders, setSliders] = useState<RegionSlider[]>([
    { title: "K-Dramas & Korean Cinema", emoji: "🇰🇷", items: [], isLoading: true },
    { title: "Anime & J-Dramas",          emoji: "🇯🇵", items: [], isLoading: true },
    { title: "African Originals",          emoji: "🌍", items: [], isLoading: true },
    { title: "Turkish Dramas (Diziler)",   emoji: "🇹🇷", items: [], isLoading: true },
    { title: "Bollywood & Indian Cinema",  emoji: "🇮🇳", items: [], isLoading: true },
    { title: "Asian Dramas",               emoji: "🌏", items: [], isLoading: true },
    { title: "British & European TV",      emoji: "🇬🇧", items: [], isLoading: true },
    { title: "Latin American Content",     emoji: "🌎", items: [], isLoading: true },
    { title: "Nollywood Movies",           emoji: "🎬", items: [], isLoading: true },
    { title: "Bollywood Movies",           emoji: "💃", items: [], isLoading: true },
  ]);

  useEffect(() => {
    const loadAll = async () => {
      const cacheKey = "global-world-tv-v2";
      const cached = safeStorage.getParsed<RegionSlider[] | null>(cacheKey, null);
      if (cached && cached.length > 0) {
        setSliders(cached);
        return;
      }

      const [korean, japanese, african, turkish, indian, asian, british, latin, nollywood, bollywood] =
        await Promise.allSettled([
          getKoreanContent().then(r => r.slice(0, 30)),
          getJapaneseContent().then(r => r.slice(0, 30)),
          getAfricanContent().then(r => r.slice(0, 30)),
          getTurkishContent().then(r => r.slice(0, 30)),
          getIndianContent().then(r => r.slice(0, 30)),
          getAsianDramas().then(r => r.slice(0, 30)),
          getBritishContent().then(r => r.slice(0, 30)),
          getLatinContent().then(r => r.slice(0, 30)),
          getNollywoodMovies().then(r => r.slice(0, 30)),
          getBollywoodMovies().then(r => r.slice(0, 30)),
        ]);

      const newSliders: RegionSlider[] = [
        { title: "K-Dramas & Korean Cinema", emoji: "🇰🇷", items: korean.status    === "fulfilled" ? korean.value    : [], isLoading: false },
        { title: "Anime & J-Dramas",          emoji: "🇯🇵", items: japanese.status  === "fulfilled" ? japanese.value  : [], isLoading: false },
        { title: "African Originals",          emoji: "🌍", items: african.status   === "fulfilled" ? african.value   : [], isLoading: false },
        { title: "Turkish Dramas (Diziler)",   emoji: "🇹🇷", items: turkish.status   === "fulfilled" ? turkish.value   : [], isLoading: false },
        { title: "Indian TV & Web Series",     emoji: "🇮🇳", items: indian.status    === "fulfilled" ? indian.value    : [], isLoading: false },
        { title: "K/J/Thai/Chinese Dramas",    emoji: "🌏", items: asian.status     === "fulfilled" ? asian.value     : [], isLoading: false },
        { title: "British & European TV",      emoji: "🇬🇧", items: british.status   === "fulfilled" ? british.value   : [], isLoading: false },
        { title: "Latin American Content",     emoji: "🌎", items: latin.status     === "fulfilled" ? latin.value     : [], isLoading: false },
        { title: "Nollywood Movies",           emoji: "🎬", items: nollywood.status === "fulfilled" ? nollywood.value : [], isLoading: false },
        { title: "Bollywood Movies",           emoji: "💃", items: bollywood.status === "fulfilled" ? bollywood.value : [], isLoading: false },
      ];

      setSliders(newSliders);
      safeStorage.set(cacheKey, JSON.stringify(newSliders));
    };
    loadAll();
  }, []);

  const visibleSliders = sliders.filter(s => s.isLoading || s.items.length > 0);

  return (
    <div className="mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-2"
      >
        <h2 className="text-2xl font-black text-white tracking-tighter">
          🌐 World TV <span className="text-primary">&</span> Cinema
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Millions of shows & movies from every nation on the globe
        </p>
      </motion.div>

      <div className="flex flex-col gap-2">
        {visibleSliders.map((slider) => (
          <SectionSlider
            key={slider.title}
            title={`${slider.emoji} ${slider.title}`}
            films={slider.isLoading ? undefined : slider.items}
            isLoading={slider.isLoading}
            limitNumber={20}
          />
        ))}
      </div>
    </div>
  );
};

export default GlobalWorldTV;
