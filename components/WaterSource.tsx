import React from 'react';
import { GAME_AREA_MAX_WIDTH, GAME_AREA_HEIGHT, WATER_SOURCE_SIZE, WATER_SOURCE_OFFSET_FROM_BOTTOM } from '../constants';

const FingerWaterSource: React.FC = () => {
  const halfSize = WATER_SOURCE_SIZE / 2;
  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        left: (GAME_AREA_MAX_WIDTH / 2) - halfSize,
        top: GAME_AREA_HEIGHT - WATER_SOURCE_OFFSET_FROM_BOTTOM - halfSize,
        width: WATER_SOURCE_SIZE,
        height: WATER_SOURCE_SIZE,
        zIndex: 100, // Ensure it's on top of other elements
      }}
      aria-label="Finger water source"
    >
      {/* SVG for a pointing finger */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="text-blue-500 transform rotate-[-10deg]" // Slightly rotate for a more natural pointing gesture
      >
        <path d="M11 2L13 2C13.5523 2 14 2.44772 14 3V12C14 12.5523 13.5523 13 13 13H11V11H9V21H7V11H5V9H9V3C9 2.44772 9.44772 2 10 2H11Z" />
      </svg>
    </div>
  );
};

export default FingerWaterSource;