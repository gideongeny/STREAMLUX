import { FC } from "react";
import Skeleton from "./Skeleton";

const SkeletonCard: FC = () => {
    return (
        <div className="flex flex-col gap-3">
            {/* Poster Skeleton */}
            <Skeleton className="w-full aspect-[2/3] rounded-md" />

            {/* Title Skeleton */}
            <div className="flex justify-center px-1">
                <Skeleton className="h-4 w-3/4 rounded" />
            </div>
        </div>
    );
};

export default SkeletonCard;
