import { FC } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Item } from '../../shared/types';
import { IMAGE_URL } from '../../shared/constants';

interface Top10SliderProps {
    films: Item[];
}

const Top10Slider: FC<Top10SliderProps> = ({ films }) => {
    if (!films || films.length === 0) return null;

    return (
        <div className="mt-8 px-4 md:px-12">
            <h1 className="text-white text-xl md:text-2xl font-medium mb-5 flex items-center gap-2">
                <span className="text-primary font-bold">TOP 10</span> Today
            </h1>

            <Swiper
                spaceBetween={16}
                slidesPerView={1.1}
                breakpoints={{
                    400: { slidesPerView: 1.2 },
                    500: { slidesPerView: 1.8 },
                    640: { slidesPerView: 2.5 },
                    768: { slidesPerView: 2.8 },
                    1024: { slidesPerView: 3.5 },
                    1280: { slidesPerView: 4.2 },
                }}
                className="!pb-5 !pl-2 overflow-visible"
            >
                {films.map((item, index) => {
                    const linkPath = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
                    return (
                        <SwiperSlide key={item.id} className="relative group overflow-visible">
                            <Link to={linkPath} className="flex items-end relative pl-10 md:pl-12">

                                {/* Large Ranking Number */}
                                <div
                                    className="absolute left-[-5px] md:left-[-15px] bottom-[-5px] md:bottom-[-10px] text-[100px] md:text-[160px] font-black leading-none z-0 select-none pointer-events-none opacity-80"
                                    style={{
                                        WebkitTextStroke: '2px rgba(255,255,255,0.2)',
                                        color: '#000000',
                                        fontFamily: 'Impact, sans-serif',
                                        textShadow: '0 0 20px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {index + 1}
                                </div>

                                {/* Poster Card */}
                                <div className="relative z-10 w-full rounded-xl overflow-hidden aspect-[2/3] shadow-2xl transition-transform duration-300 group-hover:scale-105 group-hover:z-20 border border-white/10 bg-dark-lighten">
                                    <LazyLoadImage
                                        src={`${IMAGE_URL}/w342${item.poster_path}`}
                                        alt={item.title || item.name}
                                        effect="opacity"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Rating Badge */}
                                    <div className="absolute top-3 right-3 bg-primary px-1.5 py-0.5 rounded text-[10px] font-black text-black shadow-lg">
                                        {item.vote_average?.toFixed(1)}
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

export default Top10Slider;
