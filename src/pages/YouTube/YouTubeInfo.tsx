import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useParams } from "react-router-dom";
import YouTubeDetail from "../../components/YouTube/YouTubeDetail";
import { getYouTubeVideoDetail, getRelatedVideos, getYouTubeComments, getYouTubeSeriesEpisodes, YouTubeVideo } from "../../services/youtube";
import Error from "../Error";

const YouTubeInfo: FC = () => {
    const { id } = useParams();

    const { data: video, isLoading: isVideoLoading, isError: isVideoError } = useQuery<YouTubeVideo | null, Error>(
        ["youtubeDetail", id],
        () => getYouTubeVideoDetail(id as string)
    );

    const { data: similar, isLoading: isSimilarLoading } = useQuery<YouTubeVideo[], Error>(
        ["relatedVideos", id],
        () => getRelatedVideos(id as string),
        { enabled: !!video }
    );

    const { data: reviews, isLoading: isReviewsLoading } = useQuery<any[], Error>(
        ["youtubeComments", id],
        () => getYouTubeComments(id as string),
        { enabled: !!video }
    );

    const { data: episodes, isLoading: isEpisodesLoading } = useQuery<YouTubeVideo[], Error>(
        ["youtubeEpisodes", id],
        () => getYouTubeSeriesEpisodes(video!.title, video!.channelId),
        { enabled: !!video && video.type === 'tv' }
    );

    if (isVideoError) return <Error />;
    if (isVideoLoading) return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Loading...</div>;
    if (!video) return <Error />;

    return <YouTubeDetail video={video} similar={similar} reviews={reviews} episodes={episodes} />;
};

export default YouTubeInfo;
