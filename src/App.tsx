import { onAuthStateChanged, getRedirectResult, GoogleAuthProvider, FacebookAuthProvider, getAdditionalUserInfo } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { motion, AnimatePresence } from "framer-motion";

import { DownloadManagerProvider } from "./contexts/DownloadManagerContext";
import DownloadTray from "./components/Common/DownloadTray";
import { MdMovieFilter } from "react-icons/md";

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
import SpotlightSearch from "./components/Common/SpotlightSearch";
import MasterReveal from "./components/Common/MasterReveal";
import VisionAssistant from "./components/Common/VisionAssistant";
import AtmosphericBackground from "./components/Common/AtmosphericBackground";
import { auth, db } from "./shared/firebase";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setCurrentUser } from "./store/slice/authSlice";
import { setCinemaMode } from "./store/slice/uiSlice";
import { backendHealthService } from "./services/backendHealth";
import BuyMeACoffee from "./components/Common/BuyMeACoffee";
import { safeStorage } from "./utils/safeStorage";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { MdWifiOff } from "react-icons/md";
import { initializeAdMob } from "./services/capacitorAds";
import { App as CapApp } from "@capacitor/app";
import { themeService } from "./services/theme";
import { useScrollPersistence } from "./hooks/useScrollPersistence";
import { pushNotificationService } from "./services/pushNotifications";
import { trendingNotificationService } from "./services/trendingNotifications";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isCinemaMode } = useAppSelector((state) => state.ui);

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

  // Initialize Services (Theme, AdMob, Push Notifications)
  useEffect(() => {
    themeService.initialize();
    initializeAdMob().catch(console.warn);

    if (Capacitor.isNativePlatform()) {
      pushNotificationService.initialize().catch(console.warn);
    }

    // Check for trending content notification on startup and periodically
    trendingNotificationService.checkAndNotifyTrending();
    const trendingInterval = setInterval(() => {
      trendingNotificationService.checkAndNotifyTrending();
    }, 10 * 60 * 1000); // Check every 10 minutes

    return () => clearInterval(trendingInterval);
  }, []);

  // Handle Firebase Redirect Result (Google/Facebook Login fallback for native)
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          const user = result.user;
          const additionalInfo = getAdditionalUserInfo(result);
          const isNewUser = additionalInfo?.isNewUser;

          // If it's a new user OR the document is missing, create it
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (isNewUser || !userDoc.exists()) {
            let photoUrl = user.photoURL || "";
            let token;

            // Handle special case for Facebook photo URL/token
            const providerId = user.providerData[0]?.providerId;
            if (providerId === "facebook.com") {
              const credential = FacebookAuthProvider.credentialFromResult(result);
              token = credential?.accessToken;
              if (token && photoUrl) {
                photoUrl = photoUrl + "?access_token=" + token;
              }
            }

            await setDoc(userDocRef, {
              firstName: user.displayName?.split(" ")[0] || "",
              lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
              photoUrl: photoUrl,
              bookmarks: [],
              recentlyWatch: [],
              ...(token && { token }),
              createdAt: new Date().toISOString()
            });
          }

          // Force navigate to dashboard on success
          setIsSignedIn(true);
          navigate("/", { replace: true });
        }
      } catch (error: any) {
        // Silently handle but navigate to error or auth if critical
        if (error.code !== 'auth/no-current-user') {
          console.warn("Redirect handling error:", error.message);
        }
      }
    };

    handleRedirect();

    // Listen for deep links (Custom URL Scheme)
    const setupAppListeners = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await CapApp.addListener('appUrlOpen', (data: any) => {
            console.log('[Auth] App opened via URL:', data.url);
            // On native, we must handle the return from Google/Facebook redirect
            // The Firebase SDK getRedirectResult will pick up the state from the URL/LocalStorage
            handleRedirect();
          });

          // Check for initial URL (if app was closed and opened via link)
          const initialUrl = await CapApp.getLaunchUrl();
          if (initialUrl) {
            console.log('[Auth] App launched with URL:', initialUrl.url);
            handleRedirect();
          }
        } catch (e) {
          console.warn('[Auth] Deep link listener setup failed:', e);
        }
      }
    };

    setupAppListeners();

    // Safety: Run handleRedirect once after a short delay on mount 
    // to catch any missed redirect results
    const t = setTimeout(handleRedirect, 1500);
    return () => clearTimeout(t);
  }, [navigate]);


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

  // Sync Language globally (lang & dir)
  const { i18n } = useTranslation();
  useEffect(() => {
    const currentLang = i18n.language;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

    // Add/remove rtl class for tailwind/css logic
    if (currentLang === "ar") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [i18n.language]);

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

  const isOnline = useOnlineStatus();

  return (
    <div className="relative">
      {/* Offline Status Bar */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-600 text-white text-[10px] font-bold py-1 px-4 flex items-center justify-center gap-2 sticky top-0 z-[9999] overflow-hidden"
          >
            <MdWifiOff size={14} className="animate-pulse" />
            <span className="uppercase tracking-widest">Offline Mode — Using Cached Data</span>
          </motion.div>
        )}
      </AnimatePresence>

      <DownloadManagerProvider>
        <div
          className={`transition-[--color-primary,filter] duration-[800ms] ease-in-out overflow-x-hidden ${isCinemaMode ? "filter brightness-[0.3] saturate-[0.6] grayscale-[0.2]" : ""
            }`}
        >
          <MasterReveal />
          <AtmosphericBackground />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Routes location={location} key={location.pathname}>
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
            </motion.div>
          </AnimatePresence>
          <MiniPlayer />
          <SpotlightSearch />
          <VisionAssistant />
          <DownloadTray />
        </div>
      </DownloadManagerProvider>
    </div>
  );
}

export default App;
