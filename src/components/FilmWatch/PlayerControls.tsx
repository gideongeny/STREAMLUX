import { FC, useState, useEffect } from 'react';
import { MdSpeed, MdSettings } from 'react-icons/md';

interface PlayerControlsProps {
    onSpeedChange: (speed: number) => void;
    className?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const PlayerControls: FC<PlayerControlsProps> = ({ onSpeedChange, className = '' }) => {
    const [currentSpeed, setCurrentSpeed] = useState(1);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Load saved speed preference
        const savedSpeed = localStorage.getItem('streamlux_playback_speed');
        if (savedSpeed) {
            const speed = parseFloat(savedSpeed);
            if (SPEEDS.includes(speed)) {
                setCurrentSpeed(speed);
                onSpeedChange(speed);
            }
        }
    }, [onSpeedChange]);

    const handleSpeedChange = (speed: number) => {
        setCurrentSpeed(speed);
        localStorage.setItem('streamlux_playback_speed', speed.toString());
        onSpeedChange(speed);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-lighten rounded-lg hover:bg-dark-lighten/80 transition-colors text-sm font-medium"
                title="Playback Speed"
            >
                <MdSpeed className="text-lg" />
                <span>{currentSpeed}x</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close menu */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute bottom-full mb-2 left-0 min-w-[120px] bg-dark-lighten border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                        <div className="px-3 py-2 border-b border-gray-700 text-xs font-semibold text-gray-400">
                            Playback Speed
                        </div>

                        <div className="flex flex-col">
                            {SPEEDS.map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex justify-between items-center ${currentSpeed === speed ? 'text-primary font-medium' : 'text-gray-200'
                                        }`}
                                >
                                    <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                    {currentSpeed === speed && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlayerControls;
