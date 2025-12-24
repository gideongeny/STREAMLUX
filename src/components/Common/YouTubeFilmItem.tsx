import { FunctionComponent } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { YouTubeVideo } from "../../services/youtube";

interface YouTubeFilmItemProps {
    video: YouTubeVideo;
}

const YouTubeFilmItem: FunctionComponent<YouTubeFilmItemProps> = ({ video }) => {
    return (
        <Link
            to={`/youtube/${video.id}`}
            className="shadow-sm bg-dark-darken pb-2 rounded-md overflow-hidden hover:scale-105 hover:brightness-110 transition duration-300 relative group cursor-pointer block"
        >
            <div className="relative aspect-[2/3]">
                <LazyLoadImage
                    alt={video.title}
                    src={video.thumbnail}
                    className="w-full h-full object-cover absolute top-0 left-0"
                    effect="blur"
                    style={{ height: '100%', width: '100%', display: 'block' }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                <div className="bg-primary/80 px-2 py-0.5 rounded-full absolute top-[5%] left-[8%] z-20 flex items-center gap-1 text-white text-[10px]">
                    HD
                </div>
                {video.type && (
                    <div className="absolute top-2 right-2 bg-black/70 text-[10px] font-bold px-1.5 py-0.5 rounded text-primary uppercase">
                        {video.type}
                    </div>
                )}
            </div>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis text-sm text-gray-300 mt-2 text-center px-2 group-hover:text-white transition duration-300">
                {video.title}
            </p>
            <p className="text-[10px] text-gray-400 text-center px-2">
                {video.channelTitle}
            </p>
        </Link>
    );
};

export default YouTubeFilmItem;
