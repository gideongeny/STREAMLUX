import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../shared/axios";
import SectionSlider from "../Slider/SectionSlider";
import { Item } from "../../shared/types";

interface Props {
  currentTab?: string;
}

const AwardWinners: FC<Props> = ({ currentTab = 'movie' }) => {
    const { data } = useQuery<Item[]>(
        ["awardWinners", currentTab],
        async () => {
            const res = await axios.get(`/discover/${currentTab}`, {
                params: {
                    sort_by: "vote_average.desc",
                    "vote_count.gte": 1000,
                    "vote_average.gte": 8.0,
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
            title="Award Winners & Masterpieces"
            films={data}
        />
    );
};

export default AwardWinners;
