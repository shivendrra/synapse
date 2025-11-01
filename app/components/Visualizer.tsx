

import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // FIX: Explicitly initialize useRef with null to ensure it's always called with one argument.
  const animationFrameRef = useRef<number | null>(null);
  // The ref type must include `null` because React calls the ref callback with `null` when the component unmounts.
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const barCount = 24;

  useEffect(() => {
    const animate = () => {
      barsRef.current.forEach(bar => {
        if (bar) {
          const newHeight = Math.random() * 0.9 + 0.1;
          bar.style.transform = `scaleY(${newHeight})`;
        }
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animate();
    } else {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      barsRef.current.forEach(bar => {
        if (bar) {
          bar.style.transform = 'scaleY(0.1)';
        }
      });
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div ref={containerRef} className="flex items-end justify-center w-full h-full gap-1">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          // FIX: The ref callback function must not return a value. 
          // An arrow function with a body `() => expression` returns the expression.
          // By wrapping the assignment in curly braces `() => { expression }`, we ensure it returns `undefined`.
          ref={el => { barsRef.current[i] = el; }}
          className="w-full bg-brand-500 rounded-full"
          style={{ height: '100%', transform: 'scaleY(0.1)', transition: 'transform 0.1s ease-out' }}
        />
      ))}
    </div>
  );
};

export default Visualizer;