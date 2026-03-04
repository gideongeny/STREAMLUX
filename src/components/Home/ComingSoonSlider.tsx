import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Item } from "../../shared/types";
import SectionSlider from "../Slider/SectionSlider";
import axios from "axios";

// Fetch only truly upcoming, unreleased movies from TMDB
const getComingSoonMovies = async (): Promise<Item[]> => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const [page1, page2] = await Promise.all([
            axios.get("/movie/upcoming", { params: { page: 1 } }).catch(() => ({ data: { results: [] } })),
            axios.get("/movie/upcoming", { params: { page: 2 } }).catch(() => ({ data: { results: [] } })),
        ]);

        const all: Item[] = [
            ...(page1.data.results || []),
            ...(page2.data.results || []),
        ].map((item: any) => ({
            ...item,
            media_type: "movie" as const,
            isComingSoon: true,
        }));

        // Strict filter: only future release dates
        const future = all.filter((item: any) => {
            const rd = item.release_date;
            return rd && rd > today && item.poster_path;
        });

        // Deduplicate
        const seen = new Set<number>();
        return future.filter(i => {
            if (seen.has(i.id)) return false;
            seen.add(i.id);
            return true;
        });
    } catch (error) {
        console.error("Error fetching coming soon movies:", error);
        return [];
    }
};

const ComingSoonSlider: FC = () => {
    const { data, isLoading } = useQuery(
        ["comingSoon"],
        getComingSoonMovies,
        { staleTime: 1000 * 60 * 30 } // 30 min cache
    );

    if (isLoading) {
        return (
            <div className="my-6">
                <div className="h-7 w-40 bg-white/5 rounded animate-pulse mb-4" />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex-shrink-0 w-32 h-48 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) return null;

    return (
        <SectionSlider
            title="🎬 Coming Soon"
            films={data}
        />
    );
};

export default ComingSoonSlider;
