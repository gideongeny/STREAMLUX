import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { DownloadManagerProvider } from "./contexts/DownloadManagerContext";
import DownloadTray from "./components/Common/DownloadTray";

import Protected from "./components/Common/Protected";
import Auth from "./pages/Auth";
import Bookmarked from "./pages/Bookmarked";
import Copyright from "./pages/Copyright";
import Error from "./pages/Error";
import Explore from "./pages/Explore";
import History from "./pages/History";
import Home from "./pages/Home";
import MovieInfo from "./pages/Movie/MovieInfo";
import MovieWatch from "./pages/Movie/MovieWatch";
import SportsHome from "./pages/Sports/SportsHome";
import SportsWatch from "./pages/Sports/SportsWatch";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import TVInfo from "./pages/TV/TVInfo";
import TVWatch from "./pages/TV/TVWatch";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import UserAgreement from "./pages/UserAgreement";
import Disclaimer from "./pages/Disclaimer";
import Download from "./pages/Download";
import CalendarPage from "./pages/CalendarPage";
import Settings from "./pages/Settings";
import YouTubeInfo from "./pages/YouTube/YouTubeInfo";
import MiniPlayer from "./components/FilmWatch/MiniPlayer";
import { auth, db } from "./shared/firebase";
import { useAppDispatch } from "./store/hooks";
import { setCurrentUser } from "./store/slice/authSlice";
import { backendHealthService } from "./services/backendHealth";
import BuyMeACoffee from "./components/Common/BuyMeACoffee";
import { safeStorage } from "./utils/safeStorage";
import { initializeAdMob } from "./services/capacitorAds";

