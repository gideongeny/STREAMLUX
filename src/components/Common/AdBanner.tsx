import { FC, useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";

interface AdBannerProps {
    className?: string;
}

const AdBanner: FC<AdBannerProps> = ({ className = "" }) => {
    const isPremium = useAppSelector((state) => state.auth.user?.isPremium);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // If premium, don't even start the timer
        if (isPremium) return;
        
        const timer = setTimeout(() => setVisible(true), 3000); // 3 second delay
        return () => clearTimeout(timer);
    }, [isPremium]);

    if (!visible || isPremium) return null;

    return (
        <a
            href="https://otieu.com/4/10378373"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex justify-center my-4 animate-fade-in ${className}`}
        >
            <div className="w-full max-w-[728px] h-[90px] bg-[#1a1a1a] border border-[#333] rounded overflow-hidden relative group cursor-pointer hover:opacity-90 transition-opacity">
                {/* AD Badge */}
                <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 z-10">
                    AD
                </div>

                {/* Banner Image */}
                <img
                    src="/ad_banner.png"
                    alt="StreamLux Premium"
                    className="w-full h-full object-cover"
                />
            </div>
        </a>
    );
};

export default AdBanner;
