import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import FilmDetail from "../../components/FilmDetail/FilmDetail";
import SEO from "../../components/Common/SEO";
import { getTVFullDetail } from "../../services/tv";
import { DetailTV, FilmInfo } from "../../shared/types";
import { useTranslation } from "react-i18next";
import { MdTv, MdSearch, MdHome } from "react-icons/md";
import { motion } from "framer-motion";
import AdBanner from "../../components/Ads/AdBanner";

const TVInfo: FC = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();

  const { data, isError, isLoading } = useQuery<FilmInfo, Error>(
    ["tvDetail", id, i18n.language],
    () => getTVFullDetail(id as string)
  );

  if (isError) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <MdTv size={80} className="mx-auto mb-6 text-primary opacity-60" />
          <h1 className="text-4xl font-bold text-white mb-3">Show Not Available</h1>
          <p className="text-gray-400 text-lg mb-8">
            This TV show isn't available right now. It may not yet be indexed or may be region-restricted.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/search"
              className="flex items-center gap-2 bg-primary px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition"
            >
              <MdSearch size={20} />
              Search Shows
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 bg-white/10 border border-white/20 px-6 py-3 rounded-xl text-white font-semibold hover:bg-white/20 transition"
            >
              <MdHome size={20} />
              Go Home
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-8">
            ID: {id} · Try searching or explore our global TV library.
          </p>
        </motion.div>
      </div>
    );
  }

  if (isLoading || !data) return null;

  return (
    <>
      <SEO
        title={(data?.detail as DetailTV)?.name}
        description={data?.detail?.overview}
        image={data?.detail?.poster_path ? `https://image.tmdb.org/t/p/w500${data?.detail?.poster_path}` : undefined}
      />
      <div className="pt-20">
        <AdBanner position="details" />
      </div>
      <FilmDetail {...data} />
    </>
  );
};

export default TVInfo;

