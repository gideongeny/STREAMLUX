import { FC, useEffect, useRef } from "react";

interface AdBannerProps {
    className?: string;
}

const AdBanner: FC<AdBannerProps> = ({ className = "" }) => {
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevent duplicate script injection
        if (bannerRef.current && bannerRef.current.childElementCount === 0) {

            // =========================================================================================
            // REAL AD NETWORK INTEGRATION:
            // To display actual banner ads from Monetag or PopAds:
            // 1. Go to your ad network dashboard
            // 2. Create a "Banner" ad zone (728x90 recommended size)
            // 3. Copy the script code they provide
            // 4. UNCOMMENT the lines below and paste your script
            // =========================================================================================

            /* 
            // Example for Monetag/PopAds Banner Script:
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            // PASTE YOUR BANNER SCRIPT URL HERE:
            script.src = "//pl123456.profitablegatecpm.com/xxx/yyy/banner.js"; 
            
            // Optional: Set data attributes if needed
            script.setAttribute("data-cfasync", "false");
            
            bannerRef.current.appendChild(script);
            */

            // Placeholder until you add your script
            if (!bannerRef.current.hasChildNodes()) {
                const placeholder = document.createElement("div");
                placeholder.className = "flex flex-col items-center justify-center h-full text-gray-400";
                placeholder.innerHTML = `
                    <span class="font-semibold mb-1">Ad Space Available</span>
                    <span class="text-xs">Paste your Monetag/PopAds banner script in AdBanner.tsx</span>
                `;
                bannerRef.current.appendChild(placeholder);
            }
        }
    }, []);

    return (
        <div className={`w-full flex justify-center my-4 ${className}`}>
            <div
                ref={bannerRef}
                className="w-full max-w-[728px] h-[90px] bg-[#1a1a1a] border border-[#333] rounded overflow-hidden relative"
            >
                {/* AD Badge */}
                <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 z-10">
                    AD
                </div>
            </div>
        </div>
    );
};

export default AdBanner;
