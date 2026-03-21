import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { MdOutlineExplore, MdFolderSpecial } from "react-icons/md";
import { BiUserCircle } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const MobileBottomNav: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const NAV_ITEMS = [
    { icon: <AiOutlineHome size={26} />, label: t("Home"), path: "/" },
    { icon: <MdOutlineExplore size={26} />, label: t("Explore"), path: "/explore" },
    { 
      icon: (
        <div className="relative -top-6">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 20px rgba(59, 130, 246, 0.4)", "0 0 40px rgba(139, 92, 246, 0.6)", "0 0 20px rgba(59, 130, 246, 0.4)"],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary via-blue-600 to-purple-600 p-1 ring-4 ring-dark shadow-2xl shadow-primary/40"
          >
            <div className="w-full h-full rounded-full bg-dark flex items-center justify-center overflow-hidden">
               <img src="/logo.svg" alt="Hub" className="w-10 h-10" />
            </div>
          </motion.div>
        </div>
      ), 
      label: "", 
      path: "/download",
      special: true 
    },
    { icon: <MdFolderSpecial size={26} />, label: t("Downloads"), path: "/library" },
    { icon: <BiUserCircle size={26} />, label: t("Me"), path: "/profile" },
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
