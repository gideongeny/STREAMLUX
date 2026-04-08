import axios from "../shared/axios";
import {
  FilmInfo,
  getWatchReturnedType,
  Item,
  Reviews,
  Video,
} from "../shared/types";
import { getYouTubeMovieFullDetail, getYouTubeMovieWatch } from "./youtubeMapping";

export const getMovieFullDetail = async (id: number | string): Promise<FilmInfo> => {
  if (typeof id === 'string' && isNaN(Number(id))) {
      return getYouTubeMovieFullDetail(id);
  }

  const response = await Promise.all([
    axios.get(`/movie/${id}`),
    axios.get(`/movie/${id}/credits`).catch(() => ({ data: { cast: [] } })),
    axios.get(`/movie/${id}/reviews`).catch(() => ({ data: { results: [] } })),
    axios.get(`/movie/${id}/similar`).catch(() => ({ data: { results: [] } })),
    axios.get(`/movie/${id}/videos`).catch(() => ({ data: { results: [] } })),
  ]);

  const movieInfo = response.reduce((final, current, index) => {
    switch (index) {
      case 0:
        final.detail = { ...current.data, media_type: "movie" };
        break;

      case 1:
        final.credits = current.data.cast.slice(0, 8);
        break;

      case 2:
        final.reviews = current.data.results.filter(
          (item: Reviews) => item.author !== "MSB"
        );
        break;

      case 3:
        final.similar = current.data.results.map((item: Item) => ({
          ...item,
          media_type: "movie",
        }));
        break;

      case 4:
        final.videos = current.data.results
          .filter((item: Video) => item.site === "YouTube")
          .reduce((acc: Video[], current: Video) => {
            if (current.type === "Trailer") return [current, ...acc];

            return [...acc, current];
          }, [] as Video[]);
        break;
    }

    return final;
  }, {} as FilmInfo);

  return movieInfo;
};

export const getWatchMovie = async (
  id: number | string
): Promise<getWatchReturnedType> => {
  if (typeof id === 'string' && isNaN(Number(id))) {
      return getYouTubeMovieWatch(id);
  }

  const res = await Promise.all([
    axios.get(`/movie/${id}`),
    axios.get(`/movie/${id}/recommendations`).catch(() => ({ data: { results: [] } })),
  ]);

  return {
    detail: res[0].data,
    recommendations: (res[1].data.results || []).filter(
      (item: Item) => item.poster_path
    ),
  };
};
