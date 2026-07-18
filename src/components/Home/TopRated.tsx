import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../shared/axios";
import SectionSlider from "../Slider/SectionSlider";
import { Item } from "../../shared/types";

interface Props {
  currentTab?: string;
}

const TopRated: FC<Props> = ({ currentTab = 'movie' }) => {
    const { data } = useQuery<Item[]>(
        ["topRated", currentTab],
        async () => {
            const res = await axios.get(`/${currentTab}/top_rated`, {
                params: {
                    page: 1,
                }
            });
            return res.data.results.map((item: any) => ({
                ...item,
                media_type: currentTab
            }));
        },
        { staleTime: 1000 * 60 * 60 } // 1 hour
    );

    if (!data || data.length === 0) return null;

    return (
        <SectionSlider
            title="All-Time Top Rated"
            films={data}
        />
    );
};

export default TopRated;
