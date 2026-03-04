import { FC, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "../shared/axios";
import { Item } from "../shared/types";
import Title from "../components/Common/Title";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { AiOutlineCalendar, AiOutlineRight } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import Sidebar from "../components/Common/Sidebar";
import Footer from "../components/Footer/Footer";
import { getUpcomingFixturesAPI } from "../services/sportsAPI";
import { useSearchParams } from "react-router-dom";
import { resizeImage } from "../shared/utils";

const CalendarPage: FC = () => {
    const days = [
        { name: "Mon", full: "Monday" },
        { name: "Tue", full: "Tuesday" },
        { name: "Wed", full: "Wednesday" },
        { name: "Thu", full: "Thursday" },
        { name: "Fri", full: "Friday" },
        { name: "Sat", full: "Saturday" },
        { name: "Sun", full: "Sunday" },
    ];

    const todayIndex = (new Date().getDay() + 6) % 7;
    const [selectedDay, setSelectedDay] = useState(todayIndex);
    const [isSidebarActive, setIsSidebarActive] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentType = searchParams.get("type") || "tv";

    // Fetch TV shows - Only show unreleased or upcoming episodes
    const { data: airingToday, isLoading: isLoadingTV } = useQuery(["calendar-airing", selectedDay], async () => {
        const { getFutureUpcoming } = await import("../services/home");
        const today = new Date().toISOString().split('T')[0];

        // Fetch multiple pages of upcoming TV shows
        const [page1Res, page2Res, page3Res, page4Res, page5Res, farRes] = await Promise.all([
            axios.get("/tv/on_the_air", { params: { page: 1 } }),
            axios.get("/tv/on_the_air", { params: { page: 2 } }),
            axios.get("/tv/on_the_air", { params: { page: 3 } }),
            axios.get("/tv/on_the_air", { params: { page: 4 } }),
            axios.get("/tv/on_the_air", { params: { page: 5 } }),
            getFutureUpcoming("tv")
        ]);

        const combined = [
            ...(page1Res.data.results || []),
            ...(page2Res.data.results || []),
            ...(page3Res.data.results || []),
            ...(page4Res.data.results || []),
            ...(page5Res.data.results || []),
            ...(farRes || [])
        ].filter(i => i && i.id);
        
        // Filter for shows that haven't finished airing (first_air_date > today or no end date)
        const upcoming = combined.filter((item) => {
            const firstAirDate = item.first_air_date;
            // Include shows that are currently airing or haven't started yet
            return !firstAirDate || firstAirDate >= today;
        });
        
        // Dedupe and sort
        const deduped = upcoming.filter((item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );
        
        return deduped.sort((a, b) => {
            const dateA = a.first_air_date || '';
            const dateB = b.first_air_date || '';
            return dateA.localeCompare(dateB);
        });
    }, { enabled: currentType === "tv" });

    // Fetch Movies upcoming - Organized by time periods (next month, next 3 months, next year, etc.)
    const { data: upcomingMovies, isLoading: isLoadingMovies } = useQuery(["calendar-movies"], async () => {
        const { getFutureUpcoming } = await import("../services/home");
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Calculate date ranges
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];
        
        const next3Months = new Date(today);
        next3Months.setMonth(next3Months.getMonth() + 3);
        const next3MonthsStr = next3Months.toISOString().split('T')[0];
        
        const nextYear = new Date(today);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const nextYearStr = nextYear.toISOString().split('T')[0];

        // Fetch upcoming movies from multiple pages and future content
        const [page1Res, page2Res, page3Res, page4Res, page5Res, farRes] = await Promise.all([
            axios.get("/movie/upcoming", { params: { page: 1 } }),
            axios.get("/movie/upcoming", { params: { page: 2 } }),
            axios.get("/movie/upcoming", { params: { page: 3 } }),
            axios.get("/movie/upcoming", { params: { page: 4 } }),
            axios.get("/movie/upcoming", { params: { page: 5 } }),
            getFutureUpcoming("movie")
        ]);

        const combined = [
            ...(page1Res.data.results || []),
            ...(page2Res.data.results || []),
            ...(page3Res.data.results || []),
            ...(page4Res.data.results || []),
            ...(page5Res.data.results || []),
            ...(farRes || [])
        ].filter(i => i && i.id);
        
        // Filter for unreleased movies only (release_date >= 2026 or coming soon)
        const currentYear = today.getFullYear();
        const unreleased = combined.filter((item) => {
            const releaseDate = item.release_date || item.first_air_date;
            if (!releaseDate) return false;
            // Only show movies from 2026 onwards or coming soon (within next 30 days)
            const releaseYear = parseInt(releaseDate.split('-')[0]);
            const releaseDateObj = new Date(releaseDate);
            const daysUntilRelease = Math.ceil((releaseDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Show if: year >= 2026 OR coming within 30 days
            return releaseYear >= 2026 || (daysUntilRelease > 0 && daysUntilRelease <= 30);
        });
        
        // Dedupe
        const deduped = unreleased.filter((item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );
        
        // Sort by release date and organize by time periods
        const sorted = deduped.sort((a, b) => {
            const dateA = a.release_date || a.first_air_date || '';
            const dateB = b.release_date || b.first_air_date || '';
            return dateA.localeCompare(dateB);
        });
        
        // Add time period metadata
        return sorted.map(item => ({
            ...item,
            timePeriod: (() => {
                const releaseDate = item.release_date || item.first_air_date || '';
                if (releaseDate <= nextMonthStr) return 'next-month';
                if (releaseDate <= next3MonthsStr) return 'next-3-months';
                if (releaseDate <= nextYearStr) return 'next-year';
                return 'beyond-year';
            })()
        }));
    }, { enabled: currentType === "movie" });

    // Fetch sports fixtures
    const { data: sportsFixtures, isLoading: isLoadingSports } = useQuery(["calendar-sports"], async () => {
        const fixtures = await getUpcomingFixturesAPI();
        return fixtures;
    }, { enabled: currentType === "sports" });

    const isLoading = currentType === "tv" ? isLoadingTV : (currentType === "movie" ? isLoadingMovies : isLoadingSports);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Title value="TV Release Calendar | StreamLux" />

            <div className="flex min-h-screen bg-dark">
                <Sidebar
                    onCloseSidebar={() => setIsSidebarActive(false)}
                    isSidebarActive={isSidebarActive}
                />

                <div className="flex-grow flex flex-col min-h-screen">
                    {/* Mobile Header */}
                    <div className="flex md:hidden justify-between items-center px-5 py-5 bg-dark/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
                        <Link to="/" className="flex gap-2 items-center">
                            <img src="/logo.svg" alt="StreamLux" className="h-8 w-8" />
                            <p className="text-lg text-white font-bold tracking-wider uppercase">
                                Stream<span className="text-primary font-black">Lux</span>
                            </p>
                        </Link>
                        <button onClick={() => setIsSidebarActive(true)}>
                            <GiHamburgerMenu size={25} className="text-white" />
                        </button>
                    </div>

                    <div className="flex-grow pt-8 md:pt-12 pb-10 px-4 md:px-10 max-w-7xl mx-auto w-full">
                        <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-3">
                                    <AiOutlineCalendar className="text-primary" />
                                    {currentType === "tv" ? "TV" : "Sports"} <span className="text-primary italic">Calendar</span>
                                </h1>
                                <p className="text-gray-400 mt-3 text-lg">
                                    {currentType === "tv"
                                        ? "Never miss an episode. Stay updated with all major releases."
                                        : "Stay updated with all upcoming sports tournaments and fixtures."}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex bg-dark-lighten rounded-2xl p-1.5 border border-white/5 shadow-2xl">
                                    <button
                                        onClick={() => setSearchParams({ type: "tv" })}
                                        className={`px-6 py-3 rounded-xl transition duration-300 font-bold ${currentType === "tv" ? "bg-primary text-black" : "text-gray-400 hover:text-white"}`}
                                    >
                                        TV Shows
                                    </button>
                                    <button
                                        onClick={() => setSearchParams({ type: "movie" })}
                                        className={`px-6 py-3 rounded-xl transition duration-300 font-bold ${currentType === "movie" ? "bg-primary text-black" : "text-gray-400 hover:text-white"}`}
                                    >
                                        Movies
                                    </button>
                                    <button
                                        onClick={() => setSearchParams({ type: "sports" })}
                                        className={`px-6 py-3 rounded-xl transition duration-300 font-bold ${currentType === "sports" ? "bg-primary text-black" : "text-gray-400 hover:text-white"}`}
                                    >
                                        Sports
                                    </button>
                                </div>

                                {currentType === "tv" && (
                                    <div className="flex bg-dark-lighten rounded-2xl p-1.5 border border-white/5 overflow-x-auto no-scrollbar shadow-2xl">
                                        {days.map((day, index) => (
                                            <button
                                                key={day.name}
                                                onClick={() => setSelectedDay(index)}
                                                className={`px-6 py-3 rounded-xl transition duration-300 font-bold whitespace-nowrap min-w-[70px] ${selectedDay === index
                                                    ? "bg-primary text-black shadow-lg shadow-primary/30"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                                    }`}
                                            >
                                                {day.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </header>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-32 bg-dark-lighten rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {currentType === "movie" ? (
                                    // Organize movies by time periods
                                    (() => {
                                        const nextMonth = upcomingMovies?.filter(m => m.timePeriod === 'next-month') || [];
                                        const next3Months = upcomingMovies?.filter(m => m.timePeriod === 'next-3-months') || [];
                                        const nextYear = upcomingMovies?.filter(m => m.timePeriod === 'next-year') || [];
                                        const beyond = upcomingMovies?.filter(m => m.timePeriod === 'beyond-year') || [];
                                        
                                        return (
                                            <>
                                                {nextMonth.length > 0 && (
                                                    <div>
                                                        <div className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4 flex items-center gap-2">
                                                            <div className="w-8 h-[2px] bg-primary" />
                                                            Coming This Month
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {nextMonth.map((item) => (
                                                                <Link
                                                                    key={item.id}
                                                                    to={`/movie/${item.id}`}
                                                                    className="flex items-center gap-4 bg-dark-lighten/30 p-4 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all duration-300 hover:bg-dark-lighten/50 group shadow-xl"
                                                                >
                                                                    <div className="w-20 h-28 md:w-24 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl transition duration-500 group-hover:scale-105">
                                                                        <LazyLoadImage
                                                                            src={resizeImage(item.poster_path, "w200")}
                                                                            className="w-full h-full object-cover"
                                                                            alt={item.title}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-black rounded uppercase tracking-wider border border-blue-500/20">Coming Soon</span>
                                                                            <span className="text-[10px] text-gray-500 font-bold uppercase">MOVIE</span>
                                                                        </div>
                                                                        <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                                                                            {item.title}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-400 mt-2 line-clamp-1 italic font-medium opacity-80">
                                                                            Release Date: {item.release_date || "Coming Soon"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="hidden md:block pr-4">
                                                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 shadow-lg">
                                                                            <AiOutlineRight size={20} className="text-gray-400 group-hover:text-black" />
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {next3Months.length > 0 && (
                                                    <div>
                                                        <div className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4 flex items-center gap-2">
                                                            <div className="w-8 h-[2px] bg-primary" />
                                                            Coming in Next 3 Months
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {next3Months.slice(0, 10).map((item) => (
                                                                <Link
                                                                    key={item.id}
                                                                    to={`/movie/${item.id}`}
                                                                    className="flex items-center gap-4 bg-dark-lighten/30 p-4 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all duration-300 hover:bg-dark-lighten/50 group shadow-xl"
                                                                >
                                                                    <div className="w-20 h-28 md:w-24 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl transition duration-500 group-hover:scale-105">
                                                                        <LazyLoadImage
                                                                            src={resizeImage(item.poster_path, "w200")}
                                                                            className="w-full h-full object-cover"
                                                                            alt={item.title}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-black rounded uppercase tracking-wider border border-blue-500/20">Coming Soon</span>
                                                                            <span className="text-[10px] text-gray-500 font-bold uppercase">MOVIE</span>
                                                                        </div>
                                                                        <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                                                                            {item.title}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-400 mt-2 line-clamp-1 italic font-medium opacity-80">
                                                                            Release Date: {item.release_date || "Coming Soon"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="hidden md:block pr-4">
                                                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 shadow-lg">
                                                                            <AiOutlineRight size={20} className="text-gray-400 group-hover:text-black" />
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {nextYear.length > 0 && (
                                                    <div>
                                                        <div className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4 flex items-center gap-2">
                                                            <div className="w-8 h-[2px] bg-primary" />
                                                            Coming This Year
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {nextYear.slice(0, 10).map((item) => (
                                                                <Link
                                                                    key={item.id}
                                                                    to={`/movie/${item.id}`}
                                                                    className="flex items-center gap-4 bg-dark-lighten/30 p-4 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all duration-300 hover:bg-dark-lighten/50 group shadow-xl"
                                                                >
                                                                    <div className="w-20 h-28 md:w-24 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl transition duration-500 group-hover:scale-105">
                                                                        <LazyLoadImage
                                                                            src={resizeImage(item.poster_path, "w200")}
                                                                            className="w-full h-full object-cover"
                                                                            alt={item.title}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-black rounded uppercase tracking-wider border border-blue-500/20">Coming Soon</span>
                                                                            <span className="text-[10px] text-gray-500 font-bold uppercase">MOVIE</span>
                                                                        </div>
                                                                        <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                                                                            {item.title}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-400 mt-2 line-clamp-1 italic font-medium opacity-80">
                                                                            Release Date: {item.release_date || "Coming Soon"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="hidden md:block pr-4">
                                                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 shadow-lg">
                                                                            <AiOutlineRight size={20} className="text-gray-400 group-hover:text-black" />
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {beyond.length > 0 && (
                                                    <div>
                                                        <div className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4 flex items-center gap-2">
                                                            <div className="w-8 h-[2px] bg-primary" />
                                                            Beyond This Year
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {beyond.slice(0, 10).map((item) => (
                                                                <Link
                                                                    key={item.id}
                                                                    to={`/movie/${item.id}`}
                                                                    className="flex items-center gap-4 bg-dark-lighten/30 p-4 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all duration-300 hover:bg-dark-lighten/50 group shadow-xl"
                                                                >
                                                                    <div className="w-20 h-28 md:w-24 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl transition duration-500 group-hover:scale-105">
                                                                        <LazyLoadImage
                                                                            src={resizeImage(item.poster_path, "w200")}
                                                                            className="w-full h-full object-cover"
                                                                            alt={item.title}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-black rounded uppercase tracking-wider border border-blue-500/20">Coming Soon</span>
                                                                            <span className="text-[10px] text-gray-500 font-bold uppercase">MOVIE</span>
                                                                        </div>
                                                                        <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                                                                            {item.title}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-400 mt-2 line-clamp-1 italic font-medium opacity-80">
                                                                            Release Date: {item.release_date || "Coming Soon"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="hidden md:block pr-4">
                                                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 shadow-lg">
                                                                            <AiOutlineRight size={20} className="text-gray-400 group-hover:text-black" />
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()
                                ) : currentType === "tv" ? (
                                    <>
                                        <div className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-2 flex items-center gap-2">
                                            <div className="w-8 h-[2px] bg-primary" />
                                            Upcoming TV Shows
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {airingToday?.slice(0, 20).map((item) => (
                                                <Link
                                                    key={item.id}
                                                    to={`/tv/${item.id}`}
                                                    className="flex items-center gap-4 bg-dark-lighten/30 p-4 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all duration-300 hover:bg-dark-lighten/50 group shadow-xl"
                                                >
                                                    <div className="w-20 h-28 md:w-24 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl transition duration-500 group-hover:scale-105">
                                                        <LazyLoadImage
                                                            src={resizeImage(item.poster_path, "w200")}
                                                            className="w-full h-full object-cover"
                                                            alt={item.name}
                                                        />
                                                    </div>

                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase tracking-wider border border-primary/20">Upcoming</span>
                                                            <span className="text-[10px] text-gray-500 font-bold uppercase">TV SHOW</span>
                                                        </div>
                                                        <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-400 mt-2 line-clamp-1 italic font-medium opacity-80">
                                                            First Air Date: {item.first_air_date || "Coming Soon"}
                                                        </p>
                                                    </div>

                                                    <div className="hidden md:block pr-4">
                                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 shadow-lg">
                                                            <AiOutlineRight size={20} className="text-gray-400 group-hover:text-black" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    sportsFixtures?.map((fixture) => (
                                        <Link
                                            key={fixture.id}
                                            to={`/sports/${fixture.leagueId}/${fixture.id}/watch`}
                                            className="flex items-center gap-4 bg-dark-lighten/30 p-4 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all duration-300 hover:bg-dark-lighten/50 group shadow-xl"
                                        >
                                            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-white/5 rounded-2xl flex items-center justify-center p-2 group-hover:bg-primary/5 transition">
                                                {fixture.homeTeamLogo ? (
                                                    <img src={fixture.homeTeamLogo} alt={fixture.homeTeam} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="text-3xl font-black text-primary/30">{fixture.homeTeam?.[0]}</div>
                                                )}
                                            </div>

                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black rounded uppercase tracking-wider border border-green-500/20">Upcoming</span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">{fixture.leagueId.toUpperCase()} Tournament</span>
                                                </div>
                                                <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                                                    {fixture.homeTeam} <span className="text-gray-600 text-lg mx-1 italic">vs</span> {fixture.awayTeam}
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-2 line-clamp-1 italic font-medium opacity-80">
                                                    Kick-off: {new Date(fixture.kickoffTimeFormatted).toLocaleString()} at {fixture.venue}
                                                </p>
                                            </div>

                                            <div className="hidden md:block pr-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 shadow-lg">
                                                    <AiOutlineRight size={20} className="text-gray-400 group-hover:text-black" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    );
};

export default CalendarPage;
