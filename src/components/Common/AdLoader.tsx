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

        if (!src && !adSlot) return;

        try {
            if (src) {
                // External Script Injection
                const script = document.createElement("script");
                script.src = src;
                script.async = true;
                script.crossOrigin = "anonymous";
                script.onload = () => {
                    console.log(`Ad script loaded: ${src}`);
                };
                script.onerror = () => {
                    console.warn(`Ad script failed to load: ${src}`);
                };
                document.body.appendChild(script);
                loadedRef.current = true;
            } else if (adSlot) {
                // Google AdSense Push
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    loadedRef.current = true;
                } catch (e) {
                    console.error("AdSense push error:", e);
                }
            }
        } catch (error) {
            console.warn("AdLoader error:", error);
        }
    }, [src, adSlot]);

    // If using generic script loader (src provided)
    if (src) {
        return <div ref={adRef} className={`hidden ${className}`} />;
    }

    // If using AdSense (adSlot provided)
    return (
        <div className={`ad-container my-4 flex justify-center ${className}`}>
            <ins className="adsbygoogle"
                style={{ display: "block" }}
<<<<<<< HEAD
                data-ad-client="ca-pub-1281448884303417"
=======
                data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // TODO: User needs to provide this or I'll use a placeholder
>>>>>>> 9b77a086ab01d9b3c8fe3e17c4883e897e62975f
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    );
};

export default AdLoader;
