import { FC, useEffect, useState, useRef } from 'react';

interface SmartAdContainerProps {
  position: 'banner' | 'sidebar' | 'inline' | 'footer';
  className?: string;
  minViewTime?: number; // Minimum time user must be on page before showing ad
  respectUserFocus?: boolean; // Only show when user is actively viewing
}

const SmartAdContainer: FC<SmartAdContainerProps> = ({
  position,
  className = '',
  minViewTime = 5000, // 5 seconds default
  respectUserFocus = true,
}) => {
  const [showAd, setShowAd] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Wait for minimum view time before showing ad
    const timer = setTimeout(() => {
      setShowAd(true);
    }, minViewTime);

    timerRef.current = timer;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [minViewTime]);

  useEffect(() => {
    if (!respectUserFocus || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    // Also check if user is actively viewing the page
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [respectUserFocus]);

  // Don't show ad if user is not actively viewing
  const shouldShow = showAd && (!respectUserFocus || isVisible || !document.hidden);

  if (!shouldShow) {
    return null;
  }

  // Render appropriate ad based on position
  const renderAd = () => {
    switch (position) {
      case 'banner':
        return (
          <div className="w-full h-[90px] md:h-[250px] bg-dark-lighten rounded-lg flex items-center justify-center border border-gray-800">
            <div className="text-gray-500 text-sm">Advertisement</div>
            {/* Ad script will be injected here */}
          </div>
        );
      case 'sidebar':
        return (
          <div className="w-full h-[600px] bg-dark-lighten rounded-lg flex items-center justify-center border border-gray-800">
            <div className="text-gray-500 text-sm">Advertisement</div>
          </div>
        );
      case 'inline':
        return (
          <div className="w-full h-[250px] bg-dark-lighten rounded-lg flex items-center justify-center border border-gray-800 my-8">
            <div className="text-gray-500 text-sm">Advertisement</div>
          </div>
        );
      case 'footer':
        return (
          <div className="w-full h-[100px] bg-dark-lighten rounded-lg flex items-center justify-center border border-gray-800">
            <div className="text-gray-500 text-sm">Advertisement</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className={className}>
      {renderAd()}
    </div>
  );
};

export default SmartAdContainer;
