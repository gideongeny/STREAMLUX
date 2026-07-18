import { FC, HTMLProps } from "react";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: FC<HTMLProps<HTMLDivElement> & SkeletonProps> = ({
  className,
  children,
  ...others
}) => {
  return (
    <div
      className={`${className} overflow-hidden relative bg-dark-lighten rounded-md before:content-[''] before:absolute before:inset-0 before:tw-shimmer`}
      {...others}
    >
      {children}
    </div>
  );
};

export default Skeleton;
