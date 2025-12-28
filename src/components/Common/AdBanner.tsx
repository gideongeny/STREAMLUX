import { FC, useEffect, useRef } from "react";

interface AdBannerProps {
    className?: string;
}

const AdBanner: FC<AdBannerProps> = ({ className = "" }) => {
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!bannerRef.current || bannerRef.current.childElementCount > 0) return;

        // =========================================================================================
        // MONETAG/POPADS BANNER AD INTEGRATION
        // To display rotating banner ads from your ad network:
        // 1. Go to Monetag or PopAds dashboard
        // 2. Create a "Banner Ad" zone (728x90 recommended)
        // 3. Copy the script they provide
        // 4. UNCOMMENT and paste your script below
        // The ads will automatically rotate as configured in your ad network dashboard
        // =========================================================================================

        /* EXAMPLE - UNCOMMENT AND REPLACE WITH YOUR BANNER SCRIPT:
        
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        // PASTE YOUR BANNER AD SCRIPT URL HERE:
        script.src = "//www.highperformanceformat.com/xxxxx/invoke.js";
        bannerRef.current.appendChild(script);
        
        // OR if using inline script code:
        const inlineScript = document.createElement("script");
        inlineScript.type = "text/javascript";
        inlineScript.innerHTML = `
            atOptions = {
                'key' : 'YOUR_KEY_HERE',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
            };
        `;
        bannerRef.current.appendChild(inlineScript);
        
        const invokeScript = document.createElement("script");
        invokeScript.type = "text/javascript";
        invokeScript.src = "//www.highperformanceformat.com/xxxxx/invoke.js";
        bannerRef.current.appendChild(invokeScript);
        */

        // Fallback: Show placeholder if no ad script is active
        const placeholder = document.createElement("div");
        placeholder.className = "flex items-center justify-center h-full text-gray-400 text-sm";
        placeholder.innerHTML = `
            <div class="text-center">
                <div class="font-semibold mb-1">🎯 Ad Space Ready</div>
                <div class="text-xs">Paste your Monetag/PopAds banner script in AdBanner.tsx (line 28-54)</div>
            </div>
        `;
        bannerRef.current.appendChild(placeholder);
    }, []);

    return (
        <div className={`w-full flex justify-center my-4 ${className}`}>
            <div className="w-full max-w-[728px] min-h-[90px] bg-[#1a1a1a] border border-[#333] rounded overflow-hidden relative">
                {/* AD Badge */}
                <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 z-10">
                    AD
                </div>

                {/* Ad network scripts will inject here */}
                <div ref={bannerRef} className="w-full h-full min-h-[90px]" />
            </div>
        </div>
    );
};

export default AdBanner;
