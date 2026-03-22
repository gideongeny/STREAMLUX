import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdExplore, MdFolderSpecial, MdSportsSoccer, MdHomeFilled } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { useTranslation } from 'react-i18next';
import Logo from '../Common/Logo';
import { motion } from "framer-motion";

const MobileBottomNav: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const NAV_ITEMS = [
    { icon: <MdHomeFilled size={26} />, label: t("Home"), path: "/" },
    { icon: <MdExplore size={26} />, label: t("Explore"), path: "/explore" },
    {
      icon: (
        <Link
          to="/"
          className={`flex flex-col items-center justify-center -mt-8 mx-2 tw-hit-target w-16 h-16 rounded-full p-2 border-4 transition-all duration-300 transform outline-none border-dark shadow-2xl ${location.pathname === '/' || location.pathname === '/sports' || location.pathname === '/explore' || location.pathname === '/search' ? 'border-primary/50 bg-dark-lighten scale-105 shadow-primary/30' : 'border-gray-darken bg-dark shadow-[0_0_15px_rgba(0,0,0,0.5)]'}`}
        >
          <Logo className="w-10 h-10 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <div className={`absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-primary transition-opacity duration-300 ${location.pathname === '/' ? 'opacity-100' : 'opacity-0'}`}></div>
        </Link>
      ),
      label: "",
      path: "/", // This path is used for the central logo, but the Link inside the icon handles navigation
      special: true
    },
    { icon: <MdSportsSoccer size={26} />, label: t("Sports"), path: "/sports" },
    { icon: <BiSearch size={26} />, label: t("Search"), path: "/search" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[120] pb-safe">
      <div className="mx-2 mb-2 h-16 bg-dark/70 backdrop-blur-3xl border border-white/5 rounded-3xl flex items-center justify-between px-4 shadow-2xl shadow-black">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center transition-all duration-300 ${
                item.special ? "" : (isActive ? "text-primary translate-y-[-2px]" : "text-gray-400 opacity-60")
              }`}
            >
              <div className={`transition-all duration-300 ${!item.special && isActive ? "scale-110" : ""}`}>
                {item.icon}
              </div>
              {!item.special && (
                <span className={`text-[10px] font-black uppercase tracking-tighter mt-0.5 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
