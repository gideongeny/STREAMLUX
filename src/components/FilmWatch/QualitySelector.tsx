import { FC, useState, useEffect } from "react";
import { MdHighQuality } from "react-icons/md";

interface QualitySelectorProps {
    currentQuality: string | null;
    onQualityChange: (quality: string) => void;
    className?: string;
}

const QUALITIES = ["Auto", "1080p", "720p", "480p", "360p"];

const QualitySelector: FC<QualitySelectorProps> = ({
    currentQuality,
    onQualityChange,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState("Auto");

    useEffect(() => {
        if (currentQuality) {
            // If currentQuality matches one of our options, highlight it.
            // But we store "Auto" as preference, so this might be just for display.
            // Actually, let's track the USER PREFERENCE here.
            // The parent passes the *active* quality? Or the preferred one?
            // Let's assume parent passes preferred quality.
            setSelectedQuality(currentQuality || "Auto");
        }
    }, [currentQuality]);

    const handleSelect = (quality: string) => {
        setSelectedQuality(quality);
        onQualityChange(quality);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg hover:bg-primary/80 transition-colors text-sm font-bold border border-white/10"
                title="Video Quality"
            >
                <MdHighQuality className="text-lg text-primary group-hover:text-white" />
                <span>{selectedQuality}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full mb-2 left-0 min-w-[100px] bg-dark-lighten border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                        <div className="px-3 py-2 border-b border-gray-700 text-xs font-semibold text-gray-400">
                            Quality
                        </div>
                        <div className="flex flex-col">
                            {QUALITIES.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => handleSelect(q)}
                                    className={`px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex justify-between items-center ${selectedQuality === q ? "text-primary font-medium" : "text-gray-200"
                                        }`}
                                >
                                    <span>{q}</span>
                                    {selectedQuality === q && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default QualitySelector;
