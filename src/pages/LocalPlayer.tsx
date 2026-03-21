import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import StreamLuxPlayer from "../components/FilmWatch/StreamLuxPlayer";
import { MdArrowBack } from "react-icons/md";
import Title from "../components/Common/Title";

const LocalPlayer: FC = () => {
    const navigate = useNavigate();
    const { currentSource } = useAppSelector((state: any) => state.movie);
    const [sourceReady, setSourceReady] = useState(false);

    useEffect(() => {
        if (!currentSource) {
            navigate("/library", { replace: true });
        } else {
            setSourceReady(true);
        }
    }, [currentSource, navigate]);

    if (!sourceReady || !currentSource) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-black">
            <Title value="Watch Local Video | StreamLux" />
            
            {/* Top Bar Overlay */}
            <div className="absolute top-0 left-0 w-full p-4 z-50 bg-gradient-to-b from-black/80 to-transparent flex items-center">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition flex items-center gap-2 group"
                >
                    <MdArrowBack size={24} />
                    <span className="font-bold hidden group-hover:block uppercase tracking-wider text-xs">Back</span>
                </button>
            </div>

            {/* Video Player */}
            <div className="w-full h-full flex items-center justify-center">
                <StreamLuxPlayer
                    sources={[
                        {
                            name: "Local Offline",
                            url: currentSource,
                            quality: "Original",
                            type: "direct"
                        }
                    ]}
                    title="Local Video"
                    mediaType="movie"
                    onError={() => console.log("StreamLuxPlayer error on local file")}
                />
            </div>
        </div>
    );
};

export default LocalPlayer;
