import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';

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

function App() {
  const location = useLocation();
  const dispatch = useAppDispatch();

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
    // Wake backend immediately when app loads
    backendHealthService.wakeBackend();

    // Set up keep-alive pinging (every 10 minutes)
    const cleanup = backendHealthService.startKeepAlive();

    // Cleanup on unmount
    return cleanup;
  }, []);

  useEffect(() => {
    let unSubDoc: (() => void) | undefined;

    // This listener automatically restores the user session when the app loads
    // Firebase Auth persistence ensures the user stays logged in across app restarts
    const unSubAuth: () => void = onAuthStateChanged(
      auth,
      (user) => {
        try {
          if (!user) {
            dispatch(setCurrentUser(null));
            setIsSignedIn(false);
            return;
          }

          // User is authenticated - restore their session
          setIsSignedIn(true);

          // Add null checks for providerData
          if (!user.providerData || user.providerData.length === 0) {
            // Fallback for users without provider data
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
                  // Set basic user data even if Firestore fails
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
              },
              (error) => {
                console.warn("Firestore snapshot error (No Provider):", error.message);
                // Set basic user data if Firestore fails
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
                  // Fallback to basic user data
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
              },
              (error) => {
                console.warn("Firestore snapshot error (Google):", error.message);
                // Don't crash or show user-facing error for offline issues
                // Set basic user data
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
            );
          } else if (providerId === "facebook.com") {
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
                  console.error("Error setting user data (Facebook):", error);
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
              },
              (error) => {
                console.warn("Firestore snapshot error (Facebook):", error.message);
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
            );
          } else {
            unSubDoc = onSnapshot(
              doc(db, "users", user.uid),
              (docSnapshot) => {
                try {
                  const data = docSnapshot.data();
                  dispatch(
                    setCurrentUser({
                      displayName:
                        (data?.lastName || "") + " " + (data?.firstName || "") || user.displayName || "",
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
              },
              (error) => {
                console.warn("Firestore snapshot error (Other):", error.message);
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
            );
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          // Don't crash the app - set basic user data if available
          if (user) {
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
      },
      (error) => {
        console.error("Auth state change error:", error);
        // Don't crash the app on auth errors
        dispatch(setCurrentUser(null));
        setIsSignedIn(false);
      }
    );

    return () => {
      try {
        unSubAuth();
        if (unSubDoc) {
          unSubDoc();
        }
      } catch (error) {
        console.error("Error cleaning up auth listeners:", error);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname, location.search]);

  return (
    <>
      <Analytics />
      <Routes>
        <Route index element={<Home />} />
        <Route path="movie/:id" element={<MovieInfo />} />
        <Route path="tv/:id" element={<TVInfo />} />
        <Route path="movie/:id/watch" element={<MovieWatch />} />
        <Route path="tv/:id/watch" element={<TVWatch />} />
        <Route path="sports" element={<SportsHome />} />
        <Route
          path="sports/:leagueId/:matchId/watch"
          element={<SportsWatch />}
        />
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
        <Route
          path="bookmarked"
          element={
            <Protected isSignedIn={isSignedIn}>
              <Bookmarked />
            </Protected>
          }
        />
        <Route
          path="history"
          element={
            <Protected isSignedIn={isSignedIn}>
              <History />
            </Protected>
          }
        />
        <Route
          path="profile"
          element={
            <Protected isSignedIn={isSignedIn}>
              <Profile />
            </Protected>
          }
        />
        <Route path="*" element={<Error />} />
      </Routes>
      <MiniPlayer />
      <BuyMeACoffee variant="floating" />
    </>
  );
}

export default App;
