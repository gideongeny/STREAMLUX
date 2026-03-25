import axios from "../shared/axios";
import {
  DetailSeason,
  FilmInfo,
  getWatchReturnedType,
  Item,
  Reviews,
  Video,
} from "../shared/types";
import { getYouTubeTVFullDetail, getYouTubeTVWatch } from "./youtubeMapping";

export const getTVFullDetail = async (id: number | string): Promise<FilmInfo> => {
  if (typeof id === 'string' && isNaN(Number(id))) {
      return getYouTubeTVFullDetail(id);
  }

  const response = await Promise.all([
    axios.get(`/tv/${id}`),
    axios.get(`/tv/${id}/credits`),
    axios.get(`/tv/${id}/reviews`),
    axios.get(`/tv/${id}/similar`),
    axios.get(`/tv/${id}/videos`),
  ]);

  const tvInfo = response.reduce((final, current, index) => {
    switch (index) {
      case 0:
        final.detail = { ...current.data, media_type: "tv" };
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
          media_type: "tv",
        }));
        break;

      case 4:
        final.videos = current.data.results
          .filter((item: Video) => item.site === "YouTube")
          .reduce((acc: any, current: Video) => {
            if (current.type === "Trailer") return [current, ...acc];
            else return [...acc, current];
          }, [] as Video[]);
        break;
    }

    return final;
  }, {} as FilmInfo);

  return tvInfo;
};

export const getWatchTV = async (id: number | string, seasonNumber: number = 1): Promise<getWatchReturnedType> => {
  if (typeof id === 'string' && isNaN(Number(id))) {
      return getYouTubeTVWatch(id, seasonNumber);
  }

  const res = await Promise.all([
    axios.get(`/tv/${id}`),
    axios.get(`/tv/${id}/recommendations`),
    axios.get(`/tv/${id}/season/${seasonNumber}`).catch(() => ({ data: null }))
  ]);

  const data = {
    detail: res[0].data,
    recommendations: res[1].data.results,
  };

  const detailSeasons: DetailSeason[] = (
    await Promise.all(
      data.detail.seasons.map((season: any) =>
        axios.get(`/tv/${id}/season/${season.season_number}`)
      )
    )
  ).map((res) => res.data);

  return { ...data, detailSeasons };
};
