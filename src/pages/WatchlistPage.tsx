import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDeleteOutline, MdPlayArrow, MdBookmarkBorder, MdArrowBack } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Common/Sidebar';
import SidebarMini from '../components/Common/SidebarMini';
import SEO from '../components/Common/SEO';
import Title from '../components/Common/Title';
import { useWatchlist } from '../components/Common/QuickWatchlist';
import { resizeImage } from '../shared/utils';
import { useCurrentViewportView } from '../hooks/useCurrentViewportView';
import { GiHamburgerMenu } from 'react-icons/gi';
import Footer from '../components/Footer/Footer';
import AmbientGlow from '../components/Common/AmbientGlow';

const WatchlistPage: FC = () => {
    const { getAll, toggle } = useWatchlist();
    const [watchlist, setWatchlist] = useState(getAll());
    const { isMobile } = useCurrentViewportView();
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setWatchlist(getAll());
    }, []);

    const handleRemove = (item: any) => {
        toggle(item);
        setWatchlist(getAll());
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        },
        exit: {
            scale: 0.8,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    // Use first item's poster for Ambient Glow if available
    const activeGlowImage = watchlist.length > 0 ? resizeImage(watchlist[0].posterPath, 'w300') : "";

    return (
        <>
            <Title value="My Watchlist | StreamLux" />
            <SEO
                title="My Watchlist"
                description="Manage your favorite movies and TV shows on StreamLux. Your personalized entertainment collection."
            />
            <AmbientGlow imageUrl={activeGlowImage} />

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

                <div className="flex-grow min-h-screen bg-dark p-6 md:p-10 relative z-0">
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
                                <motion.h1
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase"
                                >
                                    My <span className="text-primary">Watchlist</span>
                                </motion.h1>
                                <p className="text-gray-500 mt-2 font-medium tracking-wide italic">
                                    Your curated collection of must-watch entertainment.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/5 md:px-6 px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            {watchlist.length} {watchlist.length === 1 ? 'Title' : 'Titles'} Saved
                        </div>
                    </header>

                    <AnimatePresence mode="popLayout">
                        {watchlist.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10"
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                    <MdBookmarkBorder size={40} className="text-gray-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Your collection is empty</h2>
                                <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">
                                    Browse movies and TV shows and click the bookmark icon to save them for later.
                                </p>
                                <Link
                                    to="/"
                                    className="px-8 py-3 bg-primary text-white rounded-full font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg shadow-primary/20"
                                >
                                    Explore Content
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
                            >
                                <AnimatePresence>
                                    {watchlist.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            variants={itemVariants}
                                            layout
                                            exit="exit"
                                            className="group relative"
                                        >
                                            <Link to={`/${item.mediaType}/${item.id}`}>
                                                <div className="aspect-[2/3] rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-primary/50 group-hover:shadow-primary/20">
                                                    <img
                                                        src={resizeImage(item.posterPath, 'w342')}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                                                    {/* Item Actions */}
                                                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleRemove(item);
                                                            }}
                                                            className="flex-1 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-red-500/80 transition-all duration-300 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-white/10"
                                                        >
                                                            <MdDeleteOutline size={18} />
                                                            Remove
                                                        </button>
                                                        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-black shadow-lg">
                                                            <MdPlayArrow size={24} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-1 mt-4">
                                                    <h3 className="text-white font-black text-sm tracking-tight line-clamp-1 group-hover:text-primary transition-colors uppercase">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mt-1">
                                                        {item.mediaType === 'movie' ? 'Movie' : 'TV Series'}
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default WatchlistPage;
