// Endless is one uninterrupted run; story checkpoints apply only to campaign play.
export function checkpointTransition({ endless, stage, elapsed }, duration) {
  if (endless || elapsed < duration) return null;
  if (stage === 4) return { mode: 'final' };
  if (stage === 2) return { mode: 'route' };
  return { mode: 'interlude', stage: stage + 1 };
}

export function elapsedLabel(seconds) {
  const total = Math.floor(Math.max(0, seconds));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function recoveryOptions(endless) {
  return endless ? ['newEndlessRun'] : ['restartLevel', 'restartGame'];
}

export function canCollectBonus(kind, { lives, shield }) {
  return kind === 'coffee' ? lives < 3 : kind === 'shield' ? !shield : false;
}

// These are the actual collision heights, not the vertical position of the art.
const overhead = new Set(['drone', 'tiger', 'glider', 'crane']);
export function obstacleLane(kind) { return overhead.has(kind) ? 'upper' : 'ground'; }

export function chooseSpawn(pool, previous, random = Math.random, collector = { lives: 0, shield: false }) {
  if (!pool.length) throw new Error('Obstacle pool must not be empty');
  const availableBonuses = ['shield', 'coffee'].filter(kind =>
    canCollectBonus(kind, collector) && kind !== previous.lastBonus);
  const bonus = availableBonuses.length > 0 && previous.cooldown >= 2 && random() < .10;
  if (bonus) {
    const kind = availableBonuses[Math.floor(random() * availableBonuses.length)];
    return { kind, next: { ...previous, cooldown: 0, lastBonus: kind } };
  }
  const different = pool.filter(kind => kind !== previous.lastObstacle);
  // After three hazards on one collision height, use the other height.
  // The bonus is a pickup, so it does not disguise a fourth same-lane hazard.
  const alternateLane = different.filter(kind => obstacleLane(kind) !== previous.lastLane);
  const choices = previous.laneStreak >= 3 && alternateLane.length
    ? alternateLane : different.length ? different : pool;
  const kind = choices[Math.floor(random() * choices.length)];
  const lane = obstacleLane(kind);
  return { kind, next: { ...previous, cooldown: Math.min(2, previous.cooldown + 1), lastObstacle: kind,
    lastLane: lane, laneStreak: lane === previous.lastLane ? (previous.laneStreak || 0) + 1 : 1 } };
}
