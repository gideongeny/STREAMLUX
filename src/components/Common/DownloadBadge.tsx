import { FC } from 'react';
import { FaDownload } from 'react-icons/fa';

interface DownloadBadgeProps {
    count?: number;
}

const DownloadBadge: FC<DownloadBadgeProps> = ({ count = 1 }) => {
    return (
        <div className="absolute top-2 right-2 z-10">
            <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                <FaDownload size={10} />
                <span>DL</span>
                {count > 1 && <span className="ml-0.5">×{count}</span>}
            </div>
        </div>
    );
};

export default DownloadBadge;
