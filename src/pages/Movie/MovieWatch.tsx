import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import FilmWatch from "../../components/FilmWatch/FilmWatch";
import { getWatchMovie } from "../../services/movie";
import { getWatchReturnedType, DetailMovie } from "../../shared/types";
import Error from "../Error";
import { hasDownloads, enrichWithDownloads } from "../../services/hybridContent";

const MovieWatch: FC = () => {
  const { id } = useParams();

  const { data, error, isLoading } = useQuery<getWatchReturnedType, Error>(
    ["watchMovie", id],
    () => getWatchMovie(Number(id as string)),
    { refetchOnWindowFocus: false }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark text-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) return <Error />;

  if (!data) return <Error />;

  const currentMovieDetail = data.detail as DetailMovie;
  const movieTitle = currentMovieDetail?.title || "";

  return (
    <>
      <FilmWatch
        {...data}
        media_type="movie"
      />

      {/* Alternative Sources / Downloads */}
      {currentMovieDetail && movieTitle && hasDownloads(movieTitle) && (
        <div className="mt-6 mb-8 bg-dark-lighten rounded-xl p-4 border border-gray-800 mx-4 md:mx-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <h3 className="text-white font-medium">Alternative Sources Available</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(enrichWithDownloads([currentMovieDetail] as any[])[0] as any)?.downloads?.map((dl: any, idx: number) => (
              <a
                key={idx}
                href={dl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-dark-darken hover:bg-primary/20 hover:border-primary border border-gray-700 rounded-lg p-3 transition duration-300 group"
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium group-hover:text-primary transition-colors">{dl.source}</span>
                  <span className="text-xs text-gray-400">{dl.quality || 'HD'} • Direct Link</span>
                </div>
                <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MovieWatch;
