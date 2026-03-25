import { FC, useEffect, useRef } from "react";

interface AdLoaderProps {
    src?: string;
    adSlot?: string;
    className?: string;
}

// Global window extension for ad objects
declare global {
    interface Window {
        adsbygoogle?: any[];
    }
}

const AdLoader: FC<AdLoaderProps> = ({ src, adSlot, className = "" }) => {
    const adRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        // Prevent double loading
        if (loadedRef.current) return;

        // Only proceed if adSlot is provided for AdSense
        if (!adSlot) return;

        try {
            // Google AdSense Push
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            loadedRef.current = true;
        } catch (error) {
            console.warn("AdLoader error:", error);
        }
    }, [adSlot]);

    // If using generic script loader (src provided) - DISABLED for safety
    if (src) {
        return null;
    }

    // If using AdSense unit
    return (
        <div className={`ad-container my-4 flex justify-center ${className}`}>
            <ins className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-1281448884303417"
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    );
};

export default AdLoader;
