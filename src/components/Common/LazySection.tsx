import React, { FC, ReactNode, useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Item } from '../../shared/types';
import SectionSlider from '../Slider/SectionSlider';
import Skeleton from './Skeleton';

interface LazySectionProps {
  children?: ReactNode;
  fetcher?: () => Promise<Item[]>;
  title?: string;
  placeholderHeight?: string | number;
  threshold?: number;
  rootMargin?: string;
  isLarge?: boolean;
  className?: string;
  forceLoad?: boolean;
}

/**
 * LazySection
 * A high-performance wrapper that can either:
 * 1. Render children only when visible (Virtualization mode)
 * 2. Fetch data and render a SectionSlider only when visible (Fetcher mode)
 */
const LazySection: FC<LazySectionProps> = ({ 
  children, 
  fetcher,
  title = "",
  placeholderHeight = 280, 
  threshold = 0.01,
  rootMargin = '400px 0px',
  isLarge = false,
  className = "",
  forceLoad = false
}) => {
  const [data, setData] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(forceLoad);
  const [hasLoaded, setHasLoaded] = useState(forceLoad);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold,
    rootMargin,
  });

  useEffect(() => {
    if (!fetcher || (hasLoaded && !isLoading)) return;

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

    if (forceLoad || inView) {
      loadData();
    }
  }, [fetcher, inView, forceLoad, hasLoaded, isLoading, title]);

  // Loading state for fetcher mode
  if (fetcher && isLoading) {
    return (
      <div className={`mb-12 ${className}`}>
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

  // Children mode (Virtualization)
  if (children) {
    return (
        <div ref={ref} className={className} style={{ minHeight: inView ? 'auto' : placeholderHeight }}>
          {inView ? children : (
            <div className="w-full mb-12 animate-pulse" style={{ height: placeholderHeight }}>
              {title && <div className="h-8 w-48 bg-white/10 rounded-md mb-4" />}
              <div className="flex gap-4 overflow-hidden">
                 {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[250px] w-[170px] bg-white/5 rounded-xl shrink-0" />
                 ))}
              </div>
            </div>
          )}
        </div>
      );
  }

  // Fetcher mode (Data loading)
  if (fetcher) {
    return (
        <div ref={ref} className={className}>
            {hasLoaded && data.length > 0 ? (
                <SectionSlider films={data} title={title} />
            ) : (
                <div style={{ height: placeholderHeight }} />
            )}
        </div>
    );
  }

  return null;
};

export default LazySection;
