import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNewReleases } from "../../services/home";
import SectionSlider from "../Slider/SectionSlider";

const NewReleases: FC = () => {
    const { data, isLoading } = useQuery(
        ["newReleases"],
        async () => {
            const [movies, tv] = await Promise.all([
                getNewReleases("movie"),
                getNewReleases("tv")
            ]);
            // Interleave simple strategy: Movie, TV, Movie, TV
            const combined = [];
            const maxLength = Math.max(movies.length, tv.length);
            for (let i = 0; i < maxLength; i++) {
                if (movies[i]) combined.push(movies[i]);
                if (tv[i]) combined.push(tv[i]);
            }
            return combined;
        },
        {
            staleTime: 1000 * 60 * 60, // 1 hour
        }
    );

    if (!data || data.length === 0) return null;

    return (
        <SectionSlider
            title="Fresh Releases"
            films={data}
        />
    );
};

export default NewReleases;
