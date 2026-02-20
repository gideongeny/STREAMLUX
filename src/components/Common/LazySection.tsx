import React, { useState, useEffect, useRef } from 'react';
import { Item } from '../../shared/types';
import SectionSlider from '../Slider/SectionSlider';
import Skeleton from './Skeleton';

interface LazySectionProps {
    fetcher: () => Promise<Item[]>;
    title: string;
    isLarge?: boolean;
    className?: string;
    forceLoad?: boolean; // For initial sections that should load immediately
}

const LazySection: React.FC<LazySectionProps> = ({
    fetcher,
    title,
    isLarge,
    className,
    forceLoad = false
}) => {
    const [data, setData] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(forceLoad);
    const [hasLoaded, setHasLoaded] = useState(forceLoad);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // If we're already loading or loaded, do nothing (unless forced initially)
        if (hasLoaded && !isLoading) return;

        const loadData = async () => {
            try {
                setIsLoading(true);
                const result = await fetcher();
                setData(Array.isArray(result) ? result : []);
            } catch (error) {
                console.warn(`Failed to load section: ${title}`, error);
                setData([]);
            } finally {
                setIsLoading(false);
                setHasLoaded(true);
            }
        };

        if (forceLoad) {
            loadData();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadData();
                    observer.disconnect();
                }
            },
            { rootMargin: '400px' } // Start loading 400px before it enters viewport
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [fetcher, title, forceLoad]);

    // Initial state (before intersection)
    if (!hasLoaded && !isLoading) {
        return (
            <div ref={containerRef} className={`mb-12 min-h-[250px] ${className || ''}`}>
                {/* Invisible trigger area */}
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className={`mb-12 ${className || ''}`}>
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className={`h-[${isLarge ? '350px' : '250px'}] w-[170px] shrink-0 rounded-xl`} />
                    ))}
                </div>
            </div>
        );
    }

    // Loaded but empty
    if (data.length === 0) {
        return null;
    }

    // Loaded with data
    return <SectionSlider films={data} title={title} />;
};

export default LazySection;
