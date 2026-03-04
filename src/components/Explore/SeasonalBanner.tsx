import React from 'react';

interface SeasonalBannerProps {
    onSelectCategory: (category: string) => void;
}

const SeasonalBanner: React.FC<SeasonalBannerProps> = ({ onSelectCategory }) => {
    const seasons = [
        { id: 'trending', label: '🔥 Trending Now', query: 'trending movies 2024' },
        { id: 'holiday', label: '🎄 Holiday Specials', query: 'christmas movies' },
        { id: 'action', label: '💥 High Octane Action', query: 'action movies 2024' },
        { id: 'horror', label: '👻 Spooky Season', query: 'horror movies' },
        { id: 'kids', label: '🎈 Family & Kids', query: 'animated family movies' }
    ];

    return (
        <div className="mb-10 overflow-x-auto pb-4 no-scrollbar">
            <div className="flex gap-4 min-w-max">
                {seasons.map((season) => (
                    <button
                        key={season.id}
                        onClick={() => onSelectCategory(season.id)}
                        className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-full hover:border-primary/50 hover:bg-primary/5 transition-all text-gray-300 hover:text-primary whitespace-nowrap flex items-center gap-2"
                    >
                        {season.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SeasonalBanner;
