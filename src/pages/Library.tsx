import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDownload, MdPlayArrow, MdDelete, MdCloudOff, MdFolderSpecial, MdArrowBack } from 'react-icons/md';
import { GiHamburgerMenu } from 'react-icons/gi';
import { offlineService, OfflineItem } from '../services/offline';
import { useAppDispatch } from '../store/hooks';
import { setSource } from '../store/slice/movieSlice';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Common/Sidebar';
import SidebarMini from '../components/Common/SidebarMini';
import { useCurrentViewportView } from '../hooks/useCurrentViewportView';
import SEO from '../components/Common/SEO';
import Title from '../components/Common/Title';
import Footer from '../components/Footer/Footer';

const Library: FC = () => {
    const [items, setItems] = useState<OfflineItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const { isMobile } = useCurrentViewportView();
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
            dispatch(setSource(localUrl));
            navigate('/watch');
        } catch (error) {
            console.error('Failed to play offline file:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-dark">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Title value="My Library | StreamLux" />
            <SEO
                title="My Library"
                description="Access your downloaded movies and TV shows anytime, anywhere. Your offline entertainment hub."
            />

            {isMobile && (
                <div className="flex justify-between items-center px-5 py-4 sticky top-0 z-[100] bg-dark/60 backdrop-blur-xl">
                    <Link to="/" className="flex gap-2 items-center">
                        <img src="/logo.svg" alt="StreamLux Logo" className="h-10 w-10" />
                        <p className="text-xl text-white font-medium tracking-wider uppercase">
                            Stream<span className="text-primary">Lux</span>
                        </p>
                    </Link>
                    <button onClick={() => setIsSidebarActive(true)}>
                        <GiHamburgerMenu size={25} />
                    </button>
                </div>
            )}

            <div className="flex items-start">
                {!isMobile && <SidebarMini />}
                <Sidebar
                    isSidebarActive={isSidebarActive}
                    onCloseSidebar={() => setIsSidebarActive(false)}
                />

                <div className="flex-grow min-h-screen bg-dark p-6 md:p-10">
                    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition group w-fit"
                            >
                                <MdArrowBack size={20} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-bold uppercase tracking-widest">Back</span>
                            </button>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 tracking-tighter uppercase">
                                    My <span className="text-primary">Library</span>
                                </h1>
                                <p className="text-gray-500 mt-2 font-medium tracking-wide font-montserrat italic">
                                    Access your downloaded content anytime, anywhere.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/5 md:px-6 px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            {items.length} {items.length === 1 ? 'Item' : 'Items'} Offline
                        </div>
                    </header>

                    <AnimatePresence mode="popLayout">
                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10"
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                    <MdCloudOff size={40} className="text-gray-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Your library is empty</h2>
                                <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">
                                    Start downloading movies or shows to watch them without an internet connection.
                                </p>
                                <Link
                                    to="/"
                                    className="px-8 py-3 bg-primary text-white rounded-full font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg shadow-primary/20"
                                >
                                    Start Exploring
                                </Link>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="group relative bg-[#151515]/50 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500 shadow-2xl"
                                    >
                                        {/* Poster */}
                                        <div className="aspect-[2/3] relative overflow-hidden">
                                            <img
                                                src={item.posterPath || "https://images.unsplash.com/photo-1485846234645-a62644f84728"}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                            {/* Action Overlays */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                                                {item.status === 'completed' ? (
                                                    <button
                                                        onClick={() => handlePlay(item)}
                                                        className="w-16 h-16 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:scale-110"
                                                    >
                                                        <MdPlayArrow size={36} />
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                                        <span className="text-xs font-black text-white uppercase tracking-widest drop-shadow-lg">{item.progress}%</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-white/40 hover:text-red-500 hover:bg-black transition-all duration-300 border border-white/10"
                                            >
                                                <MdDelete size={20} />
                                            </button>

                                            {/* Progress Info Overlay */}
                                            {item.status === 'downloading' && (
                                                <div className="absolute top-4 left-4">
                                                    <div className="bg-primary/20 backdrop-blur-md border border-primary/40 px-3 py-1 rounded-full">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Syncing...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="p-5">
                                            <h3 className="text-[15px] font-black text-white line-clamp-1 group-hover:text-primary transition-colors tracking-tight uppercase">{item.title}</h3>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{item.type}</span>
                                                {item.status === 'completed' ? (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        Ready Offline
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
                                                        Downloading
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress Bar Mini */}
                                        {item.status === 'downloading' && (
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.progress}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Library;
