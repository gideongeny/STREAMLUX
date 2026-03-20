import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineClose, AiOutlineDownload } from 'react-icons/ai';

interface AdBannerProps {
    position: 'home' | 'details' | 'watch';
    onClose?: () => void;
}

// AdSense Unit Component
const GoogleAdUnit: React.FC<{ slot: string; format?: string }> = ({ slot, format = "auto" }) => {
    React.useEffect(() => {
        try {
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, [slot]);

    return (
        <div className="adsbygoogle-container my-4 overflow-hidden rounded-lg bg-black/20 flex justify-center">
            <ins
                className="adsbygoogle"
                style={{ display: "block", minWidth: "250px", minHeight: "100px" }}
                data-ad-client="ca-pub-1281448884303417"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
};

const AdBanner: React.FC<AdBannerProps> = ({ position, onClose }) => {
    // Check if running in native app (no ads in APK)
    const isNativeApp = React.useMemo(() => {
        if (typeof window === 'undefined') return false;
        return !!(window as any).Capacitor ||
            !!(window as any).cordova ||
            navigator.userAgent.includes('StreamLuxApp');
    }, []);

    const [isVisible, setIsVisible] = React.useState(true);
    const [canClose, setCanClose] = React.useState(false);

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

    // Ad Slots
    const AD_SLOTS = {
        home: "7723456789",
        details: "8823456789",
        watch: "9923456789"
    };

    return (
        <div className={`relative ${position === 'home' ? 'my-8 mx-auto max-w-6xl' : 'my-4'}`}>
            {/* Real Ad Unit (if not native) */}
            {!isNativeApp && (
                <div className="mb-4">
                    <GoogleAdUnit slot={AD_SLOTS[position]} />
                </div>
            )}

            {/* Premium Download Banner */}
            <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl overflow-hidden border border-primary/30 shadow-lg">
                {/* Close Button */}
                {canClose && (
                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                    >
                        <AiOutlineClose size={16} />
                    </button>
                )}

                <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                                StreamLux Premium
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Switch to StreamLux App for Zero Ads
                        </h3>
                        <p className="text-gray-400 text-sm">
                            The web version contains ads to keep the service free. Get the App for a 100% ad-free experience!
                        </p>
                    </div>

                    <Link
                        to="/download"
                        className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-black font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                    >
                        <AiOutlineDownload size={20} />
                        <span>Get App (Ad-Free)</span>
                    </Link>
                </div>
            </div>

            {!canClose && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                    Ad closes in few seconds...
                </div>
            )}
        </div>
    );
};

export default AdBanner;
