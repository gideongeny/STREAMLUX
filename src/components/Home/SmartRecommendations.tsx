import { FC, useEffect, useState } from 'react';
import { Item } from '../../shared/types';
import { getSmartRecommendations } from '../../services/enhancedFeatures';
import SectionSlider from '../Slider/SectionSlider';
import ErrorBoundary from '../Common/ErrorBoundary';
import { useAppSelector } from '../../store/hooks';

const SmartRecommendations: FC = () => {
    const [recommendations, setRecommendations] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        let isMounted = true;
        const fetchRecommendations = async () => {
            try {
                setIsLoading(true);
                
                // Get history from currentUser.recentlyWatch
                const historyItems: Item[] = (currentUser as any)?.recentlyWatch || [];
                
                if (historyItems.length === 0) {
                    if (isMounted) {
                        setRecommendations([]);
                        setIsLoading(false);
                    }
                    return;
                }

                const results = await getSmartRecommendations(historyItems, 15);
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
    }, [currentUser]);

    if (!isLoading && recommendations.length === 0) return null;

    return (
        <ErrorBoundary fallback={null}>
            <div className="mt-8">
                <SectionSlider
                    title="Because You Watched"
                    films={recommendations}
                    isLoading={isLoading}
                    limitNumber={15}
                />
            </div>
        </ErrorBoundary>
    );
};

export default SmartRecommendations;
