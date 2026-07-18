import React, { FC } from 'react';
import SkeletonCard from '../Common/SkeletonCard';

interface SkeletonSliderProps {
    count?: number;
}

const SkeletonSlider: FC<SkeletonSliderProps> = ({ count = 6 }) => {
    return (
        <div className="mb-10">
            {/* Title skeleton */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gray-700 rounded-full animate-pulse" />
                <div className="h-6 bg-gray-700 rounded w-48 animate-pulse" />
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
};

export default SkeletonSlider;
