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
        <a
            href="https://otieu.com/4/10378373"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex justify-center my-4 ${className}`}
        >
            <div
                ref={bannerRef}
                className="w-full max-w-[728px] h-[90px] bg-[#222] border border-[#333] rounded overflow-hidden relative group cursor-pointer hover:opacity-90 transition-opacity"
            >
                {/* AD Badge (MovieBox Style) */}
                <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 z-10">
                    AD
                </div>

                {/* Visual Content - Real Image */}
                <img
                    src="/ad_banner.png"
                    alt="StreamLux Premium"
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
            </div>
        </a>
    );
};

export default AdBanner;
