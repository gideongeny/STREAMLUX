import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { AiOutlineRight } from "react-icons/ai";
import axios from "../../shared/axios";
import { Item } from "../../shared/types";

interface UpcomingCalendarProps {
    title?: string;
}

const UpcomingCalendar: FC<UpcomingCalendarProps> = ({ title = "Upcoming Calendar" }) => {
    const { data, isLoading } = useQuery(["upcoming-calendar"], async () => {
        // Fetch multiple pages of upcoming to ensure we have enough future items
        const [movieRes, tvRes] = await Promise.all([
            axios.get("/movie/upcoming", { params: { page: 1 } }),
            axios.get("/tv/on_the_air", { params: { page: 1 } })
        ]);

        const movies = movieRes.data.results.map((m: any) => ({ ...m, media_type: "movie" }));
        const tv = tvRes.data.results.map((t: any) => ({ ...t, media_type: "tv" }));

        const combined = [...movies, ...tv];
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 7); // Show items from the last 7 days + future

        // Filter for items released recently or in the future
        return combined.filter((item: any) => {
            const releaseDate = item.release_date || item.first_air_date;
            if (!releaseDate) return false;
            return new Date(releaseDate) >= dateLimit;
        }).sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date).getTime();
            const dateB = new Date(b.release_date || b.first_air_date).getTime();
            return dateA - dateB;
        }).map(item => ({
            ...item,
            title: item.title || item.name // Ensure TV names work
        })) as Item[];
    }, {
        staleTime: 3600000 // Cache for 1 hour
    });

    if (isLoading || !data) return null;

    // Function to generate a random "booked" count to mimic MovieBox style
    const getBookedCount = (id: number) => {
        const base = (id % 1000) * 15 + 1200;
        return base.toLocaleString();
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return { month: "TBA", day: "??" };
        const date = new Date(dateStr);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return {
            month: months[date.getMonth()],
            day: date.getDate(),
        };
    };

    return (
        <div className="mb-12">
            <h2 className="text-2xl text-white font-bold mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {title}
                </div>
                <Link to="/calendar" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                    View All <AiOutlineRight size={14} />
                </Link>
            </h2>
            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={20}
                slidesPerView="auto"
                className="upcoming-swiper"
            >
                {data.slice(0, 15).map((item) => {
                    const { month, day } = formatDate(item.release_date || "");
                    return (
                        <SwiperSlide key={item.id} style={{ width: "200px" }}>
                            <Link to={`/movie/${item.id}`} className="block group relative">
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/5 transition duration-300 group-hover:scale-105 group-hover:border-primary/50">
                                    <LazyLoadImage
                                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        effect="opacity"
                                    />

                                    {/* Date Badge (Left Top) */}
                                    <div className="absolute top-0 left-0 bg-primary/90 text-black px-2 py-1 flex flex-col items-center min-w-[45px] rounded-br-xl backdrop-blur-sm z-10">
                                        <span className="text-[10px] font-bold uppercase leading-tight">{month}</span>
                                        <span className="text-lg font-extrabold leading-tight">{day}</span>
                                    </div>

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                    {/* Booking Info (Bottom) */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-xs text-white/90 font-medium">
                                                {getBookedCount(item.id)} booked
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-gray-300 font-medium truncate group-hover:text-white transition">
                                    {item.title}
                                </p>
                            </Link>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default UpcomingCalendar;
