import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigationType, useNavigate } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { ToastContainer } from "react-toastify";
import AppDownloadPopup from "./components/Common/AppDownloadPopup";
import MiniPlayer from "./components/FilmWatch/MiniPlayer";
import { auth, db } from "./shared/firebase";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setCurrentUser, setCurrentProfile } from "./store/slice/authSlice";
import { getProfiles } from "./services/user";
import SmartAdPopup from "./components/Common/SmartAdPopup";

import Protected from "./components/Common/Protected";

// Lazy load pages
const Auth = lazy(() => import("./pages/Auth"));
const Bookmarked = lazy(() => import("./pages/Bookmarked"));
const Copyright = lazy(() => import("./pages/Copyright"));
const Explore = lazy(() => import("./pages/Explore"));
const History = lazy(() => import("./pages/History"));
const Home = lazy(() => import("./pages/Home"));
const MovieInfo = lazy(() => import("./pages/Movie/MovieInfo"));
const MovieWatch = lazy(() => import("./pages/Movie/MovieWatch"));
const SportsHome = lazy(() => import("./pages/Sports/SportsHome"));
const SportsWatch = lazy(() => import("./pages/Sports/SportsWatch"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileGate = lazy(() => import("./components/Profile/ProfileGate"));
const Search = lazy(() => import("./pages/Search"));
const TVInfo = lazy(() => import("./pages/TV/TVInfo"));
const TVWatch = lazy(() => import("./pages/TV/TVWatch"));
const YouTubeInfo = lazy(() => import("./pages/YouTube/YouTubeInfo"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const UserAgreement = lazy(() => import("./pages/UserAgreement"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Download = lazy(() => import("./pages/Download"));
const Downloads = lazy(() => import("./pages/Downloads"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const currentProfile = useAppSelector((state) => state.auth.currentProfile);
  const navigate = useNavigate();

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

  // Load saved theme color on mount
  useEffect(() => {
    const savedColor = localStorage.getItem("theme_primary_color");
    if (savedColor) {
      document.documentElement.style.setProperty("--color-primary", savedColor);
    }
  }, []);

  // Quick-restore profile from localStorage to avoid flashes
  useEffect(() => {
    const savedProfile = localStorage.getItem("current_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && !currentProfile) {
          dispatch(setCurrentProfile(parsed));
        }
      } catch (e) {
        localStorage.removeItem("current_profile");
      }
    }
  }, [dispatch, currentProfile]);

  // Sync to localStorage when isSignedIn changes
  useEffect(() => {
    try {
      localStorage.setItem("isSignedIn", JSON.stringify(isSignedIn));
    } catch (error) {
      console.warn("Error saving isSignedIn to localStorage:", error);
    }
  }, [isSignedIn]);

  const downloads = useAppSelector((state) => state.download.downloads);
  // Persist downloads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("downloads", JSON.stringify(downloads));
    } catch (error) {
      console.warn("Error saving downloads to localStorage:", error);
    }
  }, [downloads]);

  // Profile Persistence & Redirect
  useEffect(() => {
    if (isSignedIn && !currentProfile) {
      // Don't redirect if already on a page that doesn't require a profile
      if (location.pathname === "/profiles" || location.pathname === "/auth" || location.pathname === "/profile" || location.pathname === "/settings") {
        return;
      }

      const savedProfileId = localStorage.getItem("current_profile_id");
      if (savedProfileId && auth.currentUser) {
        getProfiles(auth.currentUser.uid).then(profiles => {
          const found = profiles.find(p => p.id === savedProfileId);
          if (found) {
            dispatch(setCurrentProfile(found));
          } else {
            navigate("/profiles");
          }
        }).catch(() => {
          navigate("/profiles");
        });
      } else {
        // No saved profile ID but signed in - must select a profile
        navigate("/profiles");
      }
    }
  }, [isSignedIn, currentProfile, location.pathname, dispatch, navigate]);

  useEffect(() => {
    let unSubDoc: (() => void) | undefined;

    const unSubAuth: () => void = onAuthStateChanged(
      auth,
      (user) => {
        try {
          if (!user) {
            dispatch(setCurrentUser(null));
            setIsSignedIn(false);
            // Clear profile on logout
            localStorage.removeItem("current_profile");
            localStorage.removeItem("current_profile_id");
            return;
          }

          // User is authenticated - restore their session
          setIsSignedIn(true);

          if (user.providerData && user.providerData.length > 0) {
            const providerId = user.providerData[0].providerId;

            if (providerId === "google.com") {
              unSubDoc = onSnapshot(
                doc(db, "users", user.uid),
                (docSnapshot) => {
                  try {
                    const lastName = docSnapshot.data()?.lastName;
                    const firstName = docSnapshot.data()?.firstName;
                    const fullName = (lastName || firstName)
                      ? `${lastName || ""} ${firstName || ""}`.trim()
                      : "";
                    dispatch(
                      setCurrentUser({
                        displayName:
                          fullName || user.displayName || user.email?.split("@")[0] || "User",
                        email: user.email || "",
                        emailVerified: user.emailVerified,
                        photoURL: docSnapshot.data()?.photoUrl || "",
                        uid: user.uid,
                      })
                    );
                  } catch (error) {
                    console.error("Error setting user data (Google):", error);
                  }
                },
                (error) => {
                  console.error("Firestore snapshot error (Google):", error);
                }
              );
            } else if (providerId === "facebook.com") {
              unSubDoc = onSnapshot(
                doc(db, "users", user.uid),
                (docSnapshot) => {
                  try {
                    const lastName = docSnapshot.data()?.lastName;
                    const firstName = docSnapshot.data()?.firstName;
                    const fullName = (lastName || firstName)
                      ? `${lastName || ""} ${firstName || ""}`.trim()
                      : "";
                    dispatch(
                      setCurrentUser({
                        displayName:
                          fullName || user.displayName || user.email?.split("@")[0] || "User",
                        email: user.email || "",
                        emailVerified: user.emailVerified,
                        photoURL: docSnapshot.data()?.photoUrl || "",
                        uid: user.uid,
                      })
                    );
                  } catch (error) {
                    console.error("Error setting user data (Facebook):", error);
                  }
                },
                (error) => {
                  console.error("Firestore snapshot error (Facebook):", error);
                }
              );
            } else {
              unSubDoc = onSnapshot(
                doc(db, "users", user.uid),
                (docSnapshot) => {
                  try {
                    dispatch(
                      setCurrentUser({
                        displayName:
                          (docSnapshot.data()?.lastName || docSnapshot.data()?.firstName)
                            ? `${docSnapshot.data()?.lastName || ""} ${docSnapshot.data()?.firstName || ""}`.trim()
                            : user.displayName || user.email?.split("@")[0] || "User",
                        photoURL: docSnapshot.data()?.photoUrl || "",
                        email: user.email || "",
                        emailVerified: user.emailVerified,
                        uid: user.uid,
                      })
                    );
                  } catch (error) {
                    console.error("Error setting user data (Other):", error);
                  }
                },
                (error) => {
                  console.error("Firestore snapshot error (Other):", error);
                }
              );
            }
          } else {
            // Fallback for users without provider data
            unSubDoc = onSnapshot(
              doc(db, "users", user.uid),
              (docSnapshot) => {
                try {
                  dispatch(
                    setCurrentUser({
                      displayName: user.displayName || user.email?.split("@")[0] || "User",
                      photoURL: user.photoURL || "",
                      email: user.email || "",
                      emailVerified: user.emailVerified,
                      uid: user.uid,
                    })
                  );
                } catch (error) {
                  console.error("Error setting user data (Fallback):", error);
                }
              },
              (error) => {
                console.error("Firestore snapshot error (Fallback):", error);
              }
            );
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error);
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

  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== "POP") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [location.pathname, location.search, navType]);

  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 15000); // 15 seconds threshold

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Analytics />
      <Suspense fallback={
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 animate-pulse font-medium">StreamLux Premium...</p>

          {showTimeoutMessage && (
            <div className="mt-8 p-6 bg-gray-900/50 rounded-2xl border border-white/5 max-w-sm animate-fade-in">
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Loading is taking longer than usual. This might be due to a poor connection or a temporary issue with our servers.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-black font-bold px-6 py-2 rounded-full hover:scale-105 active:scale-95 transition-all text-sm mb-4"
              >
                RETRY LOADING
              </button>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                  StreamLux Dashboard v1.2
                </p>
              </div>
            </div>
          )}
        </div>
      }>
        <Routes>
          <Route index element={<Home />} />
          <Route path="movie/:id" element={<MovieInfo />} />
          <Route path="tv/:id" element={<TVInfo />} />
          <Route path="movie/:id/watch" element={<MovieWatch />} />
          <Route path="tv/:id/watch" element={<TVWatch />} />
          <Route path="youtube/:id" element={<YouTubeInfo />} />
          <Route path="sports" element={<SportsHome />} />
          <Route
            path="sports/:leagueId/:matchId/watch"
            element={<SportsWatch />}
          />
          <Route path="explore" element={<Explore />} />
          <Route path="search" element={<Search />} />
          <Route path="auth" element={<Auth />} />
          <Route path="copyright" element={<Copyright />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="user-agreement" element={<UserAgreement />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          <Route path="download" element={<Download />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<Settings />} />
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
            path="profiles"
            element={
              <Protected isSignedIn={isSignedIn}>
                <ProfileGate />
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
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
      />
      <AppDownloadPopup />
      <MiniPlayer />
      <SmartAdPopup />
      {/* <Footer /> */}
    </>
  );
}


export default App;
