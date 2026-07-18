import { FC } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import { WatchProgress } from '../../hooks/useWatchProgress';
import { IMAGE_URL } from '../../shared/constants';
import { MdClose } from 'react-icons/md';

interface ContinueWatchingProps {
    watchHistory: WatchProgress[];
    onClearProgress: (mediaId: number, mediaType: 'movie' | 'tv') => void;
}

const ContinueWatching: FC<ContinueWatchingProps> = ({ watchHistory, onClearProgress }) => {
    if (!watchHistory || watchHistory.length === 0) return null;

    // Only show items with >5% and <95% progress
    const filteredHistory = watchHistory.filter(item => item.progress > 5 && item.progress < 95);

    if (filteredHistory.length === 0) return null;

    return (
        <div className="mt-8">
            <h1 className="text-white text-xl md:text-2xl font-medium mb-3">Continue Watching</h1>

            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={12}
                slidesPerView={2.5}
                breakpoints={{
                    640: { slidesPerView: 3.5 },
                    768: { slidesPerView: 4.5 },
                    1024: { slidesPerView: 5.5 },
                    1280: { slidesPerView: 6.5 },
                }}
                className="mySwiper"
            >
                {filteredHistory.map((item) => {
                    const linkPath = item.mediaType === 'movie'
                        ? `/movie/${item.mediaId}`
                        : `/tv/${item.mediaId}`;

                    return (
                        <SwiperSlide key={`${item.mediaType}_${item.mediaId}`}>
                            <div className="relative group">
                                <Link to={linkPath}>
                                    <div className="relative rounded overflow-hidden aspect-[2/3]">
                                        <LazyLoadImage
                                            src={`${IMAGE_URL}/w342${item.posterPath}`}
                                            alt={item.title}
                                            effect="opacity"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />

                                        {/* Progress bar */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>

                                        {/* Progress time overlay */}
                                        <div className="absolute bottom-2 left-2 text-xs bg-black/80 px-2 py-1 rounded">
                                            {Math.floor(item.currentTime / 60)}m left
                                        </div>
                                    </div>

                                    <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                        {item.seasonNumber && item.episodeNumber && (
                                            <span className="text-xs text-gray-400 block">
                                                S{item.seasonNumber} E{item.episodeNumber}
                                            </span>
                                        )}
                                    </h3>
                                </Link>

                                {/* Remove button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onClearProgress(item.mediaId, item.mediaType);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
                                    aria-label="Remove from Continue Watching"
                                >
                                    <MdClose className="w-4 h-4" />
                                </button>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default ContinueWatching;
