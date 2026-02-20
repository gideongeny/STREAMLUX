import { FC, useState, useEffect } from "react";

interface AdBannerProps {
    className?: string;
}

const AdBanner: FC<AdBannerProps> = ({ className = "" }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 3000); // 3 second delay
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return <div className="h-[90px] w-full" />;

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
