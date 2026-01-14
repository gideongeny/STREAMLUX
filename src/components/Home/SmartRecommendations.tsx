import { FC, useEffect, useState } from 'react';
import { Item } from '../../shared/types';
import { getSmartRecommendations } from '../../services/enhancedFeatures';
import { useWatchProgress } from '../../hooks/useWatchProgress';
import SectionSlider from '../Slider/SectionSlider';
import ErrorBoundary from '../Common/ErrorBoundary';

const SmartRecommendations: FC = () => {
    const [recommendations, setRecommendations] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { watchHistory } = useWatchProgress();

    useEffect(() => {
        let isMounted = true;
        const fetchRecommendations = async () => {
            try {
                setIsLoading(true);
                // Convert WatchProgress items to Item type for the service
                const items: Item[] = watchHistory.map(w => ({
                    id: w.mediaId,
                    title: w.title,
                    name: w.title,
                    media_type: w.mediaType,
                    poster_path: w.posterPath,
                    genre_ids: [], // We don't have this in history, but service handles it
                } as any));

                const results = await getSmartRecommendations(items, 15);
                if (isMounted) {
                    setRecommendations(results);
                }
            } catch (error) {
                console.error('Error fetching smart recommendations:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchRecommendations();
        return () => { isMounted = false; };
    }, [watchHistory]);

    if (!isLoading && recommendations.length === 0) return null;

    return (
        <ErrorBoundary fallback={null}>
            <div className="mt-8">
                <SectionSlider
                    title="✨ Because You Watched"
                    films={recommendations}
                    isLoading={isLoading}
                    limitNumber={15}
                />
            </div>
        </ErrorBoundary>
    );
};

export default SmartRecommendations;
