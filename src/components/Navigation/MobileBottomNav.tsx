import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdExplore, MdFolderSpecial, MdSportsSoccer, MdHomeFilled } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { FiTv, FiMusic } from "react-icons/fi";
import { useTranslation } from 'react-i18next';

import Logo from '../Common/Logo';
import { motion } from "framer-motion";

const MobileBottomNav: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const NAV_ITEMS = [
    { icon: <MdHomeFilled size={24} />, label: t("Home"), path: "/" },
    { icon: <MdSportsSoccer size={24} />, label: t("Sports"), path: "/sports" },
    {
      icon: (
        <Logo className="w-10 h-10 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
      ),
      label: "",
      path: "/",
      special: true
    },
    { icon: <FiTv size={24} />, label: t("Live TV"), path: "/tv" },
    { icon: <FiMusic size={24} />, label: t("Music"), path: "/music" },
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
