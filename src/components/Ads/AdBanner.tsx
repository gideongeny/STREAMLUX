import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineClose, AiOutlineDownload } from 'react-icons/ai';

interface AdBannerProps {
    position: 'home' | 'details' | 'watch';
    onClose?: () => void;
}

const AdBanner: React.FC<AdBannerProps> = ({ position, onClose }) => {
    // Check if running in native app (no ads in APK) - MUST be before hooks
    const isNativeApp = React.useMemo(() => {
        if (typeof window === 'undefined') return false;
        return !!(window as any).Capacitor ||
            !!(window as any).cordova ||
            navigator.userAgent.includes('StreamLuxApp');
    }, []);

    const [isVisible, setIsVisible] = React.useState(true);
    const [canClose, setCanClose] = React.useState(false);

    // Don't show ads in native app - return early AFTER all hooks
    React.useEffect(() => {
        if (isNativeApp) {
            setIsVisible(false);
        }
    }, [isNativeApp]);

    // Enable close button after 5 seconds
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setCanClose(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        if (canClose) {
            setIsVisible(false);
            onClose?.();
        }
    };

    if (!isVisible) return null;

    // Different ad styles based on position
    const getAdStyle = () => {
        switch (position) {
            case 'home':
                return 'my-8 mx-auto max-w-6xl';
            case 'details':
                return 'my-6';
            case 'watch':
                return 'my-4';
            default:
                return 'my-6';
        }
    };

    return (
        <div className={`relative ${getAdStyle()}`}>
            {/* Ad Container - MovieBox Style */}
            <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl overflow-hidden border border-primary/30 shadow-lg">
                {/* Close Button */}
                {canClose && (
                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                        aria-label="Close ad"
                    >
                        <AiOutlineClose size={16} />
                    </button>
                )}

                {/* Ad Content */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                    {/* Left Side - Message */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                                Ad-Free Experience
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Download StreamLux App
                        </h3>
                        <p className="text-gray-300 text-sm md:text-base">
                            Enjoy unlimited streaming without ads. Get the best experience on Android!
                        </p>
                        <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                            <div className="flex items-center gap-2 text-green-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">No Ads</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Offline Downloads</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">HD Quality</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - CTA Button */}
                    <div className="flex-shrink-0">
                        <Link
                            to="/download"
                            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
                        >
                            <AiOutlineDownload size={24} className="group-hover:animate-bounce" />
                            <div className="text-left">
                                <div className="text-xs opacity-90">Download Now</div>
                                <div className="text-lg">StreamLux APK</div>
                            </div>
                        </Link>
                        <p className="text-center text-xs text-gray-400 mt-2">
                            Free • Android • 59MB
                        </p>
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="bg-black/40 px-6 py-2 text-center">
                    <p className="text-xs text-gray-400">
                        <span className="text-primary font-semibold">Limited Time:</span> Download the app and get ad-free streaming forever!
                    </p>
                </div>
            </div>

            {/* Timer Indicator */}
            {!canClose && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Ad closes in {5}s
                </div>
            )}
        </div>
    );
};

export default AdBanner;
