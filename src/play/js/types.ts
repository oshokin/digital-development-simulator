export type HazardKind =
  | 'paper'
  | 'cone'
  | 'barrier'
  | 'drone'
  | 'cable'
  | 'server'
  | 'calendar'
  | 'camera'
  | 'fan'
  | 'crate'
  | 'stamp'
  | 'lock'
  | 'hourglass'
  | 'gate'
  | 'permit'
  | 'archive'
  | 'slowdown'
  | 'sovereign'
  | 'bear'
  | 'orca'
  | 'tiger'
  | 'polarBear'
  | 'glider'
  | 'crane';
export type PickupKind = 'coffee' | 'shield';
export type ItemKind = HazardKind | PickupKind;
export type GameMode =
  | 'start'
  | 'running'
  | 'paused'
  | 'down'
  | 'interlude'
  | 'route'
  | 'final'
  | 'ending';
export interface Stage {
  key: string;
  duration: number;
  obstacles: HazardKind[];
  speaker: string;
  palette: string;
}
export interface SpawnState {
  cooldown: number;
  lastObstacle: HazardKind | null;
  lastBonus: PickupKind | null;
  lastLane: 'upper' | 'ground' | null;
  laneStreak: number;
}
export type Hazard = {
  kind: HazardKind;
  x: number;
  age: number;
  taken: boolean;
};
export type Pickup = {
  kind: PickupKind;
  x: number;
  age: number;
  taken: boolean;
};
export type WorldItem = {
  kind: ItemKind;
  x: number;
  age: number;
  taken: boolean;
};
export interface PropConfig {
  w: number;
  h: number;
  image?: string;
  overhead?: boolean;
  artHeight?: number;
  artBottomInset?: number;
}
export type Rect = { x: number; y: number; w: number; h: number };
export type Route = 'public' | 'white';
export type Ending = 'good' | 'bad';
export interface GameState {
  mode: GameMode;
  stage: number;
  elapsed: number;
  total: number;
  spawnIn: number;
  score: number;
  checkpointScore: number;
  checkpointTotal: number;
  lives: number;
  shield: boolean;
  route: Route | null;
  endless: boolean;
  jumpHeight: number;
  velocity: number;
  duck: boolean;
  invulnerable: number;
  objects: WorldItem[];
  ambience: number;
  toastTimer: number;
  ending: Ending | null;
  motion: import('./animation.js').Motion;
  duckUntil: number;
  spawnState: SpawnState;
}

export {};
