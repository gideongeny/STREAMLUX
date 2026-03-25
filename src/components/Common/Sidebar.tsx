import { signOut } from "firebase/auth";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineHistory, AiOutlineHome } from "react-icons/ai";
import { BiSearch, BiUserCircle } from "react-icons/bi";
import { BsBookmarkHeart } from "react-icons/bs";
import { HiOutlineLogin, HiOutlineLogout } from "react-icons/hi";
import { MdOutlineExplore, MdSportsSoccer, MdFolderSpecial } from "react-icons/md";
import { FaDownload } from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { auth } from "../../shared/firebase";
import { useAppSelector } from "../../store/hooks";
import { triggerManualUpdateCheck, isNative } from "../../services/updateService";
import BuyMeACoffee from "./BuyMeACoffee";
import LanguageSelector from "./LanguageSelector";
import Logo from "./Logo";

const GENRES = [
  // 🎬 MOVIE HIGHLIGHTS
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
  // 📺 TV FAVORITES
  { id: 10759, name: "Action & Adventure" },
  { id: 10762, name: "Kids" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 10770, name: "TV Movie" },
  // 🌟 SPECIALTY & NICHE
  { id: 3166, name: "Anime" },
  { id: 10769, name: "Foreign" },
  { id: 10771, name: "Short" },
  { id: 41, name: "Biographical" },
  { id: 43, name: "Superhero" },
  { id: 45, name: "Martial Arts" },
  { id: 47, name: "Medical" },
  { id: 49, name: "Legal" },
  { id: 51, name: "Sports Story" },
  { id: 533, name: "Psychological" },
  { id: 55, name: "Historical" },
  { id: 57, name: "Independent" },
  { id: 59, name: "Black Cinema" },
  { id: 61, name: "African" },
  { id: 63, name: "Asian" },
  { id: 65, name: "Latin" },
  { id: 67, name: "European" },
  { id: 69, name: "Erotic" },
  { id: 71, name: "True Crime" },
  { id: 73, name: "Conspiracy" },
  { id: 75, name: "Dystopian" },
  { id: 77, name: "Steampunk" },
  { id: 79, name: "Cyberpunk" },
];

interface SidebarProps {
  isSidebarActive: boolean;
  onCloseSidebar: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isSidebarActive, onCloseSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useCurrentViewportView();

