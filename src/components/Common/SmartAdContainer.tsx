import { FC, useEffect, useState, useRef } from 'react';

interface SmartAdContainerProps {
  position: 'banner' | 'sidebar' | 'inline' | 'footer' | 'toast';
  className?: string;
  minViewTime?: number;
}

const SmartAdContainer: FC<SmartAdContainerProps> = ({
  position,
  className = '',
  minViewTime = 10000, // 10 seconds before showing ads (easier for testing)
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

  const Fallback = () => (
    <div className={`relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-6 text-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-1 w-12 rounded-full bg-primary/20" />
        <p className="text-xs font-black uppercase tracking-widest text-white/40">Premium Experience</p>
        <h4 className="text-sm font-bold text-white">Enjoying StreamLux?</h4>
        <p className="max-w-[200px] text-[10px] text-gray-500">Download our mobile app for an even faster and ad-free cinematic experience.</p>
        <a href="/download" className="mt-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold text-white hover:bg-white/20 transition-colors">
          Get the App
        </a>
      </div>
    </div>
  );

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
  return <Fallback />;
};

export default SmartAdContainer;
