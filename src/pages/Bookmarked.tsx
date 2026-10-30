import { doc, onSnapshot } from "firebase/firestore";
import { FunctionComponent, useEffect, useState } from "react";
import Title from "../components/Common/Title";
import FilmListViewForBookmarkAndHistory from "../components/FilmListViewForBookmarkAndHistory/FilmListViewForBookmarkAndHistory";
import Footer from "../components/Footer/Footer";
import { db } from "../shared/firebase";
import { Item } from "../shared/types";
import { useAppSelector } from "../store/hooks";
import { useWatchlist } from "../components/Common/QuickWatchlist";
import LibraryNav from "../components/Library/LibraryNav";

interface BookmarkedProps {}

const Bookmarked: FunctionComponent<BookmarkedProps> = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [firebaseFilms, setFirebaseFilms] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { getAll } = useWatchlist();

  // Local watchlist (always available, no sign-in required)
  const localWatchlist: Item[] = getAll().map((w) => ({
    id: typeof w.id === 'string' ? (isNaN(Number(w.id)) ? w.id : Number(w.id)) : w.id,
    title: w.mediaType === 'movie' ? w.title : undefined,
    name: w.mediaType === 'tv' ? w.title : undefined,
    poster_path: w.posterPath,
    backdrop_path: '',
    media_type: w.mediaType,
    vote_average: 0,
    vote_count: 0,
    overview: '',
    genre_ids: [],
    original_language: 'en',
    popularity: 0,
  } as any));

  // Firebase bookmarks for signed-in users
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const unsubDoc = onSnapshot(
      doc(db, "users", currentUser?.uid),
      (doc) => {
        const data = doc.data();
        if (data?.bookmarks && Array.isArray(data.bookmarks)) {
          setFirebaseFilms(data.bookmarks.slice().reverse());
        }
        setIsLoading(false);
      },
      (error) => {
        console.warn("[Bookmarked] Firebase error:", error);
        setFirebaseFilms([]);
        setIsLoading(false);
        setIsError(true);
      }
    );

    return () => unsubDoc();
  }, [currentUser]);

  // Merge firebase bookmarks with local watchlist — deduplicate by id
  const mergedFilms = (() => {
    const firebaseIds = new Set(firebaseFilms.map((f) => String(f.id)));
    const uniqueLocal = localWatchlist.filter((l) => !firebaseIds.has(String(l.id)));
    return [...firebaseFilms, ...uniqueLocal];
  })();

  if (isError && !localWatchlist.length) return <div className="text-white p-10 text-center">Could not load bookmarks.</div>;

  return (
    <>
      <Title value="Bookmarked | StreamLux" />
      <div className="min-h-screen bg-dark">
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">
          <LibraryNav />
        </div>
        <FilmListViewForBookmarkAndHistory
          films={mergedFilms}
          isLoading={isLoading}
          pageType="bookmark"
        />
      </div>
      <Footer />
    </>
  );
};

export default Bookmarked;
