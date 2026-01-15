import { FC, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdSportsSoccer } from "react-icons/md";

import Sidebar from "../../components/Common/Sidebar";
import SidebarMini from "../../components/Common/SidebarMini";
import SearchBox from "../../components/Common/SearchBox";
import Title from "../../components/Common/Title";
import Footer from "../../components/Footer/Footer";
import SportsMainContent from "../../components/Sports/SportsMainContent";

import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";

const SportsHome: FC = () => {
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);

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

      <div className="flex flex-col md:flex-row">
        {!isMobile && <SidebarMini />}
        {isMobile && (
          <Sidebar
            onCloseSidebar={() => setIsSidebarActive(false)}
            isSidebarActive={isSidebarActive}
          />
        )}

        <div className="flex-grow md:pt-11 pt-0 pb-10">
          <SportsMainContent />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SportsHome;


