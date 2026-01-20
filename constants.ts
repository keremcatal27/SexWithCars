
export const GAME_DURATION_SECONDS = 60; // Game duration in seconds
export const CAR_BASE_RENDER_WIDTH = 60; // Base width of the car when furthest away (top)
export const CAR_BASE_RENDER_HEIGHT = 100; // Base height of the car when furthest away (top)
export const CAR_MIN_SPEED = 1.5; // Minimum pixels per frame (upwards)
export const CAR_MAX_SPEED = 4; // Maximum pixels per frame (upwards)
export const CAR_SPAWN_INTERVAL_MS = 750; // How often new cars spawn (Reduced from 1500ms for more cars)
export const EXHAUST_SIZE = 45; // Increased size of the exhaust pipe hit area for easier targeting (Increased from 30 to 45)

// Scaling for perspective effect
export const CAR_INITIAL_SCALE = 0.3; // Scale factor when car is at the top (furthest away)
export const CAR_FINAL_SCALE = 1.2; // Scale factor when car is at the bottom (closest)

// Exhaust position relative to the car's *bottom-center* when scaled
export const EXHAUST_RELATIVE_OFFSET_X = 0; // Center of the back
export const EXHAUST_RELATIVE_OFFSET_Y = 5; // 5 pixels *down* from the bottom edge of the car, slightly below bumper (Corrected from -5)

// Game area dimensions
export const GAME_AREA_MAX_WIDTH = 800;
export const GAME_AREA_HEIGHT = 600;

// Water pistol and shot visuals
export const WATER_SOURCE_SIZE = 60; // Size of the fixed water source (finger)
export const WATER_SOURCE_OFFSET_FROM_BOTTOM = 10; // Distance of the water source from the very bottom edge
export const WATER_SOURCE_ORIGIN_X = GAME_AREA_MAX_WIDTH / 2; // X-coordinate for the start of the water stream
export const WATER_SOURCE_ORIGIN_Y = GAME_AREA_HEIGHT - WATER_SOURCE_OFFSET_FROM_BOTTOM - (WATER_SOURCE_SIZE / 2); // Y-coordinate for the start of the water stream (mid-finger)

export const SHOT_VISUAL_DURATION_MS = 300; // How long the water shot visual appears (increased for creamy effect)
export const SHOT_COOLDOWN_MS = 300; // Cooldown between shots
export const SPRAYED_CAR_EFFECT_DURATION_MS = 1000; // Total duration of the "jizz kaboom" effect on a car

// Jizz Kaboom effect constants
export const JIZZ_KABOOM_BASE_SIZE = 80; // Base size of the jizz kaboom effect, scaled with car
export const JIZZ_KABOOM_OFFSET_Y = 0; // Vertical offset from the exhaust center
export const JIZZ_KABOOM_APPEAR_DURATION_MS = 200; // How long the jizz kaboom takes to appear

// Car spawning and despawning Y coordinates (adjusted for initial/final scale)
// Cars spawn at the bottom and move up.
export const CAR_SPAWN_Y = GAME_AREA_HEIGHT + CAR_BASE_RENDER_HEIGHT * CAR_FINAL_SCALE; // Spawn slightly off screen bottom, larger
export const CAR_DESPAWN_Y = -CAR_BASE_RENDER_HEIGHT * CAR_INITIAL_SCALE; // Despawn slightly off screen top, smaller

// Road and Lane configuration
export const NUM_LANES = 3;
export const ROAD_WIDTH_AT_TOP_PX = GAME_AREA_MAX_WIDTH * 0.4; // 40% of game area width at the top
export const ROAD_WIDTH_AT_BOTTOM_PX = GAME_AREA_MAX_WIDTH * 0.8; // 80% of game area width at the bottom
export const ROAD_SIDE_OFFSET_TOP_PX = (GAME_AREA_MAX_WIDTH - ROAD_WIDTH_AT_TOP_PX) / 2;
export const ROAD_SIDE_OFFSET_BOTTOM_PX = (GAME_AREA_MAX_WIDTH - ROAD_WIDTH_AT_BOTTOM_PX) / 2;

export const CAR_LANE_DRIFT_MAGNITUDE = 0.5; // Max pixels car can drift horizontally per frame

export const CAR_COLORS = [
  'bg-blue-600',
  'bg-green-600',
  'bg-red-600',
  'bg-yellow-500',
  'bg-purple-600',
  'bg-teal-600',
  'bg-indigo-600',
];