import { addDoc, collection, orderBy, query, where } from "firebase/firestore";
import { FunctionComponent, useEffect, useState } from "react";
import { useCollectionQuery } from "../../../hooks/useCollectionQuery";
import { db } from "../../../shared/firebase";
import CommentUserData from "./CommentUserData";

interface ReplyProps {
  commendId: string;
}

const Reply: FunctionComponent<ReplyProps> = ({ commendId }) => {
  const [commentLimit, setCommentLimit] = useState(5);

  // Hide legacy auto replies; show only replies by current user to avoid old seeded data
  const {
    data: commentData,
    isLoading,
    isError,
  } = useCollectionQuery(
    commendId,
    query(collection(db, `replyTo-${commendId}`), where("user.uid", "==", "__only_current_user__"), orderBy("createdAt", "desc"))
  );

  // Remove legacy auto-reply seeding

  return (
    <>
      {commentData && commentData.size > 0 && (
        <div className="mt-5">
          <CommentUserData
            role="reply"
            isLoading={isLoading}
            isError={isError}
            sortType="latest"
            // @ts-ignore
            commentData={commentData}
            commentLimit={commentLimit}
            media_type="replyTo"
            id={commendId}
          />
        </div>
      )}
      {commentData && commentData.size > commentLimit && (
        <button
          className="font-medium mt-3"
          onClick={() => setCommentLimit((prev) => prev + 5)}
        >
          Load more replies ({commentLimit}/{commentData.size})
        </button>
      )}
    </>
  );
};

export default Reply;
