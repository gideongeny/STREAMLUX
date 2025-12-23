import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useParams } from "react-router-dom";
import YouTubeDetail from "../../components/YouTube/YouTubeDetail";
import { getYouTubeVideoDetail, YouTubeVideo } from "../../services/youtube";
import Error from "../Error";

const YouTubeInfo: FC = () => {
    const { id } = useParams();
    const { data, isLoading, isError } = useQuery<YouTubeVideo | null, Error>(
        ["youtubeDetail", id],
        () => getYouTubeVideoDetail(id as string)
    );

    if (isError) return <Error />;
    if (isLoading) return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Loading...</div>;
    if (!data) return <Error />;

    return <YouTubeDetail video={data} />;
};

export default YouTubeInfo;
