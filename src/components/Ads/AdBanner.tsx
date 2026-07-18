import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineClose, AiOutlineDownload } from 'react-icons/ai';

/**
 * AD IMPLEMENTATION GUIDE:
 * 
 * 1. ADSENSE (WEB):
 *    - Go to AdSense Dashboard > Ads > By ad unit.
 *    - Create a "Display Ad" unit.
 *    - Copy 'data-ad-client' (e.g. "ca-pub-1281448884303417")
 *    - Copy 'data-ad-slot' (e.g. "7723456789")
 *    - Paste them in the AD_SLOTS constant below.
 * 
 * 2. ADMOB (MOBILE APP):
 *    - Banner ads are handled automatically in App.tsx via initializeAdMob().
 *    - This component hides Web AdSense when running as an APK to avoid policy violations.
 */

interface AdBannerProps {
    position: 'home' | 'details' | 'watch';
    onClose?: () => void;
}

import { AdsterraBanner } from '../AdsterraBanner';
import { AdsterraNativeBanner } from '../AdsterraNativeBanner';
import { useAppSelector } from '../../store/hooks';

const AdBanner: React.FC<AdBannerProps> = ({ position, onClose }) => {
    const isPremium = useAppSelector((state) => state.auth.user?.isPremium);
    const [isVisible, setIsVisible] = React.useState(true);
    const [canClose, setCanClose] = React.useState(false);

    // If user is premium, dont even render the shell
    if (isPremium) return null;

    // Enable close button after 5 seconds to ensure visibility
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

    // REPLACE THESE WITH YOUR REAL SLOTS FROM ADSENSE DASHBOARD
    const AD_SLOTS = {
        home: "7723456789",    // Placeholder: Replace with real ID
        details: "8823456789", // Placeholder: Replace with real ID
        watch: "9923456789"    // Placeholder: Replace with real ID
    };

    return (
        <div className={`relative z-10 ${position === 'home' ? 'my-8 mx-auto max-w-6xl' : 'my-4'}`}>
            {/* Safe Adsterra Banners */}
            <AdsterraBanner adKey="0d2787e7f36132bedf358d9c4ae51329" width={468} height={60} />
            
            <div className="mb-4">
                <AdsterraNativeBanner />
            </div>

            {/* fallback / App Promo Banner (Always shown as a backup or in app) */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl overflow-hidden border border-white/5 shadow-2xl backdrop-blur-sm">
                {/* Close Button */}
                {canClose && (
                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all"
                        title="Close Ad"
                    >
                        <AiOutlineClose size={14} />
                    </button>
                )}

                <div className="flex flex-col md:flex-row items-center justify-between p-5 md:p-8 gap-6">
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                            <span className="bg-primary/20 text-primary px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                                Official App
                            </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">
                            STREAMLUX FOR ANDROID
                        </h3>
                        <p className="text-gray-400 text-sm max-w-md">
                            Tired of web ads? Download the official StreamLux app for a faster, cleaner, and <span className="text-primary font-bold">100% ad-free</span> experience.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <Link
                            to="/download"
                            className="group flex items-center gap-3 bg-white text-black font-extrabold py-3.5 px-8 rounded-full transition-all hover:bg-primary hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                        >
                            <AiOutlineDownload size={22} />
                            <span>DOWNLOAD AD-FREE</span>
                        </Link>
                        <a 
          href="https://omg10.com/4/10759068" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mt-2 text-center w-full rounded-full bg-white/10 px-4 py-2 text-[10px] sm:text-xs font-bold text-white hover:bg-white/20 transition-colors shadow-lg border border-white/5"
        >
          View Our Sponsors
        </a>                    </div>
                </div>

                {/* Loading Progress for Close Button */}
                {!canClose && (
                    <div className="absolute bottom-0 left-0 h-1 bg-primary/40 animate-[grow_5s_linear]" style={{ width: '100%' }}></div>
                )}
            </div>

            {!canClose && (
                <div className="text-center mt-2 text-[10px] text-gray-500 uppercase tracking-widest opacity-50">
                    Premium Content loading...
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes grow {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}} />
        </div>
    );
};

export default AdBanner;
