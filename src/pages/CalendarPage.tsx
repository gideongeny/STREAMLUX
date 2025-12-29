
import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "../shared/axios";
import { Item } from "../shared/types";
import Title from "../components/Common/Title";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { AiOutlineCalendar, AiOutlineRight } from "react-icons/ai";

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

    // Fetch airing today for the selected day (simplified for now using airing_today)
    const { data: airingToday, isLoading } = useQuery(["calendar-airing", selectedDay], async () => {
        // In a real app, we'd fetch specific dates, but for now we'll use trending/top shows to mimic a busy calendar
        const res = await axios.get("/tv/on_the_air", {
            params: { page: selectedDay + 1 }
        });
        return res.data.results as Item[];
    });

    return (
        <div className="min-h-screen bg-dark pt-20 pb-10 px-4 md:px-10 ml-0 md:ml-64">
            <Title value="TV Release Calendar | StreamLux" />

            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white flex items-center gap-3">
                            <AiOutlineCalendar className="text-primary" />
                            TV Series <span className="text-primary italic">Calendar</span>
                        </h1>
                        <p className="text-gray-400 mt-2">Never miss an episode. Stay updated with all major releases.</p>
                    </div>

                    <div className="flex bg-dark-lighten rounded-2xl p-1 border border-white/5 overflow-x-auto no-scrollbar">
                        {days.map((day, index) => (
                            <button
                                key={day.name}
                                onClick={() => setSelectedDay(index)}
                                className={`px-5 py-3 rounded-xl transition duration-300 font-bold whitespace-nowrap ${selectedDay === index
                                        ? "bg-primary text-black shadow-lg shadow-primary/20"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {day.name}
                            </button>
                        ))}
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-40 bg-dark-lighten rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-primary font-bold uppercase tracking-widest text-sm mb-4">
                            Hot Airing on {days[selectedDay].full}
                        </div>
                        {airingToday?.slice(0, 12).map((item) => (
                            <Link
                                key={item.id}
                                to={`/tv/${item.id}`}
                                className="flex items-center gap-4 bg-dark-lighten/40 p-3 rounded-3xl border border-white/5 hover:border-primary/30 transition hover:bg-dark-lighten/60 group shadow-lg"
                            >
                                <div className="w-24 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
                                    <LazyLoadImage
                                        src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                        className="w-full h-full object-cover"
                                        alt={item.name}
                                    />
                                </div>

                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded">DAILY</span>
                                        <span className="text-xs text-gray-400 font-medium">9:00 PM (GMT)</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition line-clamp-1">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1 italic">
                                        {item.overview || "New episode releasing today across all platforms."}
                                    </p>

                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex -space-x-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className={`w-6 h-6 rounded-full border border-dark bg-gray-${(i + 1) * 2}00 shadow-sm overflow-hidden`}>
                                                    <img src={`https://i.pravatar.cc/100?u=${item.id + i}`} alt="user" />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                            +{Math.floor(Math.random() * 500)} Watching
                                        </span>
                                    </div>
                                </div>

                                <div className="pr-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition">
                                        <AiOutlineRight className="text-gray-400 group-hover:text-black" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;
