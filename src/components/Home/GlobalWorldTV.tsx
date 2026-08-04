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
    { title: "K-Dramas & Korean Cinema", items: [], isLoading: true },
    { title: "Anime & J-Dramas",          items: [], isLoading: true },
    { title: "African Originals",          items: [], isLoading: true },
    { title: "Turkish Dramas (Diziler)",   items: [], isLoading: true },
    { title: "Bollywood & Indian Cinema",  items: [], isLoading: true },
    { title: "Asian Dramas",               items: [], isLoading: true },
    { title: "British & European TV",      items: [], isLoading: true },
    { title: "Latin American Content",     items: [], isLoading: true },
    { title: "Nollywood Movies",           items: [], isLoading: true },
    { title: "Bollywood Movies",           items: [], isLoading: true },
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
        { title: "K-Dramas & Korean Cinema", items: korean.status    === "fulfilled" ? korean.value    : [], isLoading: false },
        { title: "Anime & J-Dramas",          items: japanese.status  === "fulfilled" ? japanese.value  : [], isLoading: false },
        { title: "African Originals",          items: african.status   === "fulfilled" ? african.value   : [], isLoading: false },
        { title: "Turkish Dramas (Diziler)",   items: turkish.status   === "fulfilled" ? turkish.value   : [], isLoading: false },
        { title: "Indian TV & Web Series",     items: indian.status    === "fulfilled" ? indian.value    : [], isLoading: false },
        { title: "K/J/Thai/Chinese Dramas",    items: asian.status     === "fulfilled" ? asian.value     : [], isLoading: false },
        { title: "British & European TV",      items: british.status   === "fulfilled" ? british.value   : [], isLoading: false },
        { title: "Latin American Content",     items: latin.status     === "fulfilled" ? latin.value     : [], isLoading: false },
        { title: "Nollywood Movies",           items: nollywood.status === "fulfilled" ? nollywood.value : [], isLoading: false },
        { title: "Bollywood Movies",           items: bollywood.status === "fulfilled" ? bollywood.value : [], isLoading: false },
      ];

      setSliders(newSliders);
      safeStorage.set(cacheKey, JSON.stringify(newSliders));
    };
    loadAll();
  }, []);

  const visibleSliders = sliders.filter(s => s.isLoading || s.items.length > 0);

  const getSeeMoreParams = (title: string) => {
    const lowTitle = title.toLowerCase();
    if (lowTitle.includes("korean")) return { with_original_language: "ko" };
    if (lowTitle.includes("japanese") || lowTitle.includes("anime")) return { with_original_language: "ja" };
    if (lowTitle.includes("african")) return { with_original_language: "sw|yo|ig|zu|xh" };
    if (lowTitle.includes("turkish")) return { with_original_language: "tr" };
    if (lowTitle.includes("indian") || lowTitle.includes("bollywood")) return { with_original_language: "hi|te|ta|ml|kn" };
    if (lowTitle.includes("nollywood")) return { with_origin_country: "NG", with_original_language: "en" };
    if (lowTitle.includes("british")) return { with_origin_country: "GB" };
    if (lowTitle.includes("latin")) return { with_original_language: "es|pt", with_origin_country: "MX|BR|AR|CO" };
    return {};
  };

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-2">
        {visibleSliders.map((slider) => (
          <SectionSlider
            key={slider.title}
            title={`${slider.emoji} ${slider.title}`}
            films={slider.isLoading ? undefined : slider.items}
            isLoading={slider.isLoading}
            limitNumber={20}
            seeMoreParams={getSeeMoreParams(slider.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default GlobalWorldTV;
