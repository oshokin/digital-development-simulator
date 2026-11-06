// Zero-based campaign stage that opens the final decision.
const FINAL_STAGE = 4;
// Zero-based campaign stage that opens route selection.
const ROUTE_STAGE = 2;
// Seconds in one displayed elapsed-time minute.
const SECONDS_PER_MINUTE = 60;
// Minimum digit width of each elapsed-time component.
const TIME_COMPONENT_DIGITS = 2;
// Maximum health restored by coffee pickups, in lives.
const MAX_LIVES = 3;
// Hazards required between eligible bonus spawns.
const BONUS_COOLDOWN = 2;
// Probability of an eligible spawn becoming a bonus.
const BONUS_CHANCE = 0.1;
// Maximum consecutive hazards in one collision lane before alternating.
const MAX_LANE_STREAK = 3;

// Endless is one uninterrupted run; story checkpoints apply only to campaign play.

export function checkpointTransition(
  {
    endless,
    stage,
    elapsed
  }: { endless: boolean; stage: number; elapsed: number },
  duration: number
): { mode: 'final' | 'route' } | { mode: 'interlude'; stage: number } | null {
  if (endless || elapsed < duration) return null;
  if (stage === FINAL_STAGE) return { mode: 'final' };
  if (stage === ROUTE_STAGE) return { mode: 'route' };
  return { mode: 'interlude', stage: stage + 1 };
}

export function elapsedLabel(seconds: number) {
  const total = Math.floor(Math.max(0, seconds));
  return `${String(Math.floor(total / SECONDS_PER_MINUTE)).padStart(TIME_COMPONENT_DIGITS, '0')}:${String(total % SECONDS_PER_MINUTE).padStart(TIME_COMPONENT_DIGITS, '0')}`;
}

export function recoveryOptions(
  endless: boolean
): ('newEndlessRun' | 'restartLevel' | 'restartGame')[] {
  return endless ? ['newEndlessRun'] : ['restartLevel', 'restartGame'];
}

export function canCollectBonus(
  kind: import('./types.js').ItemKind,
  { lives, shield }: { lives: number; shield: boolean }
) {
  return kind === 'coffee'
    ? lives < MAX_LIVES
    : kind === 'shield'
      ? !shield
      : false;
}

// These are the actual collision heights, not the vertical position of the art.
const overhead = new Set(['drone', 'tiger', 'glider', 'crane']);

export function obstacleLane(
  kind: import('./types.js').ItemKind
): 'upper' | 'ground' {
  return overhead.has(kind) ? 'upper' : 'ground';
}

export function chooseSpawn(
  pool: import('./types.js').HazardKind[],
  previous: import('./types.js').SpawnState,
  random: () => number = Math.random,
  collector: { lives: number; shield: boolean } = { lives: 0, shield: false }
): {
  kind: import('./types.js').ItemKind;
  next: import('./types.js').SpawnState;
} {
  if (!pool.length) throw new Error('Obstacle pool must not be empty');
  const availableBonuses = (
    ['shield', 'coffee'] as import('./types.js').PickupKind[]
  ).filter(
    kind => canCollectBonus(kind, collector) && kind !== previous.lastBonus
  );
  const bonus =
    availableBonuses.length > 0 &&
    previous.cooldown >= BONUS_COOLDOWN &&
    random() < BONUS_CHANCE;
  if (bonus) {
    const kind =
      availableBonuses[Math.floor(random() * availableBonuses.length)];
    return { kind, next: { ...previous, cooldown: 0, lastBonus: kind } };
  }
  const different = pool.filter(kind => kind !== previous.lastObstacle);
  // After three hazards on one collision height, use the other height.
  // The bonus is a pickup, so it does not disguise a fourth same-lane hazard.
  const alternateLane = different.filter(
    kind => obstacleLane(kind) !== previous.lastLane
  );
  const choices =
    previous.laneStreak >= MAX_LANE_STREAK && alternateLane.length
      ? alternateLane
      : different.length
        ? different
        : pool;
  const kind = choices[Math.floor(random() * choices.length)];
  const lane = obstacleLane(kind);
  return {
    kind,
    next: {
      ...previous,
      cooldown: Math.min(BONUS_COOLDOWN, previous.cooldown + 1),
      lastObstacle: kind,
      lastLane: lane,
      laneStreak:
        lane === previous.lastLane ? (previous.laneStreak || 0) + 1 : 1
    }
  };
}
