// THIS FILE CONTAINS 2 COMPONENT

import { FC, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Reviews } from "../../shared/types";
import { calculateTimePassed } from "../../shared/utils";
import StarRating from "../Common/StarRating";
import ReadMore from "../Common/ReadMore";
import { SortReview } from "./SortReview";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewTabProps {
  reviews: Reviews[];
}

interface ReviewContentProps {
  reviews: Reviews[];
  type: string;
}

const ReviewContent: FC<ReviewContentProps> = ({ reviews, type }) => {

  return (
    <ul
      // @ts-ignore: Unreachable code error

      className="flex flex-col gap-12 max-h-[400px] overflow-y-auto pr-4"
    >
      <AnimatePresence>
        {SortReview(reviews, type).map((review) => (
          <motion.li
            key={review.id} className="flex gap-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>
            <div className="shrink-0 max-w-[60px] w-full h-[60px]">
              <LazyLoadImage
                src="/me.jpg"
                alt="reviewer"
                effect="opacity"
                className="w-[60px] h-[60px] rounded-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <p className="text-white">{review.author}</p>
                <StarRating
                  mediaId={review.id}
                  mediaType="movie"
                  tmdbRating={review.author_details.rating || 0}
                  compact
                />
              </div>
              <ReadMore limitTextLength={150}>{review.content}</ReadMore>
              <p className="text-right text-base">
                {calculateTimePassed(new Date(review.created_at).getTime())}
              </p>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};

const ReviewTab: FC<ReviewTabProps> = ({ reviews }) => {
  const [reviewSortType, setReviewSortType] = useState("desc");

  return (
    <>
      <div className="flex gap-4 items-center justify-end -mt-5 mb-10">
        <p className="text-white/70 text-sm">Sort Rating: </p>
        <div className="relative">
          <select
            className="outline-none bg-dark-lighten px-4 py-2 rounded-xl text-white appearance-none cursor-pointer border border-white/5 hover:border-white/20 transition-all focus:ring-2 focus:ring-primary/50 pr-10 text-sm font-medium"
            value={reviewSortType}
            onChange={(e) => setReviewSortType(e.target.value)}
          >
            <option className="bg-dark" value="asc">
              Ascending
            </option>
            <option className="bg-dark" value="desc">
              Descending
            </option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <div>
        {reviews.length === 0 && (
          <p className="text-center text-white text-lg">
            There is no reviews yet.
          </p>
        )}
        {reviews.length > 0 && (
          <ReviewContent reviews={reviews} type={reviewSortType} />
        )}
      </div>
    </>
  );
};

export default ReviewTab;
