import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Car as CarType } from '../types';
import {
  CAR_BASE_RENDER_WIDTH,
  CAR_BASE_RENDER_HEIGHT,
  EXHAUST_SIZE,
  EXHAUST_RELATIVE_OFFSET_X,
  EXHAUST_RELATIVE_OFFSET_Y,
  CAR_COLORS,
  GAME_AREA_HEIGHT,
  SPRAYED_CAR_EFFECT_DURATION_MS,
  JIZZ_KABOOM_BASE_SIZE,
  JIZZ_KABOOM_OFFSET_Y,
  JIZZ_KABOOM_APPEAR_DURATION_MS,
  CAR_INITIAL_SCALE,
  CAR_FINAL_SCALE,
} from '../constants';
import { getCarScale, getCarPixelX } from '../utils/gameUtils';

interface CarProps {
  car: CarType;
}

const Car: React.FC<CarProps> = ({ car }) => {
  const scale = getCarScale(car.y);
  const currentWidth = CAR_BASE_RENDER_WIDTH * scale;
  const currentHeight = CAR_BASE_RENDER_HEIGHT * scale;

  const carRenderX = getCarPixelX(car.lane, car.x, car.y, currentWidth);

  // Random color for the car, memoized to stay consistent per car instance
  const originalCarColorClass = useMemo(() => CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)], []);

  // State to manage the jizz kaboom animation class
  const [jizzKaboomClass, setJizzKaboomClass] = useState('');
  const [showJizzKaboom, setShowJizzKaboom] = useState(false);
  
  // New states for hit effects
  const [isHit, setIsHit] = useState(false);
  const [explosionClass, setExplosionClass] = useState('');
  const [jumpDirectionX, setJumpDirectionX] = useState(0); // -1 for left, 1 for right

  // Ref to hold the original car color for CSS variable
  const carBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (car.sprayedAt && !isHit) { // Trigger hit effects only once per hit
      setIsHit(true);
      
      // Set random jump direction for the car explosion animation
      setJumpDirectionX(Math.random() < 0.5 ? -1 : 1);

      // Start jizz kaboom (glaze)
      setShowJizzKaboom(true);
      setJizzKaboomClass('jizz-kaboom-appear');

      const fadeGlazeTimeout = setTimeout(() => {
        setJizzKaboomClass('jizz-kaboom-fade');
      }, JIZZ_KABOOM_APPEAR_DURATION_MS);

      // Start explosion burst
      setExplosionClass('animate-explosion-burst');

      // Clear explosion burst after its duration
      const clearExplosionTimeout = setTimeout(() => {
        setExplosionClass('');
      }, 500); // explosion-burst animation duration is 500ms

      return () => {
        clearTimeout(fadeGlazeTimeout);
        clearTimeout(clearExplosionTimeout);
      };
    }
  }, [car.sprayedAt, isHit, JIZZ_KABOOM_APPEAR_DURATION_MS]);

  // Set CSS variable for original car color
  useEffect(() => {
    if (carBodyRef.current) {
      // Extract original color from tailwind class, e.g., 'bg-blue-600' -> 'blue-600'
      const color = originalCarColorClass.replace('bg-', '');
      carBodyRef.current.style.setProperty('--original-car-color', `var(--tw-bg-${color})`);
    }
  }, [originalCarColorClass]);


  // Calculate exhaust pipe's absolute top-left position for rendering
  // These positions are relative to the game container, not the car's div,
  // because the car's div moves and scales.
  // Fix: Corrected typo from EXHAhaust_RELATIVE_OFFSET_X to EXHAUST_RELATIVE_OFFSET_X
  const exhaustCenterX = carRenderX + (currentWidth / 2) + (EXHAUST_RELATIVE_OFFSET_X * scale);
  const exhaustCenterY = car.y + currentHeight + (EXHAUST_RELATIVE_OFFSET_Y * scale);

  const exhaustAbsLeft = exhaustCenterX - (EXHAUST_SIZE * scale / 2);
  const exhaustAbsTop = exhaustCenterY - (EXHAUST_SIZE * scale / 2);

  // Calculate Jizz Kaboom & Explosion position, centered on the exhaust pipe
  const jizzKaboomSize = JIZZ_KABOOM_BASE_SIZE * scale;
  const jizzKaboomAbsLeft = exhaustCenterX; // Centered X for transform: translate(-50%, -50%)
  const jizzKaboomAbsTop = exhaustCenterY + (JIZZ_KABOOM_OFFSET_Y * scale); // Centered Y for transform: translate(-50%, -50%)

  return (
    <div
      className={`absolute bg-transparent shadow-lg ${isHit ? 'animate-car-explode-jump' : ''}`}
      style={{
        width: currentWidth,
        height: currentHeight,
        left: carRenderX,
        top: car.y,
        zIndex: Math.floor(GAME_AREA_HEIGHT - car.y),
        clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
        opacity: Math.max(0.2, (CAR_FINAL_SCALE - scale) / (CAR_FINAL_SCALE - CAR_INITIAL_SCALE) + 0.2), // Fades out as it moves away
        // CSS variables for jump animation
        '--explosion-duration': `${SPRAYED_CAR_EFFECT_DURATION_MS}ms`,
        '--jump-direction-x': jumpDirectionX,
        pointerEvents: isHit ? 'none' : 'auto', // Disable pointer events when hit
      } as React.CSSProperties} // Cast to CSSProperties to allow custom properties
      aria-label={`Car in lane ${car.lane} at y-position ${Math.round(car.y)}`}
    >
      {/* Main Car Body */}
      <div
        ref={carBodyRef}
        className={`absolute top-[5%] left-[5%] w-[90%] h-[80%] rounded-sm ${originalCarColorClass} ${isHit ? 'animate-car-hit-white' : ''}`}
      ></div>

      {/* Rear Window (optional, for detail) */}
      <div className="absolute top-[10%] left-[25%] w-[50%] h-[20%] bg-gray-500 rounded-sm"></div>

      {/* Taillights */}
      <div className="absolute bottom-[10%] left-[10%] w-[20%] h-[10%] bg-red-700 rounded-sm"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[20%] h-[10%] bg-red-700 rounded-sm"></div>

      {/* Bumper */}
      <div className="absolute bottom-0 left-0 w-full h-[10%] bg-gray-500 rounded-b-md"></div>

      {/* Exhaust Pipe (visible target) */}
      <div
        className="absolute bg-black rounded-full border-2 border-gray-600"
        style={{
          width: EXHAUST_SIZE * scale,
          height: EXHAUST_SIZE * scale,
          left: exhaustAbsLeft - carRenderX, // Position relative to parent car div
          top: exhaustAbsTop - car.y, // Position relative to parent car div
          opacity: Math.max(0.3, (CAR_FINAL_SCALE - scale) / (CAR_FINAL_SCALE - CAR_INITIAL_SCALE) + 0.1), // Fades out with car, slightly more subtle
          // TEMPORARY: Add a red border to visualize the hitbox
          border: '2px solid red', // DEBUG: Show hitbox
          boxSizing: 'border-box', // DEBUG: Include padding and border in the element's total width and height
        }}
        aria-label="Car exhaust pipe"
      ></div>

      {/* Jizz Kaboom Overlay */}
      {showJizzKaboom && (
        <div
          className={`absolute bg-white/90 ${jizzKaboomClass}`}
          style={{
            left: jizzKaboomAbsLeft - carRenderX, // Position relative to parent car div
            top: jizzKaboomAbsTop - car.y, // Position relative to parent car div
            width: jizzKaboomSize,
            height: jizzKaboomSize,
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', // Organic blob shape
            filter: 'blur(1px)', // Soften the edges
            zIndex: 99,
            pointerEvents: 'none',
            transformOrigin: 'center center',
            animationDuration: jizzKaboomClass === 'jizz-kaboom-appear' ? `${JIZZ_KABOOM_APPEAR_DURATION_MS}ms` : `${SPRAYED_CAR_EFFECT_DURATION_MS - JIZZ_KABOOM_APPEAR_DURATION_MS}ms`,
            animationName: jizzKaboomClass === 'jizz-kaboom-appear' ? 'jizz-kaboom-appear' : 'jizz-kaboom-fade',
            animationFillMode: 'forwards',
          }}
          aria-hidden="true"
        ></div>
      )}

      {/* Explosion Effect */}
      {isHit && explosionClass && (
        <div
          className={`absolute bg-gray-300 rounded-full ${explosionClass}`}
          style={{
            left: jizzKaboomAbsLeft - carRenderX, // Centered on exhaust
            top: jizzKaboomAbsTop - car.y, // Centered on exhaust
            width: jizzKaboomSize * 1.5, // Larger than jizz kaboom
            height: jizzKaboomSize * 1.5,
            opacity: 0.8,
            borderRadius: '50%',
            filter: 'blur(2px)',
            zIndex: 100, // Above jizz kaboom
            pointerEvents: 'none',
            transformOrigin: 'center center',
            transform: 'translate(-50%, -50%) scale(0)', // Initial state for animation
            boxShadow: '0 0 15px 5px rgba(255, 255, 255, 0.7)', // White glow
            animationFillMode: 'forwards',
          }}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default Car;