import { FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    id: 1,
    image: "/hero_1_png_1773441747477.png",
    title: "STREAM YOUR",
    highlight: "FAVORITE MOVIES",
    description: "Experience cinema-quality streaming from the comfort of your home. Thousands of titles waiting for you.",
    buttonText: "START WATCHING",
    link: "/explore?type=movie",
    type: "movie"
  },
  {
    id: 2,
    image: "/hero_2_png_1773441761380.png",
    title: "STREAM MOVIES • TV SHOWS",
    highlight: "SPORTS",
    description: "The ultimate destination for all your entertainment needs. Live scores, epic series, and blockbuster hits.",
    buttonText: "EXPLORE NOW",
    link: "/sports",
    type: "sports"
  },
  {
    id: 3,
    image: "/ad_banner.png",
    title: "PREMIUM",
    highlight: "AD EXPERIENCE",
    description: "Upgrade to StreamLux Premium for an ad-free experience, offline downloads, and 4K Ultra HD streaming.",
    buttonText: "GO PREMIUM",
    link: "/settings",
    type: "ad"
  },
  {
    id: 4,
    image: "/app_promo.png",
    title: "WATCH ON",
    highlight: "THE GO",
    description: "Download the StreamLux mobile app for Android and iOS. Take your favorite content wherever you go.",
    buttonText: "DOWNLOAD APK",
    link: "/download",
    type: "ad"
  }
];

const HeroCarousel: FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setIndex((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl group shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 bg-dark-lighten md:h-[400px] h-[250px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={SLIDES[index].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: `url(${SLIDES[index].image})`,
            backgroundPosition: "right center"
          }}
        >
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/60 to-transparent" />
          
          {/* Content Layer */}
          <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl space-y-2 md:space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h2 className="text-white text-xl md:text-3xl font-black tracking-tighter leading-none">
                {SLIDES[index].title}
              </h2>
              <h1 className="text-primary text-3xl md:text-5xl font-black tracking-tighter leading-none mt-1">
                {SLIDES[index].highlight}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-gray-300 text-xs md:text-sm line-clamp-2 md:line-clamp-none max-w-md font-medium leading-relaxed"
            >
              {SLIDES[index].description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="pt-2"
            >
              <Link 
                to={SLIDES[index].link}
                className="inline-block bg-primary hover:bg-primary-darken text-white font-bold py-2 px-6 md:py-3 md:px-10 rounded-xl text-xs md:text-sm shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {SLIDES[index].buttonText}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-8 bg-primary" : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Arrows (Hidden on Mobile) */}
      <button 
        onClick={prevSlide}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/5 text-white/50 hover:text-white hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
      >
        {"<"}
      </button>
      <button 
        onClick={nextSlide}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/5 text-white/50 hover:text-white hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
      >
        {">"}
      </button>
    </div>
  );
};

export default HeroCarousel;
