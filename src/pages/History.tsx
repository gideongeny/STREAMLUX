import { doc, onSnapshot } from "firebase/firestore";
import { FunctionComponent, useEffect, useState } from "react";
import Title from "../components/Common/Title";
import FilmListViewForBookmarkAndHistory from "../components/FilmListViewForBookmarkAndHistory/FilmListViewForBookmarkAndHistory";
import Footer from "../components/Footer/Footer";
import { db } from "../shared/firebase";
import { Item } from "../shared/types";
import { useAppSelector } from "../store/hooks";
import { getLocalHistory, toItem, LocalHistoryItem } from "../services/localWatchHistory";
import LibraryNav from "../components/Library/LibraryNav";

interface HistoryProps {}

const History: FunctionComponent<HistoryProps> = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [firebaseFilms, setFirebaseFilms] = useState<Item[]>([]);
  const [localFilms, setLocalFilms] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Load local watch history (works for guests)
  useEffect(() => {
    const local = getLocalHistory();
    setLocalFilms(local.map(toItem));
    setIsLoading(false);
  }, []);

  // Additionally load Firebase history for signed-in users
  useEffect(() => {
    if (!currentUser) return;

    const unsubDoc = onSnapshot(
      doc(db, "users", currentUser?.uid),
      (doc) => {
        const data = doc.data();
        if (data?.recentlyWatch && Array.isArray(data.recentlyWatch)) {
          setFirebaseFilms(data.recentlyWatch.slice().reverse());
        }
        setIsLoading(false);
      },
      (error) => {
        console.warn("[History] Firebase error:", error);
        setFirebaseFilms([]);
        setIsLoading(false);
        setIsError(true);
      }
    );

    return () => unsubDoc();
  }, [currentUser]);

  // Merge: deduplicate by id — prefer Firebase record if id matches (it has full TMDB metadata)
  const mergedFilms = (() => {
    const firebaseIds = new Set(firebaseFilms.map((f) => String(f.id)));
    const uniqueLocal = localFilms.filter((l) => !firebaseIds.has(String(l.id)));
    // Firebase records (most recent first) + local-only records sorted by watchedAt desc
    const combined = [...firebaseFilms, ...uniqueLocal];
    return combined;
  })();

  if (isError && !localFilms.length) return <div className="text-white p-10 text-center">Could not load history.</div>;

  return (
    <>
      <Title value="History | StreamLux" />
      <div className="min-h-screen bg-dark">
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">
          <LibraryNav />
        </div>
        <FilmListViewForBookmarkAndHistory
          films={mergedFilms}
          isLoading={isLoading}
          pageType="history"
        />
      </div>
      <Footer />
    </>
  );
};

export default History;