function App() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Initialize AdMob on native Android/iOS builds (no-op on web)
  useEffect(() => {
    initializeAdMob().catch(console.warn);
  }, []);

  // Custom localStorage hook that handles JSON parsing errors gracefully
  const getInitialSignedIn = (): boolean => {
    try {
      if (typeof window === "undefined") return false;
      const stored = localStorage.getItem("isSignedIn");
      if (!stored) return false;

      // Try to parse as JSON first
      try {
        return JSON.parse(stored) === true;
      } catch {
        // If JSON parse fails, check if it's a plain string
        if (stored === "true") return true;
        if (stored === "false") return false;
        // If invalid, clear it and return default
        localStorage.removeItem("isSignedIn");
      }
    } catch (error) {
      console.warn("Error reading isSignedIn from localStorage:", error);
      try {
        localStorage.removeItem("isSignedIn");
      } catch { }
    }
    return false;
  };

  const [isSignedIn, setIsSignedIn] = useState<boolean>(() => getInitialSignedIn());

  // Sync to localStorage when isSignedIn changes
  useEffect(() => {
    try {
      localStorage.setItem("isSignedIn", JSON.stringify(isSignedIn));
    } catch (error) {
      console.warn("Error saving isSignedIn to localStorage:", error);
    }
  }, [isSignedIn]);

  // Auto-wake backend on app load and keep it alive
  useEffect(() => {
    backendHealthService.wakeBackend();
    const cleanup = backendHealthService.startKeepAlive();
    return cleanup;
  }, []);

  // Initialize Theme from Storage
  useEffect(() => {
    const savedTheme = safeStorage.get("theme_primary_color");
    if (savedTheme) {
      document.documentElement.style.setProperty("--color-primary", savedTheme);
    }
  }, []);

  useEffect(() => {
    let unSubDoc: (() => void) | undefined;
    const unSubAuth: () => void = onAuthStateChanged(
      auth,
      (user) => {
        try {
          if (!user) {
            dispatch(setCurrentUser(null));
            setIsSignedIn(false);
            return;
          }

          setIsSignedIn(true);

          if (!user.providerData || user.providerData.length === 0) {
            unSubDoc = onSnapshot(
              doc(db, "users", user.uid),
              (docSnapshot) => {
                try {
                  const data = docSnapshot.data();
                  dispatch(
                    setCurrentUser({
                      displayName: user.displayName || data?.firstName + " " + data?.lastName || "",
                      photoURL: user.photoURL || data?.photoUrl || "",
                      email: user.email || "",
                      emailVerified: user.emailVerified,
                      uid: user.uid,
                    })
                  );
                } catch (error) {
                  console.error("Error setting user data (No Provider):", error);
                  dispatch(
                    setCurrentUser({
                      displayName: user.displayName || "",
                      photoURL: user.photoURL || "",
                      email: user.email || "",
                      emailVerified: user.emailVerified,
                      uid: user.uid,
                    })
                  );
                }
              }
            );
            return;
          }

          const providerId = user.providerData[0]?.providerId;

          if (providerId === "google.com") {
            unSubDoc = onSnapshot(
              doc(db, "users", user.uid),
              (docSnapshot) => {
                try {
                  const data = docSnapshot.data();
                  dispatch(
                    setCurrentUser({
                      displayName:
                        (data?.lastName || "") + " " + (data?.firstName || "") || user.displayName || "",
                      email: user.email || "",
                      emailVerified: user.emailVerified,
                      photoURL: data?.photoUrl || user.photoURL || "",
                      uid: user.uid,
                    })
                  );
                } catch (error) {
                  console.error("Error setting user data (Google):", error);
                  dispatch(
                    setCurrentUser({
                      displayName: user.displayName || "",
                      email: user.email || "",
                      emailVerified: user.emailVerified,
                      photoURL: user.photoURL || "",
                      uid: user.uid,
                    })
                  );
                }
              }
            );
          } else {
            unSubDoc = onSnapshot(
              doc(db, "users", user.uid),
              (docSnapshot) => {
                try {
                  const data = docSnapshot.data();
                  dispatch(
                    setCurrentUser({
                      displayName: (data?.lastName || "") + " " + (data?.firstName || "") || user.displayName || "",
                      photoURL: data?.photoUrl || user.photoURL || "",
                      email: user.email || "",
                      emailVerified: user.emailVerified,
                      uid: user.uid,
                    })
                  );
                } catch (error) {
                  console.error("Error setting user data (Other):", error);
                  dispatch(
                    setCurrentUser({
                      displayName: user.displayName || "",
                      photoURL: user.photoURL || "",
                      email: user.email || "",
                      emailVerified: user.emailVerified,
                      uid: user.uid,
                    })
                  );
                }
              }
            );
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error);
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        dispatch(setCurrentUser(null));
        setIsSignedIn(false);
      }
    );

    return () => {
      unSubAuth();
      if (unSubDoc) unSubDoc();
    };
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname, location.search]);

  return (
    <DownloadManagerProvider>
      <div className="transition-colors duration-300">
        <Routes>
          <Route index element={<Home />} />
          <Route path="movie/:id" element={<MovieInfo />} />
          <Route path="tv/:id" element={<TVInfo />} />
          <Route path="movie/:id/watch" element={<MovieWatch />} />
          <Route path="tv/:id/watch" element={<TVWatch />} />
          <Route path="sports" element={<SportsHome />} />
          <Route path="sports/:leagueId/:matchId/watch" element={<SportsWatch />} />
          <Route path="explore" element={<Explore />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="search" element={<Search />} />
          <Route path="youtube/:id" element={<YouTubeInfo />} />
          <Route path="auth" element={<Auth />} />
          <Route path="copyright" element={<Copyright />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="user-agreement" element={<UserAgreement />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          <Route path="download" element={<Download />} />
          <Route path="bookmarked" element={<Protected isSignedIn={isSignedIn}><Bookmarked /></Protected>} />
          <Route path="history" element={<Protected isSignedIn={isSignedIn}><History /></Protected>} />
          <Route path="profile" element={<Protected isSignedIn={isSignedIn}><Profile /></Protected>} />
          <Route path="*" element={<Error />} />
        </Routes>
        <MiniPlayer />
        <BuyMeACoffee variant="floating" />
        <DownloadTray />
      </div>
    </DownloadManagerProvider>
  );
}

export default App;
