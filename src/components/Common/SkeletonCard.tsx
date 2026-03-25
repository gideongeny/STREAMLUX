import React, { FC } from 'react';

interface SkeletonCardProps {
    className?: string;
}

const SkeletonCard: FC<SkeletonCardProps> = ({ className = '' }) => {
    return (
        <div className={`animate-pulse ${className}`}>
            <div className="bg-dark-lighten rounded-lg overflow-hidden">
                {/* Image skeleton */}
                <div className="w-full aspect-[2/3] bg-gray-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent shimmer" />
                </div>

                {/* Title skeleton */}
                <div className="p-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent shimmer" />
                    </div>
                    <div className="h-3 bg-gray-700 rounded w-1/2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent shimmer" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
