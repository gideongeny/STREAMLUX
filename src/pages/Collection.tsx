import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTMDBCollection } from "../services/movieAPIs";
import { tmdbImageSrc } from "../shared/utils";
import { motion, AnimatePresence } from "framer-motion";
import { IoArrowBack } from "react-icons/io5";
import FilmItem from "../components/Common/FilmItem";
import AmbientGlow from "../components/Common/AmbientGlow";
import Skeleton from "../components/Common/Skeleton";
import SEO from "../components/Common/SEO";

const Collection: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCollection = async () => {
      if (id) {
        setLoading(true);
        const data = await getTMDBCollection(Number(id));
        setCollection(data);
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark pt-32 px-[4vw]">
        <Skeleton className="w-1/3 h-12 mb-8 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {new Array(12).fill("").map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Collection Not Found</h2>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative pb-20">
      <SEO title={`${collection.name} | StreamLux`} description={collection.overview} />
      <AmbientGlow imageUrl={collection.backdrop_path} />
      
      {/* Header section with Backdrop and Logo-like Title */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <img 
          src={tmdbImageSrc(collection.backdrop_path, "original")} 
          alt={collection.name}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />
        
        <div className="absolute bottom-10 left-[4vw] right-[4vw] z-10">
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
          >
            <IoArrowBack size={18} /> Back
          </button>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
              {collection.name}
            </h1>
            <p className="max-w-2xl text-gray-400 mt-4 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-none">
              {collection.overview}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Grid of movies */}
      <div className="px-[4vw] mt-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white/90 uppercase tracking-tighter">
            {collection.parts?.length || 0} Cinematic Pieces
          </h2>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {collection.parts?.map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <FilmItem item={{...item, media_type: "movie"}} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Collection;
