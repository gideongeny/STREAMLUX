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
                star={Math.round(review.author_details.rating / 2)}
                maxStar={5}
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
      <div className="flex gap-4 justify-end -mt-5 mb-10">
        <p>Sort Rating: </p>
        <select
          className="outline-none bg-inherit"
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
