import React, { useEffect, useState } from 'react';
import { SHOT_VISUAL_DURATION_MS } from '../constants';

interface WaterStreamProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  firedAt: number; // Timestamp when the shot was fired, for animation timing
}

const WaterStream: React.FC<WaterStreamProps> = ({ startX, startY, endX, endY, firedAt }) => {
  const [distance, setDistance] = useState(0);
  const [angle, setAngle] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const dx = endX - startX;
    const dy = endY - startY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    // atan2 gives radians, convert to degrees
    const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;

    setDistance(currentDistance);
    setAngle(currentAngle);

    // Stream appears instantly, then fades out quickly
    const fadeOutDelay = SHOT_VISUAL_DURATION_MS / 5; // Slightly quicker fade start for more liquid feel
    const timeoutId = setTimeout(() => {
      setOpacity(0);
    }, fadeOutDelay);

    return () => clearTimeout(timeoutId);
  }, [startX, startY, endX, endY, firedAt]);

  // If opacity is 0, component is effectively hidden and can be removed by parent
  if (opacity === 0) return null;

  return (
    <div
      className="absolute bg-white rounded-full opacity-80" // Reduced opacity for more liquid feel
      style={{
        left: startX,
        top: startY,
        width: distance,
        height: '10px', // Reduced thickness of the stream for more liquid feel
        transformOrigin: '0 50%',
        transform: `rotate(${angle}deg)`,
        opacity: opacity,
        transition: `opacity ${SHOT_VISUAL_DURATION_MS - (SHOT_VISUAL_DURATION_MS / 5)}ms ease-out`,
        zIndex: 90,
        pointerEvents: 'none',
        boxShadow: '0 0 6px 2px rgba(255,255,255,0.7)', // Softer, more subtle glow
      }}
      aria-hidden="true"
    />
  );
};

export default WaterStream;