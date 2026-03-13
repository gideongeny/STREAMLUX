import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineHome, AiOutlineHistory } from "react-icons/ai";
import { MdOutlineExplore, MdSportsSoccer, MdFolderSpecial } from "react-icons/md";
import { BiUserCircle } from "react-icons/bi";
import { useTranslation } from "react-i18next";

const MobileBottomNav: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const NAV_ITEMS = [
    { icon: <AiOutlineHome size={22} />, label: t("Home"), path: "/" },
    { icon: <MdOutlineExplore size={22} />, label: t("Explore"), path: "/explore" },
    { icon: <MdSportsSoccer size={22} />, label: t("Sports"), path: "/sports" },
    { icon: <MdFolderSpecial size={22} />, label: t("Library"), path: "/library" },
    { icon: <BiUserCircle size={22} />, label: t("Profile"), path: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[120] pb-safe">
      <div className="mx-4 mb-4 h-16 bg-dark/80 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-around px-2 shadow-2xl shadow-black">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                isActive ? "text-primary scale-110" : "text-gray-400 opacity-70"
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "opacity-100" : "opacity-0"}`}>
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
