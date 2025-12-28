import { FunctionComponent, useMemo } from "react";
import Title from "../components/Common/Title";
import FilmListViewForBookmarkAndHistory from "../components/FilmListViewForBookmarkAndHistory/FilmListViewForBookmarkAndHistory";
import Footer from "../components/Footer/Footer";
import { useWatchProgress } from "../hooks/useWatchProgress";
import { Item } from "../shared/types";

interface HistoryProps { }

const History: FunctionComponent<HistoryProps> = () => {
  const { watchHistory, clearProgress } = useWatchProgress();

  // Map watchHistory to Item[] for display
  const historyFilms: Item[] = useMemo(() => {
    return watchHistory.map((h) => ({
      id: h.mediaId,
      media_type: h.mediaType,
      title: h.title,
      name: h.title, // For TV support
      poster_path: h.posterPath,
      vote_average: 0,
      vote_count: 0,
      overview: "",
      genre_ids: [],
      original_language: "en",
      popularity: 0,
      backdrop_path: "",
      release_date: "",
      first_air_date: "",
      origin_country: [],
      original_title: h.title,
      original_name: h.title,
    }));
  }, [watchHistory]);

  const handleRemove = (ids: number[]) => {
    ids.forEach((id) => {
      // Find the item in history to get its type
      const item = watchHistory.find((h) => h.mediaId === id);
      if (item) {
        clearProgress(item.mediaId, item.mediaType);
      }
    });
  };

  return (
    <>
      <Title value="History | StreamLux" />
      <FilmListViewForBookmarkAndHistory
        films={historyFilms}
        isLoading={false}
        pageType="history"
        onRemove={handleRemove}
      />

      <Footer />
    </>
  );
};

export default History;
