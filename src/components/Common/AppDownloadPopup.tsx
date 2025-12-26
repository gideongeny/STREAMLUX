
import { FC, useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineAndroid } from "react-icons/ai";

const AppDownloadPopup: FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the popup
        const hasDismissed = localStorage.getItem("app_popup_dismissed");

        // Show popup after 3 seconds (Fast for testing)
        // if (!hasDismissed) {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
        // }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        // Don't show again in this session (or persist longer if desired)
        localStorage.setItem("app_popup_dismissed", "true");
    };

    const handleDownload = () => {
        window.open("https://github.com/gideongeny/STREAMLUX/releases", "_blank");
        handleDismiss();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none p-4 pb-6">
            <div className="bg-[#1f2937] border border-primary/30 shadow-2xl rounded-2xl p-5 max-w-sm w-full animate-slide-up pointer-events-auto relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-600"></div>

                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                >
                    <AiOutlineClose size={20} />
                </button>

                <div className="flex flex-col items-center text-center mt-2">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <AiOutlineAndroid size={40} className="text-primary" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">Get the StreamLux App!</h3>

                    <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                        Avoid ads and enjoy a smoother streaming experience. Download our official Android app today!
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={handleDownload}
                            className="w-full py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <AiOutlineAndroid size={20} />
                            Download App
                        </button>

                        <button
                            onClick={handleDismiss}
                            className="w-full py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            No thanks, I'll stay here
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
        </div>
    );
};

export default AppDownloadPopup;
