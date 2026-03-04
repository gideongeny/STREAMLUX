import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDownload, MdPlayArrow, MdDelete, MdCloudOff, MdFolderSpecial } from 'react-icons/md';
import { offlineService, OfflineItem } from '../services/offline';
import { useAppDispatch } from '../store/hooks';
import { setSource } from '../store/slice/movieSlice';
import { useNavigate } from 'react-router-dom';

const Library: FC = () => {
    const [items, setItems] = useState<OfflineItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        loadLibrary();
        const interval = setInterval(loadLibrary, 5000); // Poll for progress updates
        return () => clearInterval(interval);
    }, []);

    const loadLibrary = async () => {
        const library = await offlineService.getLibrary();
        setItems(library.sort((a, b) => b.addedAt - a.addedAt));
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        await offlineService.deleteItem(id);
        loadLibrary();
    };

    const handlePlay = async (item: OfflineItem) => {
        if (item.status !== 'completed') return;

        try {
            const localUrl = await offlineService.getLocalUrl(item.localPath);
            // We can dispatch to movieSlice to show the player
            dispatch(setSource(localUrl));
            navigate('/watch'); // Or wherever the player is
        } catch (error) {
            console.error('Failed to play offline file:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center gap-4">
                        <MdFolderSpecial className="text-primary" />
                        My Library
                    </h1>
                    <p className="text-gray-400 font-medium">Access your downloaded content anytime, anywhere.</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-gray-400">
                    {items.length} Items Offline
                </div>
            </header>

            <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10"
                    >
                        <MdCloudOff size={80} className="text-gray-600 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Your library is empty</h2>
                        <p className="text-gray-400 max-w-xs text-center">Start downloading movies or shows to watch them without an internet connection.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative bg-[#151515] rounded-3xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-xl"
                            >
                                {/* Poster */}
                                <div className="aspect-[2/3] relative">
                                    <img
                                        src={item.posterPath || "https://images.unsplash.com/photo-1485846234645-a62644f84728"}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                    {/* Action Overlays */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                        {item.status === 'completed' ? (
                                            <button
                                                onClick={() => handlePlay(item)}
                                                className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                                            >
                                                <MdPlayArrow size={32} />
                                            </button>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.progress}%</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white/40 hover:text-red-500 hover:bg-black transition-all"
                                    >
                                        <MdDelete size={18} />
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="p-4">
                                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider font-montserrat">{item.type}</span>
                                        {item.status === 'completed' ? (
                                            <div className="flex items-center gap-1 text-[9px] font-black text-green-500 uppercase">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                Offline
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase animate-pulse">
                                                Downloading
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar Mini */}
                                {item.status === 'downloading' && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500" style={{ width: `${item.progress}%` }} />
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Library;
