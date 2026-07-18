import React, { useRef, useEffect } from 'react';

interface AdsterraBannerProps {
  adKey: string;
  width: number;
  height: number;
}

export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ adKey, width, height }) => {
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
              <script type="text/javascript">
                atOptions = {
                  'key' : '${adKey}',
                  'format' : 'iframe',
                  'height' : ${height},
                  'width' : ${width},
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [adKey, width, height]);

  return (
    <div className="w-full flex justify-center my-4 overflow-hidden">
      <iframe
        ref={iframeRef}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        style={{ border: 'none', overflow: 'hidden' }}
        title={`ad-${adKey}`}
      />
    </div>
  );
};
