import { FC, useState, useEffect } from "react";
import { AiFillStar, AiFillHeart } from "react-icons/ai";
import { BsFillPlayFill, BsShareFill, BsThreeDots } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { YouTubeVideo } from "../../services/youtube";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import Sidebar from "../Common/Sidebar";
import SidebarMini from "../Common/SidebarMini";
import Title from "../Common/Title";
import Footer from "../Footer/Footer";
import RightbarFilms from "../Common/RightbarFilms";
import SearchBox from "../Common/SearchBox";

interface YouTubeDetailProps {
    video: YouTubeVideo;
}

const YouTubeDetail: FC<YouTubeDetailProps> = ({ video }) => {
    const { isMobile } = useCurrentViewportView();
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Format views
    const formatViews = (views?: string) => {
        if (!views) return "0";
        const num = parseInt(views);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    return (
        <>
            <Title value={`${video.title} | StreamLux`} />

            <div className="flex md:hidden justify-between items-center px-5 my-3">
                <Link to="/" className="flex gap-2 items-center">
                    <img src="/logo.svg" alt="StreamLux Logo" className="h-10 w-10" />
                    <p className="text-xl text-white font-medium tracking-wider uppercase">
                        Stream<span className="text-primary">Lux</span>
                    </p>
                </Link>
                <button onClick={() => setIsSidebarActive((prev) => !prev)}>
                    <GiHamburgerMenu size={25} />
                </button>
            </div>

            <div className="flex flex-col md:flex-row bg-dark min-h-screen text-white">
                {!isMobile && <SidebarMini />}
                {isMobile && (
                    <Sidebar
                        onCloseSidebar={() => setIsSidebarActive(false)}
                        isSidebarActive={isSidebarActive}
                    />
                )}

                <div className="flex-grow">
                    {/* HERO SECTION */}
                    <div className="relative w-full overflow-hidden">
                        {/* BACKDROP */}
                        <div className={`relative transition-all duration-700 ${isPlaying ? 'h-[60vh] md:h-[80vh]' : 'h-[400px] md:h-[500px]'}`}>
                            {!isPlaying ? (
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
                                    style={{ backgroundImage: `url(${video.thumbnail})` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-black">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                                        title={video.title}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            {/* OVERLAY CONTENT (Only if not playing or in background) */}
                            {!isPlaying && (
                                <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-12">
                                    <div className="flex flex-col md:flex-row gap-8 items-end">
                                        {/* POSTER (Optional but matches TMDB) */}
                                        {!isMobile && (
                                            <div className="shrink-0 w-[200px] shadow-2xl rounded-lg overflow-hidden translate-y-20 border-4 border-white/10">
                                                <LazyLoadImage
                                                    src={video.thumbnail}
                                                    className="w-full h-full object-cover"
                                                    alt={video.title}
                                                />
                                            </div>
                                        )}

                                        <div className="flex-grow">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="px-3 py-1 bg-primary/20 border border-primary/50 text-primary text-xs font-bold rounded-full uppercase">
                                                    YouTube Original
                                                </span>
                                                <span className="px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-full">
                                                    HD
                                                </span>
                                            </div>
                                            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                                                {video.title}
                                            </h1>

                                            <div className="flex flex-wrap gap-4 items-center">
                                                <button
                                                    onClick={() => setIsPlaying(true)}
                                                    className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-bold transition-all transform hover:scale-105"
                                                >
                                                    <BsFillPlayFill size={28} />
                                                    WATCH NOW
                                                </button>

                                                <div className="flex gap-3">
                                                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                                        <AiFillHeart size={24} />
                                                    </button>
                                                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                                        <BsShareFill size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* INFORMATION SECTION */}
                        <div className="max-w-[1200px] mx-auto px-6 md:px-16 mt-20 md:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <div className="flex gap-8 border-b border-white/10 pb-4 mb-8">
                                    <button className="text-primary font-bold border-b-2 border-primary pb-4">Overall</button>
                                    <button className="text-gray-400 hover:text-white transition-colors">Details</button>
                                    <button className="text-gray-400 hover:text-white transition-colors">Reviews</button>
                                </div>

                                <div className="mb-10">
                                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Story</h3>
                                    <p className="text-gray-300 text-lg leading-relaxed italic mb-6">"Available exclusively on StreamLux via YouTube"</p>
                                    <p className="text-white text-lg leading-relaxed">
                                        {video.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
                                    <div>
                                        <h4 className="text-gray-400 text-sm font-bold uppercase mb-2">Duration</h4>
                                        <p className="text-white text-xl font-medium">
                                            {video.duration ? `${Math.floor(video.duration / 60)} min` : "40min+"}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-400 text-sm font-bold uppercase mb-2">Views</h4>
                                        <p className="text-white text-xl font-medium">{formatViews(video.viewCount)}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-400 text-sm font-bold uppercase mb-2">Release Date</h4>
                                        <p className="text-white text-xl font-medium">
                                            {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 sticky top-24">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <AiFillStar className="text-yellow-500" />
                                        More Details
                                    </h3>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Channel</p>
                                            <p className="text-white font-medium">{video.channelTitle}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Type</p>
                                            <p className="text-white font-medium uppercase">{video.type}</p>
                                        </div>
                                        {video.tags && video.tags.length > 0 && (
                                            <div>
                                                <p className="text-gray-400 text-xs font-bold uppercase mb-2">Tags</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {video.tags.slice(0, 5).map(tag => (
                                                        <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 md:px-16 mt-20">
                        <Footer />
                    </div>
                </div>

                {/* RIGHTBAR FOR SIMILAR */}
                <div className="shrink-0 md:max-w-[310px] w-full relative px-6 mt-10 md:mt-0">
                    {!isMobile && <SearchBox />}
                    <div className="mt-24">
                        <h3 className="text-xl font-bold mb-6">Similar</h3>
                        <p className="text-gray-400 italic">Finding similar movies on YouTube...</p>
                        {/* Similar section could be populated with more YouTube results */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default YouTubeDetail;
