import { FC, useState, useEffect } from 'react';
import WatchedFolderSection from '../components/Downloads/WatchedFolderSection';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDownload, MdPlayArrow, MdDelete, MdCloudOff, MdFolderSpecial, MdArrowBack, MdPause, MdFolderOpen, MdSmartphone, MdAdd } from 'react-icons/md';
import { GiHamburgerMenu } from 'react-icons/gi';
import { offlineDownloadService, DownloadItem } from '../services/offlineDownload';
import { deviceFilePicker, ImportedVideoFile } from '../services/deviceFilePicker';
import { useAppDispatch } from '../store/hooks';
import { setSource } from '../store/slice/movieSlice';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Common/Sidebar';
import SidebarMini from '../components/Common/SidebarMini';
import { useCurrentViewportView } from '../hooks/useCurrentViewportView';
import SEO from '../components/Common/SEO';
import Title from '../components/Common/Title';
import Footer from '../components/Footer/Footer';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'react-toastify';

const Library: FC = () => {
    const [items, setItems] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const { isMobile } = useCurrentViewportView();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        loadLibrary();
        const interval = setInterval(loadLibrary, 1000);
        return () => clearInterval(interval);
    }, []);

    const loadLibrary = () => {
        const library = offlineDownloadService.getDownloads();
        setItems(library);
        setIsLoading(false);
    };


    const handleDelete = async (id: string) => {
        await offlineDownloadService.cancelDownload(id);
        loadLibrary();
    };

    const handlePlay = async (item: DownloadItem) => {
        if (item.status !== 'completed' || !item.filePath) return;

        try {
            // Convert Capacitor virtual path to usable src
            const file = await Filesystem.getUri({
                path: item.filePath,
                directory: Directory.Data
            });
            const localUrl = Capacitor.convertFileSrc(file.uri);
            
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
            <Title value="Downloads | StreamLux" />
            <SEO
                title="Downloads"
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
                                    My <span className="text-primary">Downloads</span>
                                </h1>
                                <p className="text-gray-500 mt-2 font-medium tracking-wide font-montserrat italic">
                                    Access your downloaded content anytime, anywhere.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="bg-white/5 md:px-6 px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                {items.length} {items.length === 1 ? 'Item' : 'Items'} Total
                            </div>
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
                                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">No downloads yet</h2>
                                <p className="text-gray-500 max-w-xs mx-auto mb-4 font-medium">
                                    Start downloading movies or shows to watch them without an internet connection.
                                </p>
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
                                                src={item.thumbnail || "https://images.unsplash.com/photo-1485846234645-a62644f84728"}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                            {/* Action Overlays */}
                                            <div className="absolute inset-0 flex mb-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                                                {item.status === 'completed' ? (
                                                    <button
                                                        onClick={() => handlePlay(item)}
                                                        className="w-16 h-16 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:scale-110"
                                                    >
                                                        <MdPlayArrow size={36} />
                                                    </button>
                                                ) : item.status === 'downloading' ? (
                                                    <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                                        <button 
                                                            onClick={() => offlineDownloadService.pauseDownload(item.id)}
                                                            className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors backdrop-blur-md"
                                                        >
                                                            <MdPause size={24} />
                                                        </button>
                                                    </div>
                                                ) : item.status === 'paused' || item.status === 'queued' ? (
                                                    <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                                        <button 
                                                            onClick={() => offlineDownloadService.resumeDownload(item.id)}
                                                            className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg"
                                                        >
                                                            <MdPlayArrow size={24} />
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-white/40 hover:text-red-500 hover:bg-black transition-all duration-300 border border-white/10 z-10"
                                            >
                                                <MdDelete size={20} />
                                            </button>

                                            {/* Status Info Overlay */}
                                            {item.status !== 'completed' && (
                                                <div className="absolute top-4 left-4 z-10">
                                                    <div className={`backdrop-blur-md border px-3 py-1 rounded-full ${
                                                        item.status === 'paused' ? 'bg-orange-500/20 border-orange-500/40' :
                                                        item.status === 'queued' ? 'bg-gray-500/20 border-gray-500/40' :
                                                        'bg-primary/20 border-primary/40'
                                                    }`}>
                                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${
                                                            item.status === 'paused' ? 'text-orange-500' :
                                                            item.status === 'queued' ? 'text-gray-400' :
                                                            'text-primary'
                                                        }`}>
                                                            {item.status === 'paused' ? 'Paused' : item.status === 'queued' ? 'Queued' : 'Syncing...'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="p-5">
                                            <h3 className="text-[15px] font-black text-white line-clamp-1 group-hover:text-primary transition-colors tracking-tight uppercase">{item.title}</h3>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{item.type} {item.seasonNumber ? `S${item.seasonNumber}E${item.episodeNumber}` : ''}</span>
                                                {item.status === 'completed' ? (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        Ready Offline
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-white uppercase tracking-widest">
                                                        {Math.round(item.progress)}%
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

                    {/* ── Device Imported Videos ──────────────────── */}

                    {/* ── Watched Folder (Plex-style) ──────────────────── */}
                    <WatchedFolderSection />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Library;
