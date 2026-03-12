import axios from "../shared/axios";
import { Item } from "../shared/types";
import { getBackendBase } from "./download";

// Use the project's unified backend entry point
const getApiBase = () => getBackendBase() + "/api";

// Fetches TV or movie content for a specific origin country from TMDB Discover
const fetchByCountry = async (
  type: "movie" | "tv",
  countryCode: string,
  language: string = "en-US",
  pages: number = 3
): Promise<Item[]> => {
  try {
    const allItems: Item[] = [];
    const fetchPromises = [];
    for (let page = 1; page <= pages; page++) {
      fetchPromises.push(
        axios.get(`${getApiBase()}/proxy/tmdb`, {
          params: {
            endpoint: `/discover/${type}`,
            with_origin_country: countryCode,
            language,
            sort_by: "popularity.desc",
            "vote_count.gte": 5,
            page,
          },
          timeout: 10000,
        }).catch(() => null)
      );
    }
    const responses = await Promise.all(fetchPromises);
    responses.forEach((response) => {
      if (!response) return;
      const items = (response.data.results || []).map((item: any) => ({
        ...item,
        media_type: type,
      }));
      allItems.push(...items);
    });
    const unique = allItems.filter(
      (item: Item, index: number, self: Item[]) =>
        index === self.findIndex((i: Item) => i.id === item.id)
    );
    return unique;
  } catch {
    return [];
  }
};

// ========================
// 🌍 All-Region TV Content
// ========================

/** Africa **/
export const getNigerianContent = () => fetchByCountry("tv", "NG", "en-US");
export const getGhanaianContent = () => fetchByCountry("tv", "GH", "en-US");
export const getEthiopianContent = () => fetchByCountry("tv", "ET", "en-US");
export const getKenyanContent = () => fetchByCountry("tv", "KE", "en-US");
export const getSouthAfricanContent = () => fetchByCountry("tv", "ZA", "en-US");
export const getEgyptianContent = () => fetchByCountry("tv", "EG", "ar");
export const getAlgerianContent = () => fetchByCountry("tv", "DZ", "fr");
export const getMoroccanContent = () => fetchByCountry("tv", "MA", "fr");

/** Asia **/
export const getKoreanContent = () => fetchByCountry("tv", "KR", "ko");
export const getJapaneseContent = () => fetchByCountry("tv", "JP", "ja");
export const getChineseContent = () => fetchByCountry("tv", "CN", "zh");
export const getTaiwaneseContent = () => fetchByCountry("tv", "TW", "zh");
// India — Bollywood / Regional
export const getIndianContent = () => fetchByCountry("tv", "IN", "hi");
export const getTamilContent = () => fetchByCountry("tv", "IN", "ta");
export const getTeluguContent = () => fetchByCountry("tv", "IN", "te");
export const getMalayalamContent = () => fetchByCountry("tv", "IN", "ml");
// South East Asia
export const getThaiContent = () => fetchByCountry("tv", "TH", "th");
export const getPhilippineContent = () => fetchByCountry("tv", "PH", "en");
export const getIndonesianContent = () => fetchByCountry("tv", "ID", "id");
export const getVietnameseContent = () => fetchByCountry("tv", "VN", "vi");
export const getMalaysianContent = () => fetchByCountry("tv", "MY", "ms");

/** Middle East **/
export const getTurkishContent = () => fetchByCountry("tv", "TR", "tr");
export const getSaudiContent = () => fetchByCountry("tv", "SA", "ar");
export const getLebanesContent = () => fetchByCountry("tv", "LB", "ar");

/** Europe **/
export const getBritishContent = () => fetchByCountry("tv", "GB", "en-US");
export const getFrenchContent = () => fetchByCountry("tv", "FR", "fr");
export const getGermanContent = () => fetchByCountry("tv", "DE", "de");
export const getItalianContent = () => fetchByCountry("tv", "IT", "it");
export const getSpanishContent = () => fetchByCountry("tv", "ES", "es");
export const getRussianContent = () => fetchByCountry("tv", "RU", "ru");
export const getSwedishContent = () => fetchByCountry("tv", "SE", "sv");
export const getPolishContent = () => fetchByCountry("tv", "PL", "pl");
export const getDanishContent = () => fetchByCountry("tv", "DK", "da");
export const getNorwegianContent = () => fetchByCountry("tv", "NO", "no");

/** Americas **/
export const getMexicanContent = () => fetchByCountry("tv", "MX", "es");
export const getBrazilianContent = () => fetchByCountry("tv", "BR", "pt");
export const getColombianContent = () => fetchByCountry("tv", "CO", "es");
export const getArgentineContent = () => fetchByCountry("tv", "AR", "es");
export const getCanadianContent = () => fetchByCountry("tv", "CA", "en-US");
export const getAmericanContent = () => fetchByCountry("tv", "US", "en-US");

/** Anime (Japan) **/
export const getAnimeContent = () => fetchByCountry("tv", "JP", "ja");

/** Movies — Global **/
export const getBollywoodMovies = () => fetchByCountry("movie", "IN", "hi");
export const getNollywoodMovies = () => fetchByCountry("movie", "NG", "en-US");
export const getKoreanMovies = () => fetchByCountry("movie", "KR", "ko");
export const getTurkishMovies = () => fetchByCountry("movie", "TR", "tr");
export const getFrenchMovies = () => fetchByCountry("movie", "FR", "fr");
export const getSpanishMovies = () => fetchByCountry("movie", "ES", "es");
export const getLatinAmericanMovies = () =>
  Promise.all([
    fetchByCountry("movie", "MX", "es"),
    fetchByCountry("movie", "BR", "pt"),
    fetchByCountry("movie", "CO", "es"),
  ]).then((results) =>
    results.flat().filter(
      (item: Item, index: number, self: Item[]) =>
        index === self.findIndex((i: Item) => i.id === item.id)
    )
  );

// ========================
// 📦 Convenience Aggregators
// ========================

export const getAfricanContent = async (): Promise<Item[]> => {
  const [ng, gh, ke, za, et, eg] = await Promise.all([
    getNigerianContent(),
    getGhanaianContent(),
    getKenyanContent(),
    getSouthAfricanContent(),
    getEthiopianContent(),
    getEgyptianContent(),
  ]);
  return [...ng, ...gh, ...ke, ...za, ...et, ...eg].filter(
    (item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id)
  );
};

export const getAsianDramas = async (): Promise<Item[]> => {
  const [kr, jp, cn, th] = await Promise.all([
    getKoreanContent(),
    getJapaneseContent(),
    getChineseContent(),
    getThaiContent(),
  ]);
  return [...kr, ...jp, ...cn, ...th].filter(
    (item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id)
  );
};

export const getEuropeanContent = async (): Promise<Item[]> => {
  const [gb, fr, de, it, es] = await Promise.all([
    getBritishContent(),
    getFrenchContent(),
    getGermanContent(),
    getItalianContent(),
    getSpanishContent(),
  ]);
  return [...gb, ...fr, ...de, ...it, ...es].filter(
    (item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id)
  );
};

export const getLatinContent = async (): Promise<Item[]> => {
  const [mx, br, co, ar] = await Promise.all([
    getMexicanContent(),
    getBrazilianContent(),
    getColombianContent(),
    getArgentineContent(),
  ]);
  return [...mx, ...br, ...co, ...ar].filter(
    (item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id)
  );
};
