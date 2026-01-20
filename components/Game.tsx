import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Car as CarType, GameState, Shot } from '../types';
import {
  CAR_BASE_RENDER_WIDTH,
  CAR_BASE_RENDER_HEIGHT,
  CAR_MIN_SPEED,
  CAR_MAX_SPEED,
  CAR_SPAWN_INTERVAL_MS,
  GAME_DURATION_SECONDS,
  SHOT_VISUAL_DURATION_MS,
  WATER_SOURCE_SIZE,
  GAME_AREA_MAX_WIDTH,
  GAME_AREA_HEIGHT,
  SHOT_COOLDOWN_MS,
  CAR_SPAWN_Y,
  CAR_DESPAWN_Y,
  NUM_LANES,
  ROAD_WIDTH_AT_TOP_PX,
  ROAD_WIDTH_AT_BOTTOM_PX,
  ROAD_SIDE_OFFSET_TOP_PX,
  ROAD_SIDE_OFFSET_BOTTOM_PX,
  CAR_LANE_DRIFT_MAGNITUDE,
  WATER_SOURCE_ORIGIN_X, // Import new origin constants
  WATER_SOURCE_ORIGIN_Y, // Import new origin constants
  SPRAYED_CAR_EFFECT_DURATION_MS,
} from '../constants';
import { generateId, checkCollision, clamp, getCarPixelX, getCarScale, getRoadWidthAtY, getRoadOffsetXAtY } from '../utils/gameUtils';
import Car from './Car';
import WaterEffects from './WaterPistol';
import FingerWaterSource from './WaterSource';
import ScoreDisplay from './ScoreDisplay';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
// Removed: import Crosshair from './Crosshair';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState<number>(0);
  const [cars, setCars] = useState<CarType[]>([]);
  const [aimX, setAimX] = useState<number>(GAME_AREA_MAX_WIDTH / 2);
  const [aimY, setAimY] = useState<number>(GAME_AREA_HEIGHT / 2); // Initial aim in the center
  const [shots, setShots] = useState<Shot[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const lastShotTime = useRef<number>(0);
  const [isSpraying, setIsSpraying] = useState<boolean>(false); // New state for hold-to-spray

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const carSpawnIntervalRef = useRef<number>(0);
  const gameTimerRef = useRef<number>(0);
  const sprayIntervalRef = useRef<number>(0); // Ref for continuous spray interval

  const resetGame = useCallback(() => {
    setScore(0);
    setCars([]);
    setAimX(GAME_AREA_MAX_WIDTH / 2);
    setAimY(GAME_AREA_HEIGHT / 2);
    setShots([]);
    setTimeLeft(GAME_DURATION_SECONDS);
    lastShotTime.current = 0;
    setIsSpraying(false); // Reset spraying state
    setGameState(GameState.START);
  }, []);

  const startGame = useCallback(() => {
    setGameState(GameState.PLAYING);
    setTimeLeft(GAME_DURATION_SECONDS);
    setScore(0);
    setCars([]);
    setShots([]);
    lastShotTime.current = 0;
    setIsSpraying(false); // Ensure not spraying at start
  }, []);

  // Function to fire a single shot, optionally overriding aimX/aimY
  const fireShot = useCallback((overrideX?: number, overrideY?: number) => {
    const now = Date.now();
    if (now - lastShotTime.current < SHOT_COOLDOWN_MS) {
      return; // Apply cooldown
    }
    lastShotTime.current = now;

    const shotX = overrideX !== undefined ? overrideX : aimX;
    const shotY = overrideY !== undefined ? overrideY : aimY;

    const newShot: Shot = { id: generateId(), x: shotX, y: shotY, firedAt: now };
    setShots((prevShots) => [...prevShots, newShot]);

    setCars((prevCars) =>
      prevCars.map((car) => {
        // Only check collision if the car hasn't been hit yet
        if (!car.sprayedAt && checkCollision(newShot, car)) {
          setScore((prevScore) => prevScore + 1);
          return { ...car, sprayedAt: now }; // Update sprayedAt timestamp
        }
        return car;
      })
    );
  }, [aimX, aimY]); // aimX, aimY are dependencies for the default (non-override) case


  // Game Loop (Car Movement)
  const animateCars = useCallback(() => {
    setCars((prevCars) => {
      const now = Date.now();
      const newCars = prevCars
        .map((car) => {
          // If car is sprayed and its effect duration has passed, remove it
          if (car.sprayedAt && now - car.sprayedAt > SPRAYED_CAR_EFFECT_DURATION_MS) {
            return null; // Mark for removal
          }
          
          // If car is sprayed, its movement is handled by CSS animation in Car.tsx, so don't update its position here.
          if (car.sprayedAt) {
            return car; 
          }

          let newY = car.y - car.speed; // Cars now move UPWARDS
          let newX = car.x;

          // Subtle lane drift
          if (Math.random() < 0.1) { // 10% chance to drift
            newX += (Math.random() - 0.5) * CAR_LANE_DRIFT_MAGNITUDE;
            newX = clamp(newX, -CAR_BASE_RENDER_WIDTH / 2, CAR_BASE_RENDER_WIDTH / 2); // Keep within reasonable bounds
          }

          // Remove car if it goes off-screen (top)
          if (newY < CAR_DESPAWN_Y) {
            return null;
          }
          return { ...car, x: newX, y: newY };
        })
        .filter(Boolean) as CarType[]; // Filter out nulls

      return newCars;
    });

    // Remove old shot visuals
    setShots((prevShots) =>
      prevShots.filter((shot) => Date.now() - shot.firedAt < SHOT_VISUAL_DURATION_MS)
    );

    animationFrameRef.current = requestAnimationFrame(animateCars);
  }, []);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      animationFrameRef.current = requestAnimationFrame(animateCars);

      carSpawnIntervalRef.current = window.setInterval(() => {
        const lane = Math.floor(Math.random() * NUM_LANES);
        const newCar: CarType = {
          id: generateId(),
          x: 0, // Initial horizontal offset within the lane (center)
          y: CAR_SPAWN_Y, // Spawn at the bottom of the screen
          speed: Math.random() * (CAR_MAX_SPEED - CAR_MIN_SPEED) + CAR_MIN_SPEED,
          lane: lane,
          sprayedAt: null, // New cars are not sprayed initially
        };
        setCars((prevCars) => [...prevCars, newCar]);
      }, CAR_SPAWN_INTERVAL_MS);

      gameTimerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setGameState(GameState.GAME_OVER);
            clearInterval(gameTimerRef.current);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // Continuous spraying logic
      if (isSpraying) {
        // For continuous spray, call fireShot without overrides to use current aimX/aimY
        sprayIntervalRef.current = window.setInterval(() => fireShot(), SHOT_COOLDOWN_MS);
      } else {
        clearInterval(sprayIntervalRef.current);
      }

    } else {
      cancelAnimationFrame(animationFrameRef.current);
      clearInterval(carSpawnIntervalRef.current);
      clearInterval(gameTimerRef.current);
      clearInterval(sprayIntervalRef.current); // Clear spray interval on game end/pause
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      clearInterval(carSpawnIntervalRef.current);
      clearInterval(gameTimerRef.current);
      clearInterval(sprayIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, animateCars, isSpraying, fireShot]); // Added isSpraying and fireShot to dependencies

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (gameState !== GameState.PLAYING || !gameAreaRef.current) return;

    const gameRect = gameAreaRef.current.getBoundingClientRect();
    const newAimX = clamp(clientX - gameRect.left, 0, gameRect.width);
    const newAimY = clamp(clientY - gameRect.top, 0, gameRect.height);

    setAimX(newAimX);
    setAimY(newAimY);
  }, [gameState]);

  // Handle pointer down (mouse or touch) to initiate a shot/spray
  const handlePointerDown = useCallback((eventClientX: number, eventClientY: number) => {
    if (gameState !== GameState.PLAYING || !gameAreaRef.current) return;
    setIsSpraying(true); // Start spraying

    const gameRect = gameAreaRef.current.getBoundingClientRect();
    const shotGameX = clamp(eventClientX - gameRect.left, 0, gameRect.width);
    const shotGameY = clamp(eventClientY - gameRect.top, 0, gameRect.height);

    // Fire the first shot immediately using the event's coordinates
    fireShot(shotGameX, shotGameY);
  }, [gameState, fireShot]);

  const handlePointerUp = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    setIsSpraying(false); // Stop spraying
  }, [gameState]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  }, [handlePointerMove]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only prevent default and handle pointer down if game is playing
    if (gameState === GameState.PLAYING) {
      e.preventDefault(); // Prevent default mouse behavior like text selection
      handlePointerDown(e.clientX, e.clientY); // Pass clientX, clientY
    }
  }, [handlePointerDown, gameState]); // Added gameState to dependencies

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only prevent default and handle pointer up if game is playing
    if (gameState === GameState.PLAYING) {
      e.preventDefault(); // Prevent default
      handlePointerUp();
    }
  }, [handlePointerUp, gameState]); // Added gameState to dependencies

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handlePointerMove]);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Only prevent default and handle pointer down if game is playing
    if (gameState === GameState.PLAYING) {
      e.preventDefault(); // Prevent default touch behavior like scrolling/zooming
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY); // Pass touch coordinates
      }
    }
  }, [handlePointerDown, gameState]); // Added gameState to dependencies

  const onTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Fix: Only stop spraying if ALL touches have ended
    if (gameState === GameState.PLAYING && e.touches.length === 0) {
      e.preventDefault(); // Prevent default
      handlePointerUp();
    }
  }, [handlePointerUp, gameState]); // Added gameState to dependencies


  return (
    <div
      ref={gameAreaRef}
      className="relative overflow-hidden border-4 border-blue-600 rounded-lg shadow-2xl bg-gray-700"
      style={{
        width: GAME_AREA_MAX_WIDTH,
        height: GAME_AREA_HEIGHT,
        cursor: 'none', // Always hide cursor during play for custom aiming
      }}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp} // Added mouse up handler
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd} // Added touch end handler
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right-click
    >
      {/* Highway Background and Lanes */}
      <div
        className="absolute inset-0 bg-gray-800"
        style={{
          // The clipPath defines the trapezoidal road area
          clipPath: `polygon(
            ${ROAD_SIDE_OFFSET_TOP_PX}px 0,
            ${GAME_AREA_MAX_WIDTH - ROAD_SIDE_OFFSET_TOP_PX}px 0,
            ${GAME_AREA_MAX_WIDTH - ROAD_SIDE_OFFSET_BOTTOM_PX}px ${GAME_AREA_HEIGHT}px,
            ${ROAD_SIDE_OFFSET_BOTTOM_PX}px ${GAME_AREA_HEIGHT}px
          )`,
        }}
        role="img"
        aria-label="Highway road"
      >
        {/* Lane markers - dynamically rendered for perspective */}
        {Array.from({ length: NUM_LANES - 1 }).map((_, i) => {
          const laneMarkerTopY = 0; // Start at the top of the game area
          const laneMarkerBottomY = GAME_AREA_HEIGHT; // End at the bottom

          // Calculate properties at top
          const topRoadOffsetX = getRoadOffsetXAtY(laneMarkerTopY);
          const topRoadWidth = getRoadWidthAtY(laneMarkerTopY);
          const topLaneWidth = topRoadWidth / NUM_LANES;
          const topX = topRoadOffsetX + (i + 1) * topLaneWidth;

          // Calculate properties at bottom
          const bottomRoadOffsetX = getRoadOffsetXAtY(laneMarkerBottomY);
          const bottomRoadWidth = getRoadWidthAtY(laneMarkerBottomY);
          const bottomLaneWidth = bottomRoadWidth / NUM_LANES;
          const bottomX = bottomRoadOffsetX + (i + 1) * bottomLaneWidth;

          // Using a div with a custom clip-path to create the trapezoidal lane marker
          // Each marker starts at topX (top) and goes to bottomX (bottom)
          return (
            <div
              key={`lane-marker-${i}`}
              className="absolute bg-yellow-300 opacity-70"
              style={{
                width: '4px', // Base width for the lane marker
                height: '100%',
                left: 0, // Positioned via clipPath
                top: 0,
                clipPath: `polygon(
                  ${topX - 2}px ${laneMarkerTopY}px,
                  ${topX + 2}px ${laneMarkerTopY}px,
                  ${bottomX + 2}px ${laneMarkerBottomY}px,
                  ${bottomX - 2}px ${laneMarkerBottomY}px
                )`,
              }}
            ></div>
          );
        })}
      </div>


      {gameState === GameState.PLAYING && (
        <>
          <ScoreDisplay score={score} timeLeft={timeLeft} />
          {cars.map((car) => (
            <Car key={car.id} car={car} />
          ))}
          <WaterEffects
            shots={shots}
            waterSourceOriginX={WATER_SOURCE_ORIGIN_X}
            waterSourceOriginY={WATER_SOURCE_ORIGIN_Y}
          />
          <FingerWaterSource /> {/* The fixed water source */}
          {/* Removed: <Crosshair x={aimX} y={aimY} /> */}
        </>
      )}

      {gameState === GameState.START && <StartScreen onStart={startGame} />}
      {gameState === GameState.GAME_OVER && (
        <GameOverScreen score={score} onRestart={resetGame} />
      )}
    </div>
  );
};

export default Game;