import { FC, useEffect, useState } from "react";
import { getRecommendations } from "../../services/home";
import { Item } from "../../shared/types";
import SectionSlider from "../Slider/SectionSlider";
import { useWatchProgress } from "../../hooks/useWatchProgress";

const BecauseYouWatched: FC = () => {
    const { watchHistory } = useWatchProgress();
    const [recommendations, setRecommendations] = useState<Item[]>([]);
    const [sourceItem, setSourceItem] = useState<{ title: string } | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            // Get most recent item
            if (watchHistory.length === 0) return;

            const lastWatched = watchHistory[0];
            setSourceItem({ title: lastWatched.title });

            const data = await getRecommendations(lastWatched.mediaType, lastWatched.mediaId);
            setRecommendations(data.slice(0, 20)); // Limit to 20
        };

        fetchRecommendations();
    }, [watchHistory]);

    if (recommendations.length === 0 || !sourceItem) return null;

    return (
        <SectionSlider
            title={`Because you watched ${sourceItem.title}`}
            films={recommendations}
        />
    );
};

export default BecauseYouWatched;
