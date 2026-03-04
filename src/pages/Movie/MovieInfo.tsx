import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useParams } from "react-router-dom";
import FilmDetail from "../../components/FilmDetail/FilmDetail";
import SEO from "../../components/Common/SEO";
import { getMovieFullDetail } from "../../services/movie";
import { DetailMovie, DetailTV, FilmInfo } from "../../shared/types";
import { useTranslation } from "react-i18next";
import Error from "../Error";

const MovieInfo: FC = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const { data, isError, isLoading } = useQuery<FilmInfo, Error>(["movieDetail", id, i18n.language], () =>
    getMovieFullDetail(Number(id as string))
  );

  // if (isError) return <div>ERROR: {error.message}</div>;
  if (isError) return <Error />;
  if (isLoading || !data) return null;

  return (
    <>
      <SEO
        title={(data?.detail as DetailMovie)?.title}
        description={data?.detail?.overview}
        image={data?.detail?.poster_path ? `https://image.tmdb.org/t/p/w500${data?.detail?.poster_path}` : undefined}
      />
      <FilmDetail {...data} />
    </>
  );
};

export default MovieInfo;
