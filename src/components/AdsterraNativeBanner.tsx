import React, { useRef, useEffect } from 'react';

export const AdsterraNativeBanner: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
              </style>
            </head>
            <body>
              <div id="container-b063603efcc5badc778b8fdac0c4f369"></div>
              <script async="async" data-cfasync="false" src="https://pl29728094.effectivecpmnetwork.com/b063603efcc5badc778b8fdac0c4f369/invoke.js"></script>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-6">
      <iframe
        ref={iframeRef}
        width="100%"
        height="250"
        frameBorder="0"
        scrolling="no"
        style={{ border: 'none', overflow: 'hidden', maxWidth: '728px' }}
        title="adsterra-native"
      />
    </div>
  );
};
