export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface Car {
  id: string;
  x: number; // Represents the horizontal center of the car in its lane
  y: number; // Represents the vertical position (top of car)
  speed: number; // Downward speed
  lane: number; // 0, 1, 2 for the lane
  sprayedAt: number | null; // Timestamp when the car was last sprayed for visual effects
}

export interface Shot {
  id: string;
  x: number;
  y: number;
  firedAt: number;
}