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

  // Inject ad scripts when container is ready
  useEffect(() => {
    if (!shouldShow) return;

    // Monetag ad script - only load once
    if (position === 'banner' || position === 'sidebar') {
      const monetagExists = document.querySelector('script[src*="alwingulla.com"]');
      if (!monetagExists && (window as any).monetagScriptLoaded !== true) {
        const script = document.createElement('script');
        script.src = 'https://alwingulla.com/88/5a/6a/885a6a2dae1be8778f654f595085d68d.js';
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.onload = () => {
          (window as any).monetagScriptLoaded = true;
        };
        document.head.appendChild(script);
      }
    }

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
    const containerId = `container-e306b4e28d4fba3151a0a85384de410f-${position}`;
    
    switch (position) {
      case 'banner':
        return (
          <div className={`${adClass} h-[90px] md:h-[250px]`}>
            {/* Astrella container */}
            <div id={containerId} className="w-full h-full"></div>
            {/* HighPerformanceFormat iframe ad */}
            <div id={`at-${position}-${Date.now()}`} className="w-full h-full flex items-center justify-center"></div>
          </div>
        );
      case 'sidebar':
        return (
          <div className={`${adClass} h-[300px] md:h-[600px]`}>
            {/* Astrella container */}
            <div id={containerId} className="w-full h-full"></div>
            {/* HighPerformanceFormat iframe ad */}
            <div id={`at-${position}-${Date.now()}`} className="w-full h-full flex items-center justify-center"></div>
          </div>
        );
      case 'inline':
        return (
          <div className={`${adClass} h-[250px] my-8`}>
            {/* Astrella container */}
            <div id={containerId} className="w-full h-full"></div>
            {/* HighPerformanceFormat iframe ad */}
            <div id={`at-${position}-${Date.now()}`} className="w-full h-full flex items-center justify-center"></div>
          </div>
        );
      case 'footer':
        return (
          <div className={`${adClass} h-[100px]`}>
            {/* Astrella container */}
            <div id={containerId} className="w-full h-full"></div>
            {/* HighPerformanceFormat iframe ad */}
            <div id={`at-${position}-${Date.now()}`} className="w-full h-full flex items-center justify-center"></div>
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
