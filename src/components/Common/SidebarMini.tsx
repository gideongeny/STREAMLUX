import { FunctionComponent } from "react";
import { AiOutlineHistory, AiOutlineHome, AiOutlineCalendar } from "react-icons/ai";
import { BiSearch, BiUserCircle } from "react-icons/bi";
import { BsBookmarkHeart } from "react-icons/bs";
import { MdOutlineExplore, MdSportsSoccer } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useAppSelector } from "../../store/hooks";

const SidebarMini: FunctionComponent = () => {
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

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

      <div className="shrink-0 max-w-[80px] w-full py-8 flex flex-col items-center justify-between h-screen sticky top-0 bg-dark-lighten/50 backdrop-blur-md border-r border-white/5 z-40">
        <Link to="/">
          <img
            alt="StreamLux Logo"
            src="/logo.png"
            className="w-10 h-10"
          />
        </Link>
        <div className="flex flex-col gap-7">
          <Link
            to="/"
            className={`hover:text-primary transition duration-300 ${location.pathname === "/" && "text-primary"
              }`}
          >
            <AiOutlineHome size={25} />
          </Link>
          <Link
            to="/sports"
            className={`hover:text-primary transition duration-300 ${location.pathname === "/sports" && "text-primary"
              }`}
            title="Sports"
          >
            <MdSportsSoccer size={25} />
          </Link>
          <Link
            to="/explore"
            className={`hover:text-primary transition duration-300 ${location.pathname === "/explore" && "text-primary"
              }`}
          >
            <MdOutlineExplore size={25} />
          </Link>
          <Link
            to="/search"
            className={`hover:text-primary transition duration-300 ${location.pathname === "/search" && "text-primary"
              }`}
          >
            <BiSearch size={25} />
          </Link>
          <Link
            to="/calendar"
            className={`hover:text-primary transition duration-300 ${location.pathname === "/calendar" && "text-primary"
              }`}
            title="TV Calendar"
          >
            <AiOutlineCalendar size={25} />
          </Link>
          <button
            onClick={() => personalPageHandler("/bookmarked")}
            className={`hover:text-primary transition duration-300 ${location.pathname === "/bookmarked" && "text-primary"
              }`}
          >
            <BsBookmarkHeart size={25} />
          </button>
          <button
            onClick={() => personalPageHandler("/history")}
            className={`hover:text-primary transition duration-300 ${location.pathname === "/history" && "text-primary"
              }`}
          >
            <AiOutlineHistory size={25} />
          </button>
          <button
            onClick={() => personalPageHandler("/profile")}
            className={`hover:text-primary transition duration-300 ${location.pathname === "/profile" && "text-primary"
              }`}
          >
            <BiUserCircle size={25} />
          </button>
          <Link
            to="/settings"
            className={`hover:text-primary transition duration-300 ${location.pathname === "/settings" && "text-primary"
              }`}
          >
            <IoSettingsOutline size={25} />
          </Link>
        </div>
        <button onClick={() => personalPageHandler("/profile")}>
          <LazyLoadImage
            src={
              currentUser
                ? (currentUser.photoURL as string)
                : "/defaultAvatar.jpg"
            }
            alt="Avatar"
            effect="opacity"
            className="w-10 h-10 rounded-full"
          />
        </button>
      </div>
    </>
  );
};

export default SidebarMini;
