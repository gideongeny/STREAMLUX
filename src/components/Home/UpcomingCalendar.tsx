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
import { getUpcomingFixturesAPI } from "../../services/sportsAPI";

interface UpcomingCalendarProps {
    title?: string;
    contentType?: "movie" | "tv" | "sports";
}

const UpcomingCalendar: FC<UpcomingCalendarProps> = ({
    title = "Upcoming Calendar",
    contentType = "movie"
}) => {
    const { data, isLoading } = useQuery(["upcoming-calendar", contentType], async () => {
        if (contentType === "sports") {
            const fixtures = await getUpcomingFixturesAPI();
            return fixtures.map(f => ({
                id: f.id as any,
                title: `${f.homeTeam} vs ${f.awayTeam}`,
                poster_path: f.homeTeamLogo || f.awayTeamLogo || "",
                release_date: f.kickoffTimeFormatted,
                media_type: "sports" as any,
                homeTeam: f.homeTeam,
                awayTeam: f.awayTeam,
                homeTeamLogo: f.homeTeamLogo,
                awayTeamLogo: f.awayTeamLogo,
                venue: f.venue,
                leagueId: f.leagueId
            })) as any[];
        }

        if (contentType === "movie") {
            const res = await axios.get("/movie/upcoming", { params: { page: 1 } });
            return res.data.results.map((m: any) => ({
                ...m,
                media_type: "movie",
                title: m.title
            })) as Item[];
        }

        if (contentType === "tv") {
            const res = await axios.get("/tv/on_the_air", { params: { page: 1 } });
            return res.data.results.map((t: any) => ({
                ...t,
                media_type: "tv",
                title: t.name
            })) as Item[];
        }

        return [] as Item[];
    }, {
        staleTime: 3600000 // Cache for 1 hour
    });

    if (isLoading || !data || data.length === 0) return null;

    // Function to generate a random "booked" count to mimic MovieBox style
    const getBookedCount = (id: string | number) => {
        const idNum = typeof id === 'number' ? id : (id.split('-').pop() || '0').length * 100;
        const base = (Number(idNum) % 1000) * 15 + 1200;
        return base.toLocaleString();
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return { month: "TBA", day: "??" };
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return { month: dateStr.split(' ')[0] || "TBA", day: dateStr.split(' ')[1] || "??" };
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return {
                month: months[date.getMonth()],
                day: date.getDate(),
            };
        } catch (e) {
            return { month: "TBA", day: "??" };
        }
    };

    return (
        <div className="mb-12">
            <h2 className="text-2xl text-white font-bold mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {title}
                </div>
                <Link to={contentType === "sports" ? "/sports" : `/calendar?type=${contentType}`} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
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
                {data.slice(0, 15).map((item: any) => {
                    const { month, day } = formatDate(item.release_date || "");
                    const linkTo = contentType === "sports"
                        ? `/sports/${item.leagueId}/${item.id}/watch`
                        : `/${item.media_type}/${item.id}`;

                    return (
                        <SwiperSlide key={item.id} style={{ width: "200px" }}>
                            <Link to={linkTo} className="block group relative">
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/5 transition duration-300 group-hover:scale-105 group-hover:border-primary/50 bg-gray-900">
                                    {item.poster_path ? (
                                        <LazyLoadImage
                                            src={item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            effect="opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 text-primary">
                                                <span className="text-3xl font-bold">{item.homeTeam?.[0] || 'S'}</span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-400">{item.title}</p>
                                        </div>
                                    )}

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
                                                {getBookedCount(item.id)} {contentType === "sports" ? "watching" : "booked"}
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
