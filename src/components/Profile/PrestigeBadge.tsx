import React from "react";
import { motion } from "framer-motion";
import { FaCrown, FaFilm, FaStar, FaGem } from "react-icons/fa";

interface PrestigeBadgeProps {
    type: "legend" | "critic" | "enthusiast" | "elite";
}

const BADGES = {
    legend: {
        icon: <FaCrown />,
        label: "Legendary Cinephile",
        color: "from-yellow-400 to-orange-600",
        shadow: "shadow-yellow-500/50"
    },
    critic: {
        icon: <FaStar />,
        label: "Master Critic",
        color: "from-blue-400 to-indigo-600",
        shadow: "shadow-blue-500/50"
    },
    enthusiast: {
        icon: <FaFilm />,
        label: "Film Enthusiast",
        color: "from-green-400 to-emerald-600",
        shadow: "shadow-green-500/50"
    },
    elite: {
        icon: <FaGem />,
        label: "StreamLux Elite",
        color: "from-purple-400 to-pink-600",
        shadow: "shadow-purple-500/50"
    }
};

const PrestigeBadge: React.FC<PrestigeBadgeProps> = ({ type }) => {
    const badge = BADGES[type];

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${badge.color} text-white text-xs font-black uppercase tracking-tighter shadow-lg ${badge.shadow} cursor-default`}
        >
            <span className="text-sm">{badge.icon}</span>
            <span>{badge.label}</span>
        </motion.div>
    );
};

export default PrestigeBadge;
