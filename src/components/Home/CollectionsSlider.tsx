import { FC, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper";
import { motion } from "framer-motion";
import { getTMDBCollection } from "../../services/movieAPIs";
import { tmdbImageSrc } from "../../shared/utils";
import { Link } from "react-router-dom";

const COLLECTION_IDS = [
  86311,  // Avengers (MCU)
  131292, // Iron Man
  131295, // Thor
  131296, // Captain America
  1241,   // Harry Potter
  263,    // The Dark Knight (Batman Nolan)
  10,     // Star Wars
  645,    // James Bond (007)
  9485,   // Fast & Furious
  330,    // Jurassic Park
  556,    // Spider-Man (Raimi)
  125574, // The Hobbit
  119,    // Lord of the Rings
  84,     // Indiana Jones
  2344,   // The Matrix
  295130, // Pirates of the Caribbean
  87359,  // Mission Impossible
  272,    // Batman (Tim Burton)
  131635, // The Hunger Games
  10194,  // Toy Story
  8354,   // Ice Age
  748,    // X-Men
  8650,   // Transformers
  404609, // John Wick
  2980,   // Shrek
];

const CollectionsSlider: FC = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      const data = await Promise.all(
        COLLECTION_IDS.map(id => getTMDBCollection(id))
      );
      setCollections(data.filter(c => c !== null));
      setLoading(false);
    };
    fetchCollections();
  }, []);

  if (loading || collections.length === 0) return null;

  return (
    <div className="py-10">
      <h2 className="text-2xl font-black mb-6 tracking-tighter uppercase text-white/90">
        Epic Collections
      </h2>
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
        navigation
        autoplay={{ delay: 5000 }}
        className="tw-section-slider !overflow-visible"
      >
        {collections.map((col) => (
          <SwiperSlide key={col.id}>
            <Link to={`/collection/${col.id}`}>
              <motion.div
                whileHover={{ y: -10 }}
                className="relative aspect-[16/9] rounded-2xl overflow-hidden group border border-white/5 shadow-2xl"
              >
                {/* Backdrop with multi-poster feel */}
                <img
                  src={tmdbImageSrc(col.backdrop_path, "w1280")}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay with Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">
                    Collection
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white leading-tight group-hover:text-primary transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {col.overview}
                  </p>
                  
                  {/* Badge: Number of Films */}
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-[10px] font-bold text-white">
                      {col.parts?.length || 0} Films
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CollectionsSlider;
