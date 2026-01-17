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

    // Fetch TV airing today for the selected day (Improved to include far future)
    const { data: airingToday, isLoading: isLoadingTV } = useQuery(["calendar-airing", selectedDay], async () => {
        const { getFutureUpcoming } = await import("../services/home");

        const res = await axios.get("/tv/on_the_air", {
            params: { page: selectedDay + 1 }
        });
        const farRes = await getFutureUpcoming("tv");

        const combined = [...(res.data.results as Item[] || []), ...(farRes || [])].filter(i => i && i.id);
        return combined.filter((item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );
    }, { enabled: currentType === "tv" });

    // Fetch Movies upcoming - Only show unreleased movies (release_date > today)
    const { data: upcomingMovies, isLoading: isLoadingMovies } = useQuery(["calendar-movies"], async () => {
        const { getFutureUpcoming } = await import("../services/home");
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // Fetch both "near" upcoming and "far" future
        const nearRes = await axios.get("/movie/upcoming", { params: { page: 1 } });
        const farRes = await getFutureUpcoming("movie");

        const combined = [...(nearRes.data.results || []), ...(farRes || [])].filter(i => i && i.id);
        
        // Filter for unreleased movies only (release_date > today)
        const unreleased = combined.filter((item) => {
            const releaseDate = item.release_date || item.first_air_date;
            return releaseDate && releaseDate > today;
        });
        
        // Dedupe
        return unreleased.filter((item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );
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
                            <div className="grid grid-cols-1 gap-4">
                                <div className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-2 flex items-center gap-2">
                                    <div className="w-8 h-[2px] bg-primary" />
                                    {currentType === "tv" ? `Airing on ${days[selectedDay].full}` : "Upcoming Tournaments & Matches"}
                                </div>
                                {currentType === "tv" ? (
                                    airingToday?.slice(0, 15).map((item) => (
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
                                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase tracking-wider border border-primary/20">Airing Today</span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">TV SHOW</span>
                                                </div>
                                                <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-2 line-clamp-1 italic font-medium opacity-80">
                                                    {item.overview || "New episode releasing today across all platforms worldwide."}
                                                </p>
                                            </div>

                                            <div className="hidden md:block pr-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 shadow-lg">
                                                    <AiOutlineRight size={20} className="text-gray-400 group-hover:text-black" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : currentType === "movie" ? (
                                    upcomingMovies?.map((item) => (
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
                                    ))
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
