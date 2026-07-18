import React, { FC, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import { continueWatchingService, ContinueWatchingItem } from '../../services/continueWatching';
import { Link } from 'react-router-dom';

const ContinueWatchingRail: FC = () => {
    const [items, setItems] = useState<ContinueWatchingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContinueWatching();
    }, []);

    const loadContinueWatching = async () => {
        setLoading(true);
        const data = await continueWatchingService.getContinueWatching(10);
        setItems(data);
        setLoading(false);
    };

    const handleRemove = async (itemId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await continueWatchingService.removeItem(itemId);
        setItems(items.filter(item => item.id !== itemId));
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl md:text-2xl font-semibold text-white">Continue Watching</h2>
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-64 h-36 bg-dark-lighten rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-primary rounded-full" />
                    <h2 className="text-xl md:text-2xl font-semibold text-white">Continue Watching</h2>
                </div>
                <button
                    onClick={() => continueWatchingService.clearAll().then(() => setItems([]))}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                    Clear All
                </button>
            </div>

            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={16}
                slidesPerView="auto"
                className="continue-watching-swiper"
            >
                {items.map((item) => (
                    <SwiperSlide key={item.id} className="!w-auto">
                        <Link
                            to={item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`}
                            className="group block relative w-64"
                        >
                            {/* Thumbnail */}
                            <div className="relative rounded-lg overflow-hidden bg-dark-lighten">
                                <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />

                                {/* Play overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-primary bg-opacity-0 group-hover:bg-opacity-100 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300">
                                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${item.progress}%` }}
                                    />
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={(e) => handleRemove(item.id, e)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black bg-opacity-60 hover:bg-opacity-80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Info */}
                            <div className="mt-2">
                                <h3 className="text-white font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-400">
                                        {item.type === 'tv' && item.seasonNumber && item.episodeNumber
                                            ? `S${item.seasonNumber}:E${item.episodeNumber}`
                                            : formatTime(item.duration - item.currentTime) + ' left'}
                                    </p>
                                    <p className="text-xs text-primary font-medium">
                                        {Math.round(item.progress)}%
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ContinueWatchingRail;
