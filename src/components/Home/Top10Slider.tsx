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
                spaceBetween={20}
                slidesPerView={2.2}
                breakpoints={{
                    640: { slidesPerView: 3.2 },
                    768: { slidesPerView: 3.5 },
                    1024: { slidesPerView: 4.5 },
                    1280: { slidesPerView: 5.5 },
                }}
                className="!pb-5 !pl-1 overflow-visible"
            >
                {films.map((item, index) => {
                    const linkPath = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
                    return (
                        <SwiperSlide key={item.id} className="relative group overflow-visible">
                            <Link to={linkPath} className="flex items-end relative pl-8">

                                {/* Large Ranking Number */}
                                <div
                                    className="absolute left-[-15px] bottom-0 text-[100px] md:text-[140px] font-black leading-[0.7] z-0 select-none pointer-events-none"
                                    style={{
                                        WebkitTextStroke: '2px #555',
                                        color: '#000000',
                                        fontFamily: 'Impact, sans-serif'
                                    }}
                                >
                                    {index + 1}
                                </div>

                                {/* Poster Card */}
                                <div className="relative z-10 w-full rounded-lg overflow-hidden aspect-[2/3] shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:z-20 bg-dark-lighten">
                                    <LazyLoadImage
                                        src={`${IMAGE_URL}/w342${item.poster_path}`}
                                        alt={item.title || item.name}
                                        effect="opacity"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Rating Badge */}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold text-primary">
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
