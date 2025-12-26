import { signOut } from "firebase/auth";
import { FC, useState } from "react";
import { AiOutlineHistory, AiOutlineHome } from "react-icons/ai";
import { BiSearch, BiUserCircle } from "react-icons/bi";
import { BsBookmarkHeart } from "react-icons/bs";
import { HiOutlineLogin, HiOutlineLogout } from "react-icons/hi";
import { MdOutlineExplore, MdSportsSoccer } from "react-icons/md";
import { FaDownload } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { auth } from "../../shared/firebase";
import { useAppSelector } from "../../store/hooks";

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
        className={`shrink-0 md:max-w-[260px] w-[70vw] pl-4 md:pl-8 top-0 pt-6 md:pt-10  
        md:sticky md:translate-x-0 md:bg-transparent md:shadow-none md:self-start md:max-h-screen md:overflow-y-auto
      -translate-x-full fixed h-screen shadow-md transition duration-300 bg-dark-lighten z-50 ${isSidebarActive && "translate-x-0"
          }`}
      >
        {!isMobile && (
          <Link to="/" className="flex items-center gap-3">
            <img
              alt="StreamLux Logo"
              src="/logo.png"
              className="w-10 h-10"
            />
            <h1 className="text-xl text-white tracking-widest font-semibold uppercase">
              <span>Stream</span>
              <span className="text-primary">Lux</span>
            </h1>
          </Link>
        )}

        <div
          className={`text-white text-lg font-medium ${isSidebarActive ? "-mt-2 md:-mt-6" : "mt-8 md:mt-12"
            }`}
        >
          MENU
        </div>
        <div className="mt-4 md:mt-8 ml-2 md:ml-4 flex flex-col gap-4 md:gap-6">
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

          <a
            href="https://www.buymeacoffee.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-6 items-center text-yellow-500 hover:text-yellow-400 transition duration-300"
          >
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="25" width="25" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.95-7-4.5-7-8.9h2c0 4.42 3.58 8 8 8v.93zM13 18.00c-.41.51-.77 1.09-1.07 1.73-.29.64-.61 1.25-.93 1.83V5.5c.32.58.64 1.19.93 1.83.3.64.66 1.22 1.07 1.73V18.00z"></path>
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"></path>
              <path d="M20 3H4v10c0 5.52 4.48 10 10 10s10-4.48 10-10V5c0-1.1-.9-2-2-2zM4 5h16v8c0 4.41-3.59 8-8 8s-8-3.59-8-8V5z"></path>
            </svg>
            {/* Note: In a real app we'd use a real icon import, but SVG is safer here to avoid missing lib errors */}
            <p>Support Us</p>
          </a>
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
          <Link
            to="/download"
            className={`flex gap-6 items-center  ${location.pathname === "/download" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <FaDownload size={25} />
            <p>Download App</p>
          </Link>

          <Link
            to="/settings"
            className={`flex gap-6 items-center  ${location.pathname === "/settings" &&
              "!text-primary border-r-4 border-primary font-medium"
              } hover:text-white transition duration-300`}
          >
            <IoSettingsOutline size={25} />
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
