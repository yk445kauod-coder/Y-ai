
import React, { useEffect, useRef } from 'react';

declare var mermaid: any;

export const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      try {
        mermaid.contentLoaded();
        mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart).then(({ svg }: { svg: string }) => {
          if (ref.current) ref.current.innerHTML = svg;
        });
      } catch (e) {
        console.error("Mermaid rendering failed", e);
      }
    }
  }, [chart]);

  return <div className="mermaid flex justify-center bg-white/5 p-4 rounded-lg my-2 overflow-x-auto" ref={ref} />;
};
