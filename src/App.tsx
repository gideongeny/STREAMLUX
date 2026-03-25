import { onAuthStateChanged, getRedirectResult, FacebookAuthProvider, getAdditionalUserInfo } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { motion, AnimatePresence } from "framer-motion";

import { DownloadManagerProvider } from "./contexts/DownloadManagerContext";
import DownloadTray from "./components/Common/DownloadTray";

import Protected from "./components/Common/Protected";
import { Suspense, lazy } from "react";

const Auth = lazy(() => import("./pages/Auth"));
const Bookmarked = lazy(() => import("./pages/Bookmarked"));
const Copyright = lazy(() => import("./pages/Copyright"));
const Error = lazy(() => import("./pages/Error"));
const Explore = lazy(() => import("./pages/Explore"));
const History = lazy(() => import("./pages/History"));
const Home = lazy(() => import("./pages/Home"));
const MovieInfo = lazy(() => import("./pages/Movie/MovieInfo"));
const MovieWatch = lazy(() => import("./pages/Movie/MovieWatch"));
const SportsHome = lazy(() => import("./pages/Sports/SportsHome"));
const SportsWatch = lazy(() => import("./pages/Sports/SportsWatch"));
const LeagueStreamWatch = lazy(() => import("./pages/Sports/LeagueStreamWatch"));
const Profile = lazy(() => import("./pages/Profile"));
const Search = lazy(() => import("./pages/Search"));
const TVInfo = lazy(() => import("./pages/TV/TVInfo"));
const TVWatch = lazy(() => import("./pages/TV/TVWatch"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const UserAgreement = lazy(() => import("./pages/UserAgreement"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Download = lazy(() => import("./pages/Download"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const Settings = lazy(() => import("./pages/Settings"));
const Library = lazy(() => import("./pages/Library"));
const LocalPlayer = lazy(() => import("./pages/LocalPlayer"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage"));
const MatchesDetails = lazy(() => import("./pages/Sports/MatchesDetails"));
import { auth, db } from "./shared/firebase";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setCurrentUser } from "./store/slice/authSlice";
import { backendHealthService } from "./services/backendHealth";
import { safeStorage } from "./utils/safeStorage";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { MdDarkMode, MdLightMode, MdWifiOff } from "react-icons/md";
import { initializeAdMob, showBannerAd } from "./services/capacitorAds";
import { App as CapApp } from "@capacitor/app";
import { themeService } from "./services/theme";
import { pushNotificationService } from "./services/pushNotifications";
import { trendingNotificationService } from "./services/trendingNotifications";
import { webNotificationService } from "./services/webNotificationService";
import { persistentNotificationService } from "./services/persistentNotificationService";
import { setLanguage } from "./shared/axios";
import { SplashScreen } from '@capacitor/splash-screen';

import AppUpdater from "./components/Common/AppUpdater";

import MiniPlayer from "./components/FilmWatch/MiniPlayer";
import SpotlightSearch from "./components/Common/SpotlightSearch";
import MasterReveal from "./components/Common/MasterReveal";
import AtmosphericBackground from "./components/Common/AtmosphericBackground";
import MobileBottomNav from "./components/Navigation/MobileBottomNav";
import GeniusAI from "./components/Common/GeniusAI";
import OnboardingOverlay from "./components/Common/OnboardingOverlay";

const GlobalLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
  </div>
);

// Final deployment heartbeat for unified Vercel backend propagation
// ... [Will manually assemble in target file to avoid full matching issues]
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

  const [surfaceMode, setSurfaceMode] = useState<"midnight" | "night">(() => {
    const saved = (safeStorage.get("surface_mode") as "midnight" | "night") || "midnight";
    return saved === "night" ? "night" : "midnight";
  });

    const isPremium = useAppSelector((state) => state.auth.user?.isPremium);

    // Initialize Services (Theme, AdMob, Push Notifications)
    useEffect(() => {
    themeService.initialize();
    
    // Immediately hide Splash screen so the user sees the App (or Suspense Loader) without artificial delay
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide();
    }

    // Initialize AdMob and show first banner if native - DEFERRED to avoid blocking paint
    const initAds = async () => {
      // ONLY initialize ads if NOT premium
      if (!isPremium) {
        await initializeAdMob();
        if (Capacitor.isNativePlatform()) {
          await showBannerAd();
          await pushNotificationService.initialize();
        } else {
          await webNotificationService.initialize();
        }
      }
    };
    
    // Defer heavy third-party initialization by 1.5 seconds so main UI thread is entirely free for React render
    const adTimer = setTimeout(() => {
      initAds().catch(console.warn);
    }, 1500);

    // PopAds / Third-party Ad Trigger Helper
    const handleGlobalClick = () => {
      if (!isPremium && (window as any).popns) {
          try { (window as any).popns(); } catch(e) {}
      }
    };
    window.addEventListener('click', handleGlobalClick);

    // Check for trending content notification non-blockingly
    const trendingTimer = setTimeout(() => {
      trendingNotificationService.checkAndNotifyTrending();
      persistentNotificationService.showCommandCenter();
    }, 3000);

    const trendingInterval = setInterval(() => {
      trendingNotificationService.checkAndNotifyTrending();
    }, 10 * 60 * 1000); // Check every 10 minutes

    return () => {
      clearTimeout(adTimer);
      clearTimeout(trendingTimer);
      clearInterval(trendingInterval);
      window.removeEventListener('click', handleGlobalClick);
    };
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
              isPremium: false,
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

    // Update global axios language for TMDB/API queries
    setLanguage(currentLang);

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
              },
              (error) => {
                console.warn("Firestore onSnapshot error (No Provider):", error);
                // Fallback to basic user info from auth
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
                      isPremium: data?.isPremium || false,
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
              },
              (error) => {
                console.warn("Firestore onSnapshot error (Google):", error);
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
                      displayName: (data?.lastName || "") + " " + (data?.firstName || "") || user.displayName || "",
                      photoURL: data?.photoUrl || user.photoURL || "",
                      email: user.email || "",
                      emailVerified: user.emailVerified,
                      uid: user.uid,
                      isPremium: data?.isPremium || false,
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

  const toggleSurface = () => {
    const next = surfaceMode === "night" ? "midnight" : "night";
    setSurfaceMode(next);
    themeService.applySurfaceMode(next);
  };

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
          className={`transition-[--color-primary,filter] duration-[800ms] ease-in-out overflow-x-hidden min-h-[100dvh] pb-safe ${isCinemaMode ? "filter brightness-[0.3] saturate-[0.6] grayscale-[0.2]" : ""
            }`}
        >
          <MasterReveal />
          <AtmosphericBackground />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -5 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Cinematic custom cubic-bezier
              className="w-full flex-grow"
            >
              <Suspense fallback={<GlobalLoader />}>
                <Routes location={location} key={location.pathname}>
                  <Route index element={<Home />} />
                  <Route path="movie/:id" element={<MovieInfo />} />
                  <Route path="tv/:id" element={<TVInfo />} />
                  <Route path="movie/:id/watch" element={<MovieWatch />} />
                  <Route path="tv/:id/watch" element={<TVWatch />} />
                  <Route path="sports" element={<SportsHome />} />
                  <Route path="sports/:leagueId/:matchId/watch" element={<SportsWatch />} />
                  <Route path="sports/league/:leagueId/watch" element={<LeagueStreamWatch />} />
                  <Route path="matches/details/:fixtureId" element={<MatchesDetails />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="search" element={<Search />} />
                  <Route path="auth" element={<Auth />} />
                  <Route path="copyright" element={<Copyright />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="user-agreement" element={<UserAgreement />} />
                  <Route path="disclaimer" element={<Disclaimer />} />
                  <Route path="download" element={<Download />} />
                  <Route path="library" element={<Library />} />
                  <Route path="watch" element={<LocalPlayer />} />
                  <Route path="watchlist" element={<WatchlistPage />} />
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
              </Suspense>
            </motion.div>
          </AnimatePresence>
          <AppUpdater />
          <MiniPlayer />
          <SpotlightSearch />
          <DownloadTray />
          <MobileBottomNav />
          <GeniusAI />
          <OnboardingOverlay />

          {/* Global Light/Dark (Surface) Toggle */}
          <button
            onClick={toggleSurface}
            className="fixed top-3 right-3 z-[9999] w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 text-white flex items-center justify-center hover:bg-primary/30 hover:border-primary/30 transition"
            title={surfaceMode === "night" ? "Switch to Midnight" : "Switch to Night"}
          >
            {surfaceMode === "night" ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>
        </div>
      </DownloadManagerProvider>
    </div>
  );
}

export default App;
