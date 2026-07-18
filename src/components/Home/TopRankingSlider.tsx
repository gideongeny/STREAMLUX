import { FC } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import 'swiper/css';
import { Item } from '../../shared/types';
import { resizeImage } from '../../shared/utils';

interface Top10SliderProps {
    films: Item[];
}

const TopRankingSlider: FC<Top10SliderProps> = ({ films }) => {
    if (!films || films.length === 0) return null;

    // Top20Today is TMDB-only from home service; keep YouTube out of numbered ranks
    const isTmdbImage = (path?: string | null) =>
        !!path && !path.includes('ytimg.com') && !path.includes('img.youtube.com');

    const top20 = films
        .filter(
            (item) =>
                (item.media_type === 'movie' || item.media_type === 'tv') &&
                !item.youtubeId &&
                !(item as any).isYoutube &&
                (isTmdbImage(item.poster_path) || isTmdbImage(item.backdrop_path))
        )
        .slice(0, 20);

    return (
        <div className="mt-8 px-4 md:px-12">
            <h1 className="text-white text-xl md:text-3xl font-black mb-8 flex items-center gap-3 italic">
                <span className="text-primary tracking-tighter uppercase font-black">TOP 20</span> Today
            </h1>

            <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                spaceBetween={20}
                slidesPerView={1.2}
                observer={true}
                observeParents={true}
                watchSlidesProgress={true}
                breakpoints={{
                    480: { slidesPerView: 1.8 },
                    640: { slidesPerView: 2.5 },
                    768: { slidesPerView: 3.2 },
                    1024: { slidesPerView: 3.8 },
                    1280: { slidesPerView: 4.5 },
                    1536: { slidesPerView: 5.2 },
                }}
                className="!pb-10 !pl-2 overflow-visible"
            >
                {top20.map((item, index) => {
                    const linkPath = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
                    return (
                        <SwiperSlide key={item.id} className="relative group overflow-visible">
                            <Link to={linkPath} className="flex items-end relative pl-20 md:pl-32">

                                {/* Large Ranking Number */}
                                <div
                                    className="absolute left-[-5px] md:left-[-15px] bottom-[-10px] md:bottom-[-20px] text-[130px] md:text-[220px] font-black leading-none z-0 select-none pointer-events-none opacity-80"
                                    style={{
                                        WebkitTextStroke: '2px rgba(255,255,255,0.2)',
                                        color: 'transparent',
                                        fontFamily: 'Impact, sans-serif',
                                        textShadow: '0 0 40px rgba(0,0,0,0.6)'
                                    }}
                                >
                                    {index + 1}
                                </div>

                                {/* Poster Card */}
                                <div className="relative z-10 w-full rounded-2xl overflow-hidden aspect-[2/3] shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:z-20 border border-white/10 bg-dark-lighten ring-1 ring-white/5">
                                    <LazyLoadImage
                                        src={item.youtubeId ? `https://i.ytimg.com/vi/${item.youtubeId}/maxresdefault.jpg` : resizeImage(item.poster_path, "w500")}
                                        alt={item.title || item.name}
                                        effect="opacity"
                                        className="w-full h-full object-cover"
                                        wrapperClassName="w-full h-full"
                                        onError={(e: any) => {
                                            if (item.youtubeId) {
                                                e.target.src = `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`;
                                            }
                                        }}
                                    />
                                    {/* Rating Badge */}
                                    <div className="absolute top-4 right-4 bg-primary px-2 py-1 rounded text-[10px] font-black text-black shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                        {item.vote_average?.toFixed(1)}
                                    </div>

                                    {/* Bottom Info Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-white text-[10px] font-black uppercase truncate tracking-widest">
                                            {item.title || item.name}
                                        </p>
                                    </div>
                                </div>

                            </Link>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default TopRankingSlider;
