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

    // Fetch airing today for the selected day (simplified for now using airing_today)
    const { data: airingToday, isLoading } = useQuery(["calendar-airing", selectedDay], async () => {
        const res = await axios.get("/tv/on_the_air", {
            params: { page: selectedDay + 1 }
        });
        return res.data.results as Item[];
    });

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
                                    TV <span className="text-primary italic">Calendar</span>
                                </h1>
                                <p className="text-gray-400 mt-3 text-lg">Never miss an episode. Stay updated with all major releases.</p>
                            </div>

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
                                    Airing on {days[selectedDay].full}
                                </div>
                                {airingToday?.slice(0, 15).map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/tv/${item.id}`}
                                        className="flex items-center gap-4 bg-dark-lighten/30 p-4 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all duration-300 hover:bg-dark-lighten/50 group shadow-xl"
                                    >
                                        <div className="w-20 h-28 md:w-24 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl transition duration-500 group-hover:scale-105">
                                            <LazyLoadImage
                                                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                                className="w-full h-full object-cover"
                                                alt={item.name}
                                            />
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase tracking-wider border border-primary/20">Airing Today</span>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">HD QUALITY</span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-2 line-clamp-1 italic font-medium opacity-80">
                                                {item.overview || "New episode releasing today across all platforms worldwide."}
                                            </p>

                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="flex -space-x-2">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-dark bg-dark-lighten overflow-hidden shadow-lg">
                                                            <img src={`https://i.pravatar.cc/100?u=${item.id + i}`} alt="user" className="w-full h-full object-cover opacity-80" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                                                    +{300 + Math.floor(Math.random() * 700)} Fans
                                                </span>
                                            </div>
                                        </div>

                                        <div className="hidden md:block pr-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 shadow-lg">
                                                <AiOutlineRight size={20} className="text-gray-400 group-hover:text-black" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
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
