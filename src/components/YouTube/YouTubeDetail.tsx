import { FC, useState, useEffect } from "react";
import { AiOutlineHistory, AiOutlineHome, AiOutlineDownload, AiFillStar, AiFillHeart, AiOutlineArrowLeft } from "react-icons/ai";
import { BsFillPlayFill, BsShareFill, BsThreeDots } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useNavigate } from "react-router-dom";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { toast, ToastContainer } from "react-toastify";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../shared/firebase";
import { useAppSelector } from "../../store/hooks";
import { calculateRating, YouTubeVideo } from "../../services/youtube";
import { Item, Reviews } from "../../shared/types";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import Sidebar from "../Common/Sidebar";
import SidebarMini from "../Common/SidebarMini";
import Title from "../Common/Title";
import Footer from "../Footer/Footer";
import RightbarFilms from "../Common/RightbarFilms";
import SearchBox from "../Common/SearchBox";
import ReadMore from "../Common/ReadMore";
import ReviewTab from "../FilmDetail/ReviewTab";

interface YouTubeDetailProps {
    video: YouTubeVideo;
    similar?: YouTubeVideo[];
    reviews?: Reviews[];
}

const YouTubeDetail: FC<YouTubeDetailProps> = ({ video, similar, reviews }) => {
    const { isMobile } = useCurrentViewportView();
    const currentUser = useAppSelector((state) => state.auth.user);
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [currentTab, setCurrentTab] = useState("overall");
    const navigate = useNavigate();

    const rating = calculateRating(video.viewCount, video.likeCount);

    // Sync bookmarks with Firebase
    useEffect(() => {
        if (!currentUser) return;

        const unsubDoc = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
            setIsBookmarked(
                doc.data()?.bookmarks.some((item: any) => item.youtubeId === video.id || item.id === video.id)
            );
        });

        return () => unsubDoc();
    }, [currentUser, video.id]);

    const bookmarkedHandler = async () => {
        if (!currentUser) {
            toast.error("You need to sign in to bookmark content", { position: "top-right" });
            return;
        }

        const bookmarkItem = {
            poster_path: video.thumbnail,
            id: video.id,
            youtubeId: video.id,
            vote_average: rating,
            media_type: video.type === "movie" ? "movie" : "tv",
            title: video.title,
        };

        await updateDoc(doc(db, "users", currentUser.uid), {
            bookmarks: !isBookmarked
                ? arrayUnion(bookmarkItem)
                : arrayRemove(bookmarkItem),
        });

        toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
    };

    const formatViews = (views?: string) => {
        if (!views) return "0";
        const num = parseInt(views);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    const similarItems: Item[] = (similar || []).map(v => ({
        id: v.id as any,
        youtubeId: v.id,
        title: v.title,
        poster_path: v.thumbnail,
        backdrop_path: v.thumbnail,
        vote_average: 9.0,
        media_type: v.type === "movie" ? "movie" : "tv",
        overview: v.description,
        genre_ids: [],
        original_language: "en",
        popularity: 0,
        vote_count: 0
    }));

    return (
        <>
            <Title value={`${video.title} | StreamLux`} />
            <ToastContainer />

            {/* Mobile Header */}
            <div className="flex md:hidden justify-between items-center px-5 my-3 relative z-50">
                <button onClick={() => navigate(-1)} className="text-white">
                    <AiOutlineArrowLeft size={24} />
                </button>
                <Link to="/" className="flex gap-2 items-center">
                    <img src="/logo.svg" alt="StreamLux Logo" className="h-8 w-8" />
                </Link>
                <button onClick={() => setIsSidebarActive((prev) => !prev)}>
                    <GiHamburgerMenu size={25} />
                </button>
            </div>

            <div className="flex flex-col md:flex-row bg-dark min-h-screen text-white relative">
                {/* Desktop Back Button */}
                {!isMobile && (
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-20 z-50 bg-black/50 hover:bg-primary p-3 rounded-full backdrop-blur-md transition-all group"
                        title="Go Back"
                    >
                        <AiOutlineArrowLeft size={24} className="text-white group-hover:scale-110 transition-transform" />
                    </button>
                )}
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
                        <div className={`relative transition - all duration - 700 bg - black ${isPlaying ? 'h-[60vh] md:h-[85vh]' : 'h-[400px] md:h-[500px]'} `}>
                            {!isPlaying ? (
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
                                    style={{ backgroundImage: `url(${video.thumbnail})` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
                                </div>
                            ) : (
                                <div className="absolute inset-0">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                                        title={video.title}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div >
                            )}

                            {
                                !isPlaying && (
                                    <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-12">
                                        <div className="flex flex-col md:flex-row gap-8 items-end">
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
                                                    <span className="px-3 py-1 bg-primary/20 border border-primary/50 text-primary text-xs font-bold rounded-full uppercase tracking-widest">
                                                        YouTube Premium
                                                    </span>
                                                    <span className="px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-full">
                                                        4K UHD
                                                    </span>
                                                </div>
                                                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight max-w-[850px] drop-shadow-lg">
                                                    {video.title}
                                                </h1>

                                                {video.tags && (
                                                    <ul className="flex gap-3 flex-wrap mb-7">
                                                        {video.tags.slice(0, 3).map((tag) => (
                                                            <li key={tag}>
                                                                <div className="px-4 py-1.5 rounded-full uppercase text-[10px] font-bold border border-white/30 text-white backdrop-blur-md">
                                                                    {tag}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                <div className="flex flex-wrap gap-4 items-center">
                                                    <button
                                                        onClick={() => setIsPlaying(true)}
                                                        className="flex items-center gap-4 px-10 py-4 bg-primary hover:bg-primary-dark text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-xl shadow-primary/20"
                                                    >
                                                        <BsFillPlayFill size={30} />
                                                        WATCH NOW
                                                    </button>

                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={bookmarkedHandler}
                                                            className={`flex items-center justify-center h-12 w-12 rounded-full border-2 transition-all ${isBookmarked ? 'bg-primary border-primary text-white' : 'bg-white/10 border-white/30 text-white hover:border-primary hover:text-primary'}`}
                                                            title={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
                                                        >
                                                            <AiFillHeart size={22} />
                                                        </button>

                                                        {/* Download Button - Styled to be visible */}
                                                        <a
                                                            href={`https://ssyoutube.com/watch?v=${video.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-white/30 bg-white/10 hover:bg-primary hover:border-primary transition-all text-white"
                                                            title="Download Video"
                                                        >
                                                            <AiOutlineDownload size={22} />
                                                        </a>

                                                        <button
                                                            className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-white/30 bg-white/10 hover:bg-white/20 transition-all"
                                                            title="Share"
                                                        >
                                                            <BsShareFill size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div >

                        {/* DETAIL TABS SECTION */}
                        < div className="flex flex-col md:flex-row mt-32 md:mt-0" >
                            {/* RATING & DURATION COLUMN */}
                            {
                                !isMobile && (
                                    <div className="shrink-0 md:max-w-[150px] w-full flex items-center md:flex-col justify-center flex-row gap-20 mt-20 md:border-r border-white/5 pt-16">
                                        <div className="flex flex-col gap-6 items-center">
                                            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">RATING</p>
                                            <div className="w-16">
                                                <CircularProgressbar
                                                    value={rating}
                                                    maxValue={10}
                                                    text={`${rating}`}
                                                    styles={buildStyles({
                                                        textSize: "25px",
                                                        pathColor: `rgba(81, 121, 255, ${rating / 10})`,
                                                        textColor: "#fff",
                                                        trailColor: "transparent",
                                                        backgroundColor: "#5179ff",
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 items-center">
                                            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">RUNTIME</p>
                                            <div className="flex gap-1 items-baseline text-white/90">
                                                <p className="text-2xl font-bold">
                                                    {video.duration ? Math.floor(video.duration / 60) : "40+"}
                                                </p>
                                                <span className="text-xs font-bold uppercase opacity-60">min</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* TABBED CONTENT */}
                            <div className="flex-grow min-h-[600px] md:border-r border-white/5 md:px-16 px-6 md:py-12 pt-40">
                                <div className="flex gap-10 text-gray-400 text-lg justify-center mb-12 border-b border-white/5">
                                    {["overall", "creator", "reviews"].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setCurrentTab(tab)}
                                            className={`hover:text-white transition duration-300 pb-4 uppercase text-sm font-bold tracking-[0.2em] ${currentTab === tab ? "text-primary border-b-2 border-primary" : ""
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="max-max-w-[900px]">
                                    {currentTab === "overall" && (
                                        <>
                                            <p className="text-2xl italic mb-10 text-white/80 font-light text-center border-l-4 border-primary pl-6 py-2">
                                                "This official production from {video.channelTitle} is now available in high-definition on StreamLux."
                                            </p>
                                            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-primary">Story</h3>
                                            <div className="text-white/80 text-lg leading-relaxed font-light mb-12">
                                                <ReadMore limitTextLength={350}>{video.description}</ReadMore>
                                            </div>

                                            <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest text-primary">Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <h4 className="text-gray-500 text-[10px] font-bold uppercase mb-1">Status</h4>
                                                    <p className="text-white font-medium text-sm">Released</p>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <h4 className="text-gray-500 text-[10px] font-bold uppercase mb-1">Release Date</h4>
                                                    <p className="text-white font-medium text-sm">
                                                        {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : "N/A"}
                                                    </p>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <h4 className="text-gray-500 text-[10px] font-bold uppercase mb-1">Media Type</h4>
                                                    <p className="text-white font-medium text-sm uppercase">{video.type}</p>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <h4 className="text-gray-500 text-[10px] font-bold uppercase mb-1">Viewers</h4>
                                                    <p className="text-white font-medium text-sm">{formatViews(video.viewCount)}</p>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <h4 className="text-gray-500 text-[10px] font-bold uppercase mb-1">Language</h4>
                                                    <p className="text-white font-medium text-sm">English / International</p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {currentTab === "creator" && (
                                        <div className="flex flex-col items-center py-10">
                                            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary shadow-2xl mb-6">
                                                <span className="text-3xl font-bold text-white uppercase">{video.channelTitle[0]}</span>
                                            </div>
                                            <h2 className="text-3xl font-bold mb-2">{video.channelTitle}</h2>
                                            <p className="text-primary font-medium mb-8">Official Content Provider</p>
                                            <div className="bg-white/5 p-8 rounded-2xl border border-white/5 w-full text-center">
                                                <p className="text-white/70 italic">"Official studio partner providing high-quality streaming content for StreamLux."</p>
                                            </div>
                                        </div>
                                    )}

                                    {currentTab === "reviews" && (
                                        <div className="mt-4">
                                            {reviews && reviews.length > 0 ? (
                                                <ReviewTab reviews={reviews} />
                                            ) : (
                                                <div className="text-center py-20 opacity-50">
                                                    <p className="text-xl">No reviews yet for this content.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHTBAR FOR SIMILAR CONTENT */}
                            <div className="shrink-0 md:max-w-[310px] w-full relative px-6 md:mt-0 mt-12 bg-dark-lighten md:bg-transparent">
                                {!isMobile && <SearchBox />}
                                <RightbarFilms
                                    name="Similar Content"
                                    films={similarItems}
                                    limitNumber={6}
                                    isLoading={!similar}
                                    className="md:mt-24 mt-12 pt-6 md:pt-0"
                                />
                            </div>
                        </div >
                    </div >

                    <div className="px-6 md:px-16 mt-20">
                        <Footer />
                    </div>
                </div >
            </div >
        </>
    );
};

export default YouTubeDetail;
