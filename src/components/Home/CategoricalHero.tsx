import { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CATEGORIES = [
  { name: "Hollywood", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300", query: "hollywood" },
  { name: "Nollywood", image: "https://images.unsplash.com/photo-1542204172-356399558651?auto=format&fit=crop&q=80&w=300", query: "nollywood" },
  { name: "Bollywood", image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&q=80&w=300", query: "bollywood" },
  { name: "Anime", image: "https://images.unsplash.com/photo-1578632738981-831633534571?auto=format&fit=crop&q=80&w=300", query: "anime" }
];

const CategoricalHero: FC = () => {
    return (
        <div className="my-8 px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Trending <span className="text-primary">Categories</span></h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {CATEGORIES.map((cat, i) => (
                    <Link 
                        key={i} 
                        to={`/explore?category=${cat.query}`}
                        className="shrink-0 group"
                    >
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-40 h-20 rounded-2xl overflow-hidden shadow-lg border border-white/5"
                        >
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white font-black uppercase tracking-widest text-xs drop-shadow-lg">{cat.name}</span>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoricalHero;
