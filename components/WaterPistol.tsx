import React from 'react';
import { Shot } from '../types';
import { SHOT_VISUAL_DURATION_MS } from '../constants';
import WaterStream from './WaterStream';

interface WaterEffectsProps {
  shots: Shot[];
  waterSourceOriginX: number;
  waterSourceOriginY: number;
}

const WaterEffects: React.FC<WaterEffectsProps> = ({ shots, waterSourceOriginX, waterSourceOriginY }) => {
  return (
    <>
      {shots.map((shot) => (
        <React.Fragment key={shot.id}>
          {/* Water Stream */}
          <WaterStream
            startX={waterSourceOriginX}
            startY={waterSourceOriginY}
            endX={shot.x}
            endY={shot.y}
            firedAt={shot.firedAt}
          />
          {/* Water Splash */}
          <div
            className="absolute bg-white rounded-full opacity-70 animate-water-splash"
            style={{
              left: shot.x - 10, // Center the splash effect (half of 20px)
              top: shot.y - 10,
              width: 20, // Increased splash size
              height: 20, // Increased splash size
              transition: `opacity ${SHOT_VISUAL_DURATION_MS}ms ease-out`,
              opacity: Date.now() - shot.firedAt < SHOT_VISUAL_DURATION_MS ? 0.7 : 0,
              pointerEvents: 'none',
              zIndex: 95,
            }}
            aria-hidden="true"
          ></div>
        </React.Fragment>
      ))}
    </>
  );
};

export default WaterEffects;