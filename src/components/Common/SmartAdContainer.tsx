import { FC, useEffect, useState, useRef } from 'react';
import AdLoader from './AdLoader';

interface SmartAdContainerProps {
  position: 'banner' | 'sidebar' | 'inline' | 'footer' | 'toast';
  className?: string;
  minViewTime?: number; // Minimum time user must be on page before showing ad
  respectUserFocus?: boolean; // Only show when user is actively viewing
}

const SmartAdContainer: FC<SmartAdContainerProps> = ({
  position,
  className = '',
  minViewTime = 30000, // Reduced from 2 hours to 30 seconds
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

  // Inject ad scripts when container is ready
  useEffect(() => {
    if (!shouldShow) return;

    // Monetag ad script REMOVED due to user complaints about redirects

    // Popup scripts removed due to aggressive behavior

    // Ensure Astrella container exists for invoke script
    if (containerRef.current) {
      const containerId = `container-e306b4e28d4fba3151a0a85384de410f-${position}`;
      const existingContainer = document.getElementById('container-e306b4e28d4fba3151a0a85384de410f');
      if (!existingContainer) {
        const container = containerRef.current.querySelector(`#${containerId}`);
        if (container) {
          // Container is already in the DOM from renderAd
        }
      }
    }
  }, [shouldShow, position]);

  // Render appropriate ad based on position
  const renderAd = () => {
    const adClass = "w-full bg-dark-lighten rounded-lg border border-gray-800 overflow-hidden";

    switch (position) {
      case 'banner':
        return (
          <div className={`${adClass} min-h-[90px] flex items-center justify-center`}>
            <AdLoader adSlot="9876543210" className="w-full" />
          </div>
        );
      case 'sidebar':
        return (
          <div className={`${adClass} min-h-[300px] flex items-center justify-center`}>
            <AdLoader adSlot="1234567890" className="w-full" />
          </div>
        );
      case 'inline':
        return (
          <div className={`${adClass} min-h-[250px] my-8 flex items-center justify-center`}>
            <AdLoader adSlot="5566778899" className="w-full" />
          </div>
        );
      case 'footer':
        return (
          <div className={`${adClass} min-h-[100px] flex items-center justify-center`}>
            <AdLoader adSlot="1122334455" className="w-full" />
          </div>
        );
      case 'toast':
        return (
          <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-dark-lighten rounded-lg border border-gray-800 shadow-2xl overflow-hidden relative w-[320px] h-[250px] flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAd(false);
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 z-20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 z-10">
                AD
              </div>
              <AdLoader adSlot="0099887766" className="w-full" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Don't show ad if user is not actively viewing
  if (!shouldShow) {
    return null;
  }

  return (
    <div ref={containerRef} className={className}>
      {renderAd()}
    </div>
  );
};

export default SmartAdContainer;
