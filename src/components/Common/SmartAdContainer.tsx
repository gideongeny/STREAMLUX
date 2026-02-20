import { FC, useEffect, useState, useRef } from 'react';

interface SmartAdContainerProps {
  position: 'banner' | 'sidebar' | 'inline' | 'footer' | 'toast';
  className?: string;
  minViewTime?: number;
}

const SmartAdContainer: FC<SmartAdContainerProps> = ({
  position,
  className = '',
  minViewTime = 120000, // 2 minutes before showing ads (non-intrusive)
}) => {
  const [showAd, setShowAd] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const timer = setTimeout(() => setShowAd(true), minViewTime);
    timerRef.current = timer;
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [minViewTime]);

  // Push to AdSense when ready
  useEffect(() => {
    if (!showAd) return;
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) { /* AdSense not available */ }
  }, [showAd]);

  // Don't render anything until minimum view time has passed
  if (!showAd) return null;

  // Sidebar gets a fixed-size rectangle
  if (position === 'sidebar') {
    return (
      <div className={className}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '300px', height: '250px' }}
          data-ad-client="ca-pub-1281448884303417"
          data-ad-slot="1234567890"
          data-ad-format="rectangle"
        />
      </div>
    );
  }

  // Inline content ad
  if (position === 'inline') {
    return (
      <div className={className}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-1281448884303417"
          data-ad-slot="5566778899"
          data-ad-format="fluid"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Banner / footer
  if (position === 'banner' || position === 'footer') {
    return (
      <div className={className}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-1281448884303417"
          data-ad-slot={position === 'banner' ? '9876543210' : '1122334455'}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Toast and other positions — don't render
  return null;
};

export default SmartAdContainer;
