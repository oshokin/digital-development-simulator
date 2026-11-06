// Generated from src/ by npm run build. Do not edit.
const FINAL_STAGE = 4;
const ROUTE_STAGE = 2;
const SECONDS_PER_MINUTE = 60;
const TIME_COMPONENT_DIGITS = 2;
const MAX_LIVES = 3;
const BONUS_COOLDOWN = 2;
const BONUS_CHANCE = 0.1;
const MAX_LANE_STREAK = 3;
function checkpointTransition({
  endless,
  stage,
  elapsed
}, duration) {
  if (endless || elapsed < duration) return null;
  if (stage === FINAL_STAGE) return { mode: "final" };
  if (stage === ROUTE_STAGE) return { mode: "route" };
  return { mode: "interlude", stage: stage + 1 };
}
function elapsedLabel(seconds) {
  const total = Math.floor(Math.max(0, seconds));
  return `${String(Math.floor(total / SECONDS_PER_MINUTE)).padStart(TIME_COMPONENT_DIGITS, "0")}:${String(total % SECONDS_PER_MINUTE).padStart(TIME_COMPONENT_DIGITS, "0")}`;
}
function recoveryOptions(endless) {
  return endless ? ["newEndlessRun"] : ["restartLevel", "restartGame"];
}
function canCollectBonus(kind, { lives, shield }) {
  return kind === "coffee" ? lives < MAX_LIVES : kind === "shield" ? !shield : false;
}
const overhead = /* @__PURE__ */ new Set(["drone", "tiger", "glider", "crane"]);
function obstacleLane(kind) {
  return overhead.has(kind) ? "upper" : "ground";
}
function chooseSpawn(pool, previous, random = Math.random, collector = { lives: 0, shield: false }) {
  if (!pool.length) throw new Error("Obstacle pool must not be empty");
  const availableBonuses = ["shield", "coffee"].filter(
    (kind2) => canCollectBonus(kind2, collector) && kind2 !== previous.lastBonus
  );
  const bonus = availableBonuses.length > 0 && previous.cooldown >= BONUS_COOLDOWN && random() < BONUS_CHANCE;
  if (bonus) {
    const kind2 = availableBonuses[Math.floor(random() * availableBonuses.length)];
    return { kind: kind2, next: { ...previous, cooldown: 0, lastBonus: kind2 } };
  }
  const different = pool.filter((kind2) => kind2 !== previous.lastObstacle);
  const alternateLane = different.filter(
    (kind2) => obstacleLane(kind2) !== previous.lastLane
  );
  const choices = previous.laneStreak >= MAX_LANE_STREAK && alternateLane.length ? alternateLane : different.length ? different : pool;
  const kind = choices[Math.floor(random() * choices.length)];
  const lane = obstacleLane(kind);
  return {
    kind,
    next: {
      ...previous,
      cooldown: Math.min(BONUS_COOLDOWN, previous.cooldown + 1),
      lastObstacle: kind,
      lastLane: lane,
      laneStreak: lane === previous.lastLane ? (previous.laneStreak || 0) + 1 : 1
    }
  };
}
export {
  canCollectBonus,
  checkpointTransition,
  chooseSpawn,
  elapsedLabel,
  obstacleLane,
  recoveryOptions
};
