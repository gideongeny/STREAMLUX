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
            // INSTRUCTION FOR EARNING REVENUE:
            // 1. Sign up for PropellerAds or PopAds.
            // 2. Create a "Banner" ad zone (e.g., 728x90 or 468x60).
            // 3. They will give you a piece of code or a URL.
            // 4. UNCOMMENT the lines below and replace the 'src' with YOUR ad URL.
            // =========================================================================================

            /* 
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            // REPLACE THIS URL WITH YOUR ACTUAL AD NETWORK SCRIPT URL
            script.src = "//pl12345678.profitablegatecpm.com/abcd/123/456.js"; 
            
            bannerRef.current.appendChild(script);
            */

            // For now, we show a placeholder text until you add your code
            if (!bannerRef.current.hasChildNodes()) {
                const placeholder = document.createElement("div");
                placeholder.className = "flex flex-col items-center justify-center h-full text-gray-500";
                placeholder.innerHTML = `<span class="font-semibold text-gray-400">Ad Space</span><span class="text-xs mt-1">Add script in AdBanner.tsx to start earning</span>`;
                bannerRef.current.appendChild(placeholder);
            }
        }
    }, []);

    return (
        <div className={`w-full flex justify-center my-6 ${className}`}>
            <div
                ref={bannerRef}
                className="w-full max-w-[728px] min-h-[90px] bg-[#222] border border-[#333] rounded-lg overflow-hidden"
            >
            </div>
        </div>
    );
};

export default AdBanner;
