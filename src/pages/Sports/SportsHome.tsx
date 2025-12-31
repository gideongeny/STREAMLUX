import { FC, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { LazyLoadImage } from "react-lazy-load-image-component";

import Sidebar from "../../components/Common/Sidebar";
import SidebarMini from "../../components/Common/SidebarMini";
import Title from "../../components/Common/Title";
import Footer from "../../components/Footer/Footer";
import SportsMainContent from "../../components/Sports/SportsMainContent";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { useAppSelector } from "../../store/hooks";

const SportsHome: FC = () => {
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const handleTabChange = (tab: "movie" | "tv" | "sports") => {
    if (tab === "sports") return;
    localStorage.setItem("currentTab", JSON.stringify(tab));
    navigate("/");
  };

  return (
    <>
      <Title value="StreamLux | Live Sports Streaming" />

      <div className="flex md:hidden justify-between items-center px-5 my-5">
        <Link to="/" className="flex gap-2 items-center">
          <img
            src="/logo.svg"
            alt="StreamLux Logo"
            className="h-10 w-10"
          />
          <p className="text-xl text-white font-medium tracking-wider uppercase">
            Stream<span className="text-primary">Lux</span>
          </p>
        </Link>
        <button onClick={() => setIsSidebarActive((prev) => !prev)}>
          <GiHamburgerMenu size={25} />
        </button>
      </div>

      <div className="flex items-start relative">
        {!isMobile && <SidebarMini />}
        {isMobile && (
          <Sidebar
            onCloseSidebar={() => setIsSidebarActive(false)}
            isSidebarActive={isSidebarActive}
          />
        )}

        <div className="flex-grow md:pt-7 pt-0 pb-10 border-x md:px-[2vw] px-[4vw] border-gray-darken min-h-screen bg-dark relative z-0 min-w-0">
          <div className="flex justify-between md:items-end items-center mb-8">
            <div className="inline-flex gap-[40px] pb-[14px] border-b border-gray-darken relative">
              <FilmTypeButton
                buttonType="tv"
                currentTab="sports"
                onSetCurrentTab={handleTabChange}
              />
              <FilmTypeButton
                buttonType="movie"
                currentTab="sports"
                onSetCurrentTab={handleTabChange}
              />
              <FilmTypeButton
                buttonType="sports"
                currentTab="sports"
                onSetCurrentTab={handleTabChange}
              />
            </div>
            <div className="flex gap-6 items-center">
              <p className="hidden md:block">{(currentUser?.displayName?.trim() && currentUser.displayName.trim() !== "undefined undefined") ? currentUser.displayName.trim() : "Anonymous"}</p>
              <LazyLoadImage
                src={
                  currentUser
                    ? (currentUser.photoURL as string)
                    : "/defaultAvatar.jpg"
                }
                alt="User avatar"
                className="w-7 h-7 rounded-full object-cover"
                effect="opacity"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <SportsMainContent />
        </div>
      </div>

      <Footer />
    </>
  );
};

interface FilmTypeButtonProps {
  onSetCurrentTab: (currentTab: "movie" | "tv" | "sports") => void;
  currentTab: string;
  buttonType: "movie" | "tv" | "sports";
}
const FilmTypeButton: FC<FilmTypeButtonProps> = ({
  onSetCurrentTab,
  currentTab,
  buttonType,
}) => {
  const getButtonText = () => {
    if (buttonType === "movie") return "Movies";
    if (buttonType === "tv") return "TV Show";
    return "Sports";
  };

  const isActive = currentTab === buttonType;

  return (
    <button
      onClick={() => {
        onSetCurrentTab(buttonType);
      }}
      className={`relative transition duration-300 hover:text-white ${isActive ? "text-white font-medium" : "text-gray-400"
        }`}
    >
      {getButtonText()}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-white" />
      )}
    </button>
  );
};

export default SportsHome;


