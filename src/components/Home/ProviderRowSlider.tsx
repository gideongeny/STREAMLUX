import React, { useRef, useState, useEffect } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { providerCatalog, ProviderPost } from '../../services/providers/providerCatalog';
import ProviderPostCard from './ProviderPostCard';

interface ProviderRowSliderProps {
    title: string;
    filter: string;
    providerValue: string;
    onFirstItemLoaded?: (post: ProviderPost) => void;
    onItemsLoaded?: (count: number) => void;
}

const ProviderRowSlider: React.FC<ProviderRowSliderProps> = ({
    title,
    filter,
    providerValue,
    onFirstItemLoaded,
    onItemsLoaded
}) => {
    const [posts, setPosts] = useState<ProviderPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        providerCatalog.getPosts(filter, 1, providerValue).then((data) => {
            if (!isMounted) return;
            const valid = data || [];
            setPosts(valid);
            setIsLoading(false);
            if (onItemsLoaded) onItemsLoaded(valid.length);
            if (valid.length > 0 && onFirstItemLoaded) {
                onFirstItemLoaded(valid[0]);
            }
        }).catch(() => {
            if (isMounted) {
                setIsLoading(false);
                if (onItemsLoaded) onItemsLoaded(0);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [filter, providerValue]);

    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollStart = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollStart.current = scrollRef.current.scrollLeft;
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.5;
        scrollRef.current.scrollLeft = scrollStart.current - walk;
    };

    const onMouseUp = () => {
        isDragging.current = false;
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const offset = direction === 'left' ? -480 : 480;
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    };

    if (!isLoading && posts.length === 0) {
        return null;
    }

    return (
        <section className="mb-10 relative group/row">
            {/* Row Title & Navigation Controls */}
            <div className="flex items-center justify-between mb-3 px-1 md:px-0">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#FF6B35] rounded-full" />
                    <h2 className="text-sm md:text-base font-black text-white tracking-wide uppercase">
                        {title}
                    </h2>
                    <span className="text-[10px] text-[#FF6B35]/80 font-mono">
                        {isLoading ? '• Syncing...' : `(${posts.length})`}
                    </span>
                </div>

                {/* Left/Right Buttons - Visible on all screen sizes */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => scroll('left')}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 active:bg-[#FF6B35] active:text-black border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                        aria-label="Scroll left"
                        title="Scroll left"
                    >
                        <MdChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 active:bg-[#FF6B35] active:text-black border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                        aria-label="Scroll right"
                        title="Scroll right"
                    >
                        <MdChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Slider Container with visible sleek scrollbar and mouse-drag + touch-swipe */}
            <div
                ref={scrollRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                className="flex items-center gap-3 md:gap-4 overflow-x-auto streamlux-category-scroll pb-3 pt-1 px-1 cursor-grab active:cursor-grabbing select-none"
            >
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="shrink-0 w-[140px] sm:w-[170px] md:w-[190px] aspect-[2/3] rounded-2xl bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-black/80 animate-pulse border border-white/5 relative overflow-hidden flex items-center justify-center shadow-lg"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-30">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]/50" />
                            </div>
                        </div>
                    ))
                ) : (
                    posts.map((post, idx) => (
                        <ProviderPostCard
                            key={`${post.link}-${idx}`}
                            post={post}
                            providerValue={providerValue}
                        />
                    ))
                )}
            </div>
        </section>
    );
};

export default ProviderRowSlider;
