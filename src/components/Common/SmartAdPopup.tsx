import { FC, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

const SmartAdPopup: FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [adData, setAdData] = useState({
        title: "StreamLux Premium",
        description: "Experience ad-free streaming, 4K quality, and offline downloads!",
        image: "/premium_promo.png",
        link: "https://otieu.com/4/10378373", // Example high-yielding ad link
    });

    useEffect(() => {
        // Frequency capping: Max 2 times per session
        const adCount = parseInt(sessionStorage.getItem("smart_ad_count") || "0");

        if (adCount < 2) {
            // Delay first appearance
            const timer = setTimeout(() => {
                setIsVisible(true);
                sessionStorage.setItem("smart_ad_count", (adCount + 1).toString());
            }, 10000); // Appear after 10 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                    <IoClose size={24} />
                </button>

                {/* Ad Content */}
                <div className="flex flex-col">
                    <div className="relative aspect-[16/9] w-full bg-dark-lighten">
                        <img
                            src={adData.image}
                            alt={adData.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1469&auto=format&fit=crop";
                            }}
                        />
                        <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">
                            AD
                        </div>
                    </div>

                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">{adData.title}</h2>
                        <p className="text-gray-400 mb-6">{adData.description}</p>

                        <div className="flex flex-col gap-3">
                            <a
                                href={adData.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsVisible(false)}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Learn More
                            </a>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartAdPopup;
