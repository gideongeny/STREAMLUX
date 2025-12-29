import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import axios from "../../shared/axios";
import { Item } from "../../shared/types";

const UpcomingCalendar: FC = () => {
    const { data, isLoading } = useQuery(["upcoming-calendar"], async () => {
        const res = await axios.get("/movie/upcoming");
        return res.data.results as Item[];
    });

    if (isLoading || !data) return null;

    // Function to generate a random "booked" count to mimic MovieBox style
    const getBookedCount = (id: number) => {
        const base = (id % 1000) * 10 + 500;
        return base.toLocaleString();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return {
            month: months[date.getMonth()],
            day: date.getDate(),
        };
    };

    return (
        <div className="mb-12">
            <h2 className="text-2xl text-white font-bold mb-6 flex items-center gap-2">
                Upcoming Calendar
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
