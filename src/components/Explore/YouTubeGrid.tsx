import React from 'react';
import { Link } from 'react-router-dom';
import { YouTubeVideo } from '../../services/youtube';

interface YouTubeGridProps {
    videos: YouTubeVideo[];
    loading: boolean;
    error: string | null;
}

const YouTubeGrid: React.FC<YouTubeGridProps> = ({ videos, loading, error }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-800 aspect-video rounded-xl mb-3"></div>
                        <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">Error loading videos: {error}</p>
            </div>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-400">No videos found for this category.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
                <Link
                    key={video.id}
                    to={`/youtube/${video.id}`}
                    className="group cursor-pointer bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 block"
                >
                    <div className="relative aspect-video">
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                        {video.type && (
                            <div className="absolute top-2 right-2 bg-black/70 text-xs font-bold px-2 py-1 rounded text-primary uppercase">
                                {video.type}
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-100 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {video.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                            {video.channelTitle}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default YouTubeGrid;
