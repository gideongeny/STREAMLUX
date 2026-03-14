import { FunctionComponent } from "react";
import { Item, ItemsPage } from "../../shared/types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import InfiniteScroll from "react-infinite-scroll-component";
import FilmItem from "../Common/FilmItem";
import LazySection from "../Common/LazySection";
import Skeleton from "../Common/Skeleton";

interface ExploreResultContentProps {
  data: ItemsPage[] | undefined;
  fetchNext: () => void;
  hasMore: boolean | undefined;
  currentTab?: "movie" | "tv";
}

const ExploreResultContent: FunctionComponent<ExploreResultContentProps> = ({
  data,
  fetchNext,
  hasMore,
  currentTab,
}) => {
  // Filter by media_type if currentTab is specified
  const allItems = data?.reduce(
    (acc: Item[], current: ItemsPage) => [...acc, ...current.results],
    [] as Item[]
  ) || [];
  
  const filteredItems = currentTab 
    ? allItems.filter((item) => item.media_type === currentTab)
    : allItems;
  
  return (
    <>
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center mb-12">
          <LazyLoadImage
            src="/error.png"
            alt=""
            effect="opacity"
            className="w-[600px]"
          />
          <p className="text-white text-3xl mt-5">There is no such films</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={data?.length || 0}
          next={() => fetchNext()}
          hasMore={!!hasMore}
          loader={<div>Loading...</div>}
          endMessage={<></>}
        >
          <div className="space-y-10 pt-2 px-2">
            {/* 
                VIRTUALIZATION LOGIC: 
                We split the results into chunks (e.g., 20 items per chunk).
                Each chunk is wrapped in a LazySection.
                This ensures that off-screen items are not kept in memory/DOM.
            */}
            {(() => {
              const chunkSize = 20;
              const chunks = [];
              for (let i = 0; i < filteredItems.length; i += chunkSize) {
                chunks.push(filteredItems.slice(i, i + chunkSize));
              }

              return chunks.map((chunk, chunkIndex) => (
                <LazySection 
                  key={`chunk-${chunkIndex}`} 
                  placeholderHeight={chunkIndex === 0 ? 0 : 800} // First chunk loads immediately
                  threshold={0.01}
                  rootMargin="600px 0px" // Load ahead
                >
                  <ul className="grid grid-cols-sm lg:grid-cols-lg gap-x-8 gap-y-10">
                    {chunk.map((item) => (
                      <li key={item.id}>
                        <FilmItem item={item} />
                      </li>
                    ))}
                  </ul>
                </LazySection>
              ));
            })()}

            {!data &&
              [...new Array(15)].map((_, index) => (
                <li key={index}>
                  <Skeleton className="h-0 pb-[160%]" />
                </li>
              ))}
          </div>
        </InfiniteScroll>
      )}
    </>
  );
};

export default ExploreResultContent;
