import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import Sidebar from "../../components/Common/Sidebar";
import SidebarMini from "../../components/Common/SidebarMini";
import Title from "../../components/Common/Title";
import Footer from "../../components/Footer/Footer";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import SportsHub from "../../features/sports/SportsHub";

const SportsHome: FC = () => {
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  return (
    <>
      <Title value="StreamLux | Premium Sports Hub" />

      {/* Mobile Header Only */}
      <div className="flex md:hidden justify-between items-center px-6 py-4 bg-[#0A0A0A]/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100]">
        <Link to="/" className="flex gap-2 items-center">
          <img src="/logo.svg" alt="StreamLux" className="h-8 w-8" />
          <p className="text-lg text-white font-black tracking-tighter uppercase italic">
            STREAM<span className="text-primary tracking-normal not-italic font-medium">LUX</span>
          </p>
        </Link>
        <button onClick={() => setIsSidebarActive(true)} className="text-white">
          <GiHamburgerMenu size={22} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row min-h-screen bg-black">
        {!isMobile && <SidebarMini />}
        {isMobile && (
          <Sidebar
            onCloseSidebar={() => setIsSidebarActive(false)}
            isSidebarActive={isSidebarActive}
          />
        )}

        <div className="flex-grow">
          {/* Main Sports Hub Component */}
          <SportsHub />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SportsHome;


