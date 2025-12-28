import { FC } from "react";

interface AdBannerProps {
    className?: string;
}

const AdBanner: FC<AdBannerProps> = ({ className = "" }) => {
    // This banner displays a visual ad and links to your sponsor/affiliate link
    // You can replace the image and link with your actual ad network content

    return (
        <a
            href="https://otieu.com/4/10378373"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex justify-center my-4 ${className}`}
        >
            <div className="w-full max-w-[728px] h-[90px] bg-[#1a1a1a] border border-[#333] rounded overflow-hidden relative group cursor-pointer hover:opacity-90 transition-opacity">
                {/* AD Badge */}
                <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 z-10">
                    AD
                </div>

                {/* Banner Image */}
                <img
                    src="/ad_banner.png"
                    alt="StreamLux Premium Sponsor"
                    className="w-full h-full object-cover"
                />
            </div>
        </a>
    );
};

export default AdBanner;
