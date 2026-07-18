import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdExplore, MdFolderSpecial, MdSportsSoccer, MdHomeFilled, MdMovie } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { FiTv, FiMusic } from "react-icons/fi";
import { useTranslation } from 'react-i18next';

import Logo from '../Common/Logo';
import { motion } from "framer-motion";

const MobileBottomNav: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const NAV_ITEMS = [
    { icon: <MdHomeFilled size={24} />, label: t("Home"), path: "/", matchTabs: ["movie", "tv", null] },
    { icon: <MdSportsSoccer size={24} />, label: t("Sports"), path: "/?tab=sports", matchTabs: ["sports"] },
    { icon: <FiTv size={24} />, label: t("Live TV"), path: "/?tab=live-tv", matchTabs: ["live-tv"] },
    { icon: <FiMusic size={24} />, label: t("Music"), path: "/?tab=music", matchTabs: ["music"] },
  ];

  const currentTab = new URLSearchParams(location.search).get("tab");

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[120] pb-[env(safe-area-inset-bottom,16px)] px-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-[400px] mb-3 h-16 bg-black/50 backdrop-blur-[40px] border border-white/10 rounded-full flex items-center justify-around px-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === "/" 
            ? item.matchTabs.includes(currentTab)
            : location.pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-full group"
            >
              {/* Active Indicator Glow */}
              <div className={`absolute -top-1 w-8 h-1 rounded-b-full bg-primary transition-all duration-300 ${isActive ? "opacity-100 shadow-[0_0_12px_var(--color-primary)]" : "opacity-0 scale-x-0"}`} />
              
              <div className={`transition-all duration-400 ease-spring ${isActive ? "text-primary -translate-y-1 scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" : "text-gray-400 opacity-70 group-hover:opacity-100 group-hover:scale-105"}`}>
                {item.icon}
              </div>
              
              <span className={`absolute bottom-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? "opacity-100 text-white translate-y-0" : "opacity-0 text-gray-500 translate-y-2"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
