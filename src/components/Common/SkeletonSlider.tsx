import { FC } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import SkeletonCard from "./SkeletonCard";

interface SkeletonSliderProps {
    slides?: number;
}

const SkeletonSlider: FC<SkeletonSliderProps> = ({ slides = 8 }) => {
    return (
        <div className="relative">
            <Swiper
                slidesPerView="auto"
                spaceBetween={30}
                className="!w-[calc(100vw-8vw-2px)] !py-2"
            >
                {new Array(slides).fill("").map((_, index) => (
                    <SwiperSlide key={index} className="!w-[175px]">
                        <SkeletonCard />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default SkeletonSlider;
