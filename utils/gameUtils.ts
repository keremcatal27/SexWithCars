import { Car, Shot } from '../types';
import {
  EXHAUST_SIZE,
  CAR_BASE_RENDER_WIDTH,
  CAR_BASE_RENDER_HEIGHT,
  CAR_INITIAL_SCALE,
  CAR_FINAL_SCALE,
  CAR_SPAWN_Y, // Now the bottom spawn point
  CAR_DESPAWN_Y, // Now the top despawn point
  GAME_AREA_HEIGHT,
  EXHAUST_RELATIVE_OFFSET_X,
  EXHAUST_RELATIVE_OFFSET_Y,
  // GAME_AREA_MAX_WIDTH, // Not directly used in these functions but good to keep in constants
  ROAD_WIDTH_AT_TOP_PX,
  ROAD_WIDTH_AT_BOTTOM_PX,
  ROAD_SIDE_OFFSET_TOP_PX,
  ROAD_SIDE_OFFSET_BOTTOM_PX,
  NUM_LANES
} from '../constants';

/**
 * Generates a simple unique ID.
 * @returns {string} A unique ID string.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Calculates the current scale factor of a car based on its Y position.
 * For bottom-to-top movement, scale should be max at CAR_SPAWN_Y (bottom) and min at CAR_DESPAWN_Y (top).
 * @param {number} carY - The car's current Y position (top edge).
 * @returns {number} The scale factor.
 */
export function getCarScale(carY: number): number {
  // Normalize carY such that it's 0 at CAR_DESPAWN_Y (top) and 1 at CAR_SPAWN_Y (bottom).
  const normalizedY = (carY - CAR_DESPAWN_Y) / (CAR_SPAWN_Y - CAR_DESPAWN_Y);
  return clamp(
    CAR_INITIAL_SCALE + (CAR_FINAL_SCALE - CAR_INITIAL_SCALE) * normalizedY,
    CAR_INITIAL_SCALE,
    CAR_FINAL_SCALE
  );
}

/**
 * Calculates the current width of the road at a given Y position.
 * @param {number} y - The Y position on the game canvas.
 * @returns {number} The width of the road at that Y position.
 */
export function getRoadWidthAtY(y: number): number {
  const normalizedY = clamp(y / GAME_AREA_HEIGHT, 0, 1);
  return ROAD_WIDTH_AT_TOP_PX + (ROAD_WIDTH_AT_BOTTOM_PX - ROAD_WIDTH_AT_TOP_PX) * normalizedY;
}

/**
 * Calculates the current left offset of the road at a given Y position.
 * @param {number} y - The Y position on the game canvas.
 * @returns {number} The left offset of the road at that Y position.
 */
export function getRoadOffsetXAtY(y: number): number {
  const normalizedY = clamp(y / GAME_AREA_HEIGHT, 0, 1);
  return ROAD_SIDE_OFFSET_TOP_PX + (ROAD_SIDE_OFFSET_BOTTOM_PX - ROAD_SIDE_OFFSET_TOP_PX) * normalizedY;
}

/**
 * Calculates the actual pixel X position for a car in a given lane, considering scaling.
 * @param {number} carLane - The car's lane index (0, 1, 2).
 * @param {number} carXRelative - The car's relative X position within its lane (from its center).
 * @param {number} carY - The car's Y position.
 * @param {number} scaledCarWidth - The car's current scaled width.
 * @returns {number} The absolute pixel X position for the car's left edge.
 */
export function getCarPixelX(carLane: number, carXRelative: number, carY: number, scaledCarWidth: number): number {
  const roadWidth = getRoadWidthAtY(carY);
  const roadOffsetX = getRoadOffsetXAtY(carY);
  const laneWidth = roadWidth / NUM_LANES;

  // Calculate the center X of the car's assigned lane
  const laneCenterX = roadOffsetX + (carLane * laneWidth) + (laneWidth / 2);

  // Apply the relative carX position to the lane center
  const carCenterX = laneCenterX + carXRelative;

  // Return the left edge of the car
  return carCenterX - (scaledCarWidth / 2);
}

/**
 * Checks for collision between a shot and a car's exhaust pipe in a 2D perspective.
 * @param {Shot} shot - The water shot object.
 * @param {Car} car - The car object.
 * @returns {boolean} True if a collision occurred, false otherwise.
 */
export function checkCollision(shot: Shot, car: Car): boolean {
  const scale = getCarScale(car.y);
  const currentCarWidth = CAR_BASE_RENDER_WIDTH * scale;
  const currentCarHeight = CAR_BASE_RENDER_HEIGHT * scale;

  // Calculate the actual render X position of the car's left edge
  const carRenderX = getCarPixelX(car.lane, car.x, car.y, currentCarWidth);

  // Calculate exhaust position (relative to scaled car's bottom-center)
  // Shot.x, shot.y are the center of the crosshair.
  const exhaustCenterX = carRenderX + (currentCarWidth / 2) + (EXHAUST_RELATIVE_OFFSET_X * scale);
  // Exhaust is now relative to the *bottom* of the car component
  const exhaustCenterY = car.y + currentCarHeight + (EXHAUST_RELATIVE_OFFSET_Y * scale);

  const exhaustRect = {
    x: exhaustCenterX - (EXHAUST_SIZE * scale / 2),
    y: exhaustCenterY - (EXHAUST_SIZE * scale / 2),
    width: EXHAUST_SIZE * scale,
    height: EXHAUST_SIZE * scale,
  };

  return (
    shot.x >= exhaustRect.x &&
    shot.x <= exhaustRect.x + exhaustRect.width &&
    shot.y >= exhaustRect.y &&
    shot.y <= exhaustRect.y + exhaustRect.height
  );
}

/**
 * Clamps a value between a minimum and maximum.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}