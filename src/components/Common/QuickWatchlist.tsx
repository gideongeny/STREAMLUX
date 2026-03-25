import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdBookmarkAdd, MdBookmark, MdCheck } from 'react-icons/md';
import { safeStorage } from '../../utils/safeStorage';
import { toast } from 'react-toastify';

interface QuickWatchlistItem {
    id: number | string;
    title: string;
    posterPath: string;
    mediaType: 'movie' | 'tv';
}

interface QuickWatchlistProps {
    item: QuickWatchlistItem;
    className?: string;
    size?: 'sm' | 'md';
}

const WATCHLIST_KEY = 'streamlux_watchlist';

export const useWatchlist = () => {
    const getAll = (): QuickWatchlistItem[] => safeStorage.getParsed<QuickWatchlistItem[]>(WATCHLIST_KEY, []);
    const isInList = (id: number | string): boolean => getAll().some(i => i.id === id);
    const toggle = (item: QuickWatchlistItem): boolean => {
        const list = getAll();
        const exists = list.some(i => i.id === item.id);
        if (exists) {
            safeStorage.set(WATCHLIST_KEY, JSON.stringify(list.filter(i => i.id !== item.id)));
            return false;
        } else {
            safeStorage.set(WATCHLIST_KEY, JSON.stringify([item, ...list]));
            return true;
        }
    };
    return { getAll, isInList, toggle };
};

const QuickWatchlist: FC<QuickWatchlistProps> = ({ item, className = '', size = 'md' }) => {
    const { isInList, toggle } = useWatchlist();
    const [added, setAdded] = useState(() => isInList(item.id));
    const [showCheck, setShowCheck] = useState(false);

    useEffect(() => {
        setAdded(isInList(item.id));
    }, [item.id]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const nowAdded = toggle(item);
        setAdded(nowAdded);
        if (nowAdded) {
            setShowCheck(true);
            setTimeout(() => setShowCheck(false), 1500);
            toast.success(`Added "${item.title}" to Watchlist`, {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: true,
                icon: '🎬',
            });
        } else {
            toast.info(`Removed from Watchlist`, {
                position: 'bottom-right',
                autoClose: 1500,
                hideProgressBar: true,
            });
        }
    };

    const btnSize = size === 'sm' ? 18 : 22;
    const padding = size === 'sm' ? 'p-1.5' : 'p-2';

    return (
        <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            aria-label={added ? 'Remove from Watchlist' : 'Add to Watchlist'}
            title={added ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`${padding} rounded-full backdrop-blur-md transition-all duration-200 shadow-lg ${added
                ? 'bg-primary text-black'
                : 'bg-black/50 text-white hover:bg-primary/20 hover:text-primary border border-white/20'
                } ${className}`}
        >
            <AnimatePresence mode="wait">
                {showCheck ? (
                    <motion.span
                        key="check"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                    >
                        <MdCheck size={btnSize} />
                    </motion.span>
                ) : added ? (
                    <motion.span
                        key="filled"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <MdBookmark size={btnSize} />
                    </motion.span>
                ) : (
                    <motion.span
                        key="outline"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <MdBookmarkAdd size={btnSize} />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

export default QuickWatchlist;
