import { signOut } from "firebase/auth";
import { FC, useState } from "react";
import { AiOutlineHistory, AiOutlineHome } from "react-icons/ai";
import { BiSearch, BiUserCircle } from "react-icons/bi";
import { BsBookmarkHeart } from "react-icons/bs";
import { HiOutlineLogin, HiOutlineLogout } from "react-icons/hi";
import { MdOutlineExplore, MdSportsSoccer } from "react-icons/md";
import { FaDownload } from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { auth } from "../../shared/firebase";
import { useAppSelector } from "../../store/hooks";
import BuyMeACoffee from "./BuyMeACoffee";

interface SidebarProps {
  isSidebarActive: boolean;
  onCloseSidebar: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isSidebarActive, onCloseSidebar }) => {
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
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
        className={`shrink-0 md:max-w-[260px] w-[70vw] pl-8 top-0 pt-10  
        md:sticky md:translate-x-0 md:bg-transparent md:shadow-none md:self-start md:max-h-screen md:overflow-y-auto
      -translate-x-full fixed h-screen shadow-md transition duration-300 bg-dark-lighten z-50 ${isSidebarActive && "translate-x-0"
          }`}
      >
        {!isMobile && (
          <Link to="/" className="flex items-center gap-3">
            <img
              alt="StreamLux Logo"
              src="/logo.svg"
              className="w-10 h-10"
            />
            <h1 className="text-xl text-white tracking-widest font-semibold uppercase">
              <span>Stream</span>
              <span className="text-primary">Lux</span>
            </h1>
          </Link>
        )}

        <div
          className={`text-white text-lg font-medium ${isSidebarActive ? "-mt-6" : "mt-12"
            }`}
        >
          MENU
        </div>
        <div className="mt-8 ml-4 flex flex-col gap-6">
          <Link
            to="/"
            className={`flex gap-6 items-center  ${location.pathname === "/" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <AiOutlineHome size={25} />
            <p>Home</p>
          </Link>

          <a
            href="https://sportslive.run/live?utm_source=MB_Website&sportType=football"
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-6 items-center hover:text-white transition duration-300"
          >
            <MdSportsSoccer size={25} />
            <p>Sports</p>
          </a>

          <Link
            to="/explore"
            className={`flex gap-6 items-center  ${location.pathname === "/explore" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <MdOutlineExplore size={25} />
            <p>Explore</p>
          </Link>

          <Link
            to="/search"
            className={`flex gap-6 items-center  ${location.pathname === "/search" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <BiSearch size={25} />
            <p>Search</p>
          </Link>
        </div>

        <div className="text-white text-lg font-medium mt-12">PERSONAL</div>
        <div className="mt-8 ml-4 flex flex-col gap-6">
          {!currentUser && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">Sign in to access:</p>
              <Link
                to="/auth"
                className="text-primary hover:underline text-sm font-medium"
              >
                Sign In / Sign Up →
              </Link>
            </div>
          )}
          <button
            onClick={() => personalPageHandler("/bookmarked")}
            className={`flex gap-6 items-center  ${location.pathname === "/bookmarked" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300 ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!currentUser}
            title={!currentUser ? "Sign in to access bookmarks" : ""}
          >
            <BsBookmarkHeart size={25} />
            <p>Bookmarked</p>
          </button>

          <button
            onClick={() => personalPageHandler("/history")}
            className={`flex gap-6 items-center  ${location.pathname === "/history" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300 ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!currentUser}
            title={!currentUser ? "Sign in to access history" : ""}
          >
            <AiOutlineHistory size={25} />
            <p>History</p>
          </button>
        </div>

        <div className="text-white text-lg font-medium mt-12">GENERAL</div>
        <div className="mt-8 ml-4 flex flex-col gap-6">
          <a
            href="/streamlux.apk"
            className={`flex gap-6 items-center hover:text-white transition duration-300`}
            download
          >
            <FaDownload size={25} />
            <p>Download App</p>
          </a>

          <Link
            to="/settings"
            className={`flex gap-6 items-center  ${location.pathname === "/settings" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>Settings</p>
          </Link>

          <button
            onClick={() => personalPageHandler("/profile")}
            className={`flex gap-6 items-center  ${location.pathname === "/profile" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300 ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!currentUser}
            title={!currentUser ? "Sign in to access profile" : ""}
          >
            <BiUserCircle size={25} />
            <p>Profile</p>
          </button>

          {!currentUser && (
            <Link
              to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
              className="flex gap-5 items-center px-4 py-2 bg-primary/20 rounded-lg border border-primary/50 hover:bg-primary/30 transition"
            >
              <HiOutlineLogin size={30} />
              <p className="font-medium">Sign In / Sign Up</p>
            </Link>
          )}

          {currentUser && (
            <button
              onClick={signOutHandler}
              className="flex gap-5 items-center"
            >
              <HiOutlineLogout size={30} />
              <p>Logout</p>
            </button>
          )}

          {/* Buy Me a Coffee */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <BuyMeACoffee variant="button" className="w-full justify-center" />
          </div>
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