  const signOutHandler = () => {
    if (!auth) {
      toast.error("Authentication service is not available.");
      return;
    }

    setIsLoading(true);
    signOut(auth)
      .then(() => {
        toast.success("Sign out successfully", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((error) => alert(error.message))
      .finally(() => setIsLoading(false));
  };

  const personalPageHandler = (destinationUrl: string) => {
    if (!currentUser) {
      toast.info("You need to login to use this feature", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      return;
    }

    navigate(destinationUrl);
  };

  return (
    <>
      <ToastContainer />

      {isLoading && (
        <div className="z-10 tw-flex-center fixed top-0 left-0 w-full h-full">
          <div className="w-28 h-28 border-[10px] rounded-full border-primary border-t-transparent animate-spin "></div>
        </div>
      )}

      <div
        className={`fixed top-0 left-0 h-screen w-[260px] bg-dark/95 backdrop-blur-xl border-r border-white/5 z-[110] flex flex-col transition-transform duration-500 overflow-y-auto scrollbar-hide ${isSidebarActive ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        {!isMobile && (
          <Link to="/" className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <h1 className="text-xl text-white tracking-widest font-semibold uppercase">
              <span>Stream</span>
              <span className="text-primary">Lux</span>
            </h1>
          </Link>
        )}

        <div className="mt-8 px-6">
          <LanguageSelector />
        </div>

        <div
          className={`text-white text-lg font-bold uppercase tracking-widest ${isSidebarActive ? "mt-4" : "mt-12"
            } px-4 flex items-center gap-3 border-l-4 border-primary`}
        >
          {t('MENU')}
        </div>
        <div className="mt-8 ml-4 flex flex-col gap-6">
          <Link
            to="/"
            className={`flex gap-6 items-center tw-hit-target ${location.pathname === "/" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <AiOutlineHome size={25} />
            <p className="font-bold tracking-tight">{t('Home')}</p>
          </Link>

          <Link
            to="/sports"
            className={`flex gap-6 items-center tw-hit-target ${location.pathname === "/sports" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <MdSportsSoccer size={25} />
            <p className="font-bold tracking-tight">{t('Sports')}</p>
          </Link>

          <Link
            to="/explore"
            className={`flex gap-6 items-center  ${location.pathname === "/explore" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <MdOutlineExplore size={25} />
            <p className="font-bold tracking-tight">{t('Explore')}</p>
          </Link>

          <Link
            to="/search"
            className={`flex gap-6 items-center  ${location.pathname === "/search" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <BiSearch size={25} />
            <p className="font-bold tracking-tight">{t('Search')}</p>
          </Link>
        </div>

        {/* 🎭 GENRES SECTION */}
        <div className="text-white text-lg font-bold uppercase tracking-widest mt-12 px-8 flex items-center gap-3 border-l-4 border-primary">{t('GENRES')}</div>
        <div className="mt-8 px-10 flex flex-col gap-5 pb-24 scroll-smooth">
          {GENRES.map((genre) => (
            <Link
              key={genre.id}
              to={`/explore?genre=${genre.id}`}
              className="group flex items-center justify-between text-gray-300/80 hover:text-white transition-all duration-300"
            >
              <span className="text-sm font-bold tracking-tight group-hover:translate-x-2 transition-transform">{t(genre.name)}</span>
              <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-primary font-black">EXPLORE</span>
            </Link>
          ))}
        </div>




        <div className="text-white text-lg font-bold uppercase tracking-widest mt-12 px-4 flex items-center gap-3 border-l-4 border-primary">{t('PERSONAL')}</div>
        <div className="mt-8 ml-4 flex flex-col gap-6">
          {!currentUser && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">{t('Sign in to access')}:</p>
              <Link
                to="/auth"
                className="text-primary hover:underline text-sm font-medium"
              >
                {t('Sign In')} / {t('Sign Up')} →
              </Link>
            </div>
          )}
          <button
            onClick={() => personalPageHandler("/bookmarked")}
            className={`flex gap-6 items-center  ${location.pathname === "/bookmarked" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300 ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!currentUser}
            title={!currentUser ? t("Sign in to access bookmarks") : ""}
          >
            <BsBookmarkHeart size={25} />
            <p className="font-bold tracking-tight">{t('Bookmarked')}</p>
          </button>

          <Link
            to="/watchlist"
            className={`flex gap-6 items-center  ${location.pathname === "/watchlist" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <MdFolderSpecial size={25} />
            <p className="font-bold tracking-tight">{t('Watchlist')}</p>
          </Link>

          <button
            onClick={() => personalPageHandler("/library")}
            className={`flex md:hidden gap-6 items-center  ${location.pathname === "/library" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300 ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!currentUser}
            title={!currentUser ? t("Sign in to access downloads") : ""}
          >
            <MdFolderSpecial size={25} />
            <p className="font-bold tracking-tight">{t('Downloads')}</p>
          </button>

          <button
            onClick={() => personalPageHandler("/history")}
            className={`flex gap-6 items-center  ${location.pathname === "/history" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300 ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!currentUser}
            title={!currentUser ? t("Sign in to access history") : ""}
          >
            <AiOutlineHistory size={25} />
            <p className="font-bold tracking-tight">{t('History')}</p>
          </button>
        </div>

        <div className="text-white text-lg font-bold uppercase tracking-widest mt-12 px-4 flex items-center gap-3 border-l-4 border-primary">{t('GENERAL')}</div>
        <div className="mt-8 ml-4 flex flex-col gap-6">
          {isNative() ? (
            <button
              onClick={triggerManualUpdateCheck}
              className={`flex gap-6 items-center hover:text-white transition duration-300`}
            >
              <FaDownload size={25} />
              <p className="font-bold tracking-tight">{t('Check for Updates')}</p>
            </button>
          ) : (
            <a
              href="https://streamlux-67a84.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex gap-6 items-center hover:text-white transition duration-300`}
            >
              <FaDownload size={25} />
              <p className="font-bold tracking-tight">{t('Visit Website')}</p>
            </a>
          )}

          <a
            href="https://www.google.com/search?q=StreamLux+Official+Streaming"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex gap-6 items-center hover:text-white transition duration-300`}
          >
            <BiSearch size={25} />
            <p className="font-bold tracking-tight">{t('Find us on Google')}</p>
          </a>

          <Link
            to="/settings"
            className={`flex md:hidden gap-6 items-center tw-hit-target ${location.pathname === "/settings" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="font-bold tracking-tight">{t('Settings')}</p>
          </Link>



          <button
            onClick={() => personalPageHandler("/profile")}
            className={`flex md:hidden gap-6 items-center  ${location.pathname === "/profile" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300 ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!currentUser}
            title={!currentUser ? t("Sign in to access profile") : ""}
          >
            <BiUserCircle size={25} />
            <p className="font-bold tracking-tight">{t('Profile')}</p>
          </button>

          {!currentUser && (
            <Link
              to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
              className="flex gap-5 items-center px-4 py-2 bg-primary/20 rounded-lg border border-primary/50 hover:bg-primary/30 transition"
            >
              <HiOutlineLogin size={30} />
              <p className="font-medium">{t('Sign In')} / {t('Sign Up')}</p>
            </Link>
          )}

          {currentUser && (
            <button
              onClick={signOutHandler}
              className="flex gap-5 items-center"
            >
              <HiOutlineLogout size={30} />
              <p className="font-bold tracking-tight">{t('Logout')}</p>
            </button>
          )}

          {/* Removed Buy Me a Coffee */}
          <div className="pb-32" /> {/* Spacer to clear mobile bottom nav */}
        </div>
      </div>

      <div
        onClick={onCloseSidebar}
        className={`bg-black/60 z-[5] fixed top-0 left-0 w-full h-full md:opacity-0 transition duration-300 ${isSidebarActive ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      ></div>
    </>
  );
};

export default Sidebar;
