import axios from "../shared/axios";
import { BannerInfo } from "../shared/types";

export const tmdbApi = {
  getFilmDetail: async (type: "movie" | "tv", id: string | number): Promise<BannerInfo | null> => {
    try {
      const [detailRes, imageRes, videoRes, translationRes] = await Promise.all([
        axios.get(`/${type}/${id}`),
        axios.get(`/${type}/${id}/images`),
        axios.get(`/${type}/${id}/videos`),
        axios.get(`/${type}/${id}/translations`)
      ]);

      const detail = detailRes.data;
      const images = imageRes.data;
      const videos = videoRes.data;
      const translations = translationRes.data?.translations || [];

      // Extract premium logo
      const logo = images?.logos?.find((l: any) => l.iso_639_1 === "en")?.file_path || 
                   images?.logos?.[0]?.file_path;

      // Extract trailer
      const trailer = videos?.results?.find(
        (v: { type?: string; site?: string }) => v.type === "Trailer" && v.site === "YouTube"
      )?.key;

      // Extract relevant translations
      const relevantTranslations = translations
        .filter((t: any) => ["en", "sw"].includes(t.iso_639_1))
        .map((t: any) => t.data?.title || t.data?.name)
        .filter(Boolean);

      return {
        genre: detail?.genres?.slice(0, 3) || [],
        translation: relevantTranslations.length > 0 ? relevantTranslations : [detail?.title || detail?.name],
        trailer,
        logo
      };
    } catch (error) {
      console.error(`Error fetching TMDB ${type} detail for ${id}:`, error);
      return null;
    }
  }
};
