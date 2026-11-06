// Generated from src/ by npm run build. Do not edit.
const EFFECT_MOTION = Object.freeze({
  beaconOpacity: 0.5,
  beaconAmplitude: 0.35,
  beaconRate: 4,
  sparkRate: 7,
  sparkThreshold: 0.45,
  sandRate: 0.65,
  crawlRate: 5,
  crawlPixels: 2
});
const ITEM_CUE = Object.freeze({
  backingWidth: 7,
  outlineWidth: 3,
  radiusRatio: 0.62,
  padding: 3,
  badgeOffset: 5,
  badgeRadius: 12,
  crossWidth: 3,
  crossArm: 6
});
const ORBIT = Object.freeze({
  radiusRatio: 0.52,
  count: 3,
  rate: 2,
  halfSize: 2,
  size: 4
});
const GATE_BEACON = Object.freeze({
  centers: [0.19, 0.81],
  y: 0.24,
  radius: 3.7
});
const CABLE_SPARK = Object.freeze({
  x: 0.58,
  y: 0.68,
  width: 2,
  points: [
    [-8, -8],
    [-2, -2],
    [2, -9],
    [4, -1],
    [10, 3]
  ]
});
const SMOKE = Object.freeze({
  count: 2,
  rate: 0.36,
  phase: 0.5,
  opacity: 0.3,
  x: 0.42,
  xStep: 0.18,
  driftX: 4,
  y: 12,
  rise: 25,
  radiusX: 4,
  radiusY: 3,
  growth: 3
});
const SAND = Object.freeze({
  x: 0.51,
  y: 0.43,
  width: 1.8,
  length: 0.17,
  grainX: 1,
  grainY: 0.03,
  grainSize: 3
});
const SNAIL = Object.freeze({
  firstX: 0.68,
  firstY: 0.86,
  firstWidth: 7,
  secondX: 0.83,
  secondY: 0.88,
  secondWidth: 4,
  height: 2,
  strokeWidth: 2,
  shellX: 0.63,
  shellY: 0.55,
  radius: 12,
  rate: 0.7,
  sweep: 0.7
});
function hazardEffectState(kind, age, reducedMotion = false) {
  const time = reducedMotion ? 0 : age;
  return {
    time,
    beacon: EFFECT_MOTION.beaconOpacity + EFFECT_MOTION.beaconAmplitude * Math.sin(time * EFFECT_MOTION.beaconRate),
    spark: reducedMotion || Math.sin(time * EFFECT_MOTION.sparkRate) > EFFECT_MOTION.sparkThreshold,
    sand: time * EFFECT_MOTION.sandRate % 1,
    crawl: Math.sin(time * EFFECT_MOTION.crawlRate) * EFFECT_MOTION.crawlPixels
  };
}
function drawItemCue(ctx, kind, { x, y, w, h }) {
  if (kind !== "coffee" && kind !== "shield") return;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
  const cx = x + w / 2, cy = y + h / 2;
  const outlines = [
    ["#102c35", ITEM_CUE.backingWidth],
    [kind === "shield" ? "#6eeaff" : "#b9ff83", ITEM_CUE.outlineWidth]
  ];
  for (const [color, width] of outlines) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      w * ITEM_CUE.radiusRatio + ITEM_CUE.padding,
      h * ITEM_CUE.radiusRatio + ITEM_CUE.padding,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
  const bx = x + w + ITEM_CUE.badgeOffset, by = y + ITEM_CUE.badgeOffset;
  ctx.fillStyle = "#102c35";
  ctx.beginPath();
  ctx.arc(bx, by, ITEM_CUE.badgeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = ITEM_CUE.crossWidth;
  ctx.beginPath();
  ctx.moveTo(bx - ITEM_CUE.crossArm, by);
  ctx.lineTo(bx + ITEM_CUE.crossArm, by);
  ctx.moveTo(bx, by - ITEM_CUE.crossArm);
  ctx.lineTo(bx, by + ITEM_CUE.crossArm);
  ctx.stroke();
  ctx.restore();
}
function drawHazardEffects(ctx, kind, rect, age, reducedMotion = false) {
  const { x, y, w, h } = rect;
  const fx = hazardEffectState(kind, age, reducedMotion);
  ctx.save();
  if (kind === "coffee" || kind === "shield") {
    const cx = x + w / 2, cy = y + h / 2;
    const radius = Math.max(w, h) * ORBIT.radiusRatio;
    ctx.strokeStyle = kind === "shield" ? "#6eeaff" : "#b9ff83";
    for (let i = 0; i < ORBIT.count; i++) {
      const angle = fx.time * ORBIT.rate + i * Math.PI * 2 / ORBIT.count;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      ctx.fillStyle = "#f3ffe3";
      ctx.fillRect(
        px - ORBIT.halfSize,
        py - ORBIT.halfSize,
        ORBIT.size,
        ORBIT.size
      );
    }
  }
  if (kind === "gate") {
    ctx.fillStyle = `rgba(255, 186, 40, ${fx.beacon})`;
    for (const px of GATE_BEACON.centers) {
      ctx.beginPath();
      ctx.arc(
        x + w * px,
        y + h * GATE_BEACON.y,
        GATE_BEACON.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  if (kind === "cable" && fx.spark) {
    const cx = x + w * CABLE_SPARK.x, cy = y + h * CABLE_SPARK.y;
    ctx.strokeStyle = "#f7f9a9";
    ctx.lineWidth = CABLE_SPARK.width;
    ctx.beginPath();
    CABLE_SPARK.points.forEach(([px, py], index) => {
      if (index === 0) ctx.moveTo(cx + px, cy + py);
      else ctx.lineTo(cx + px, cy + py);
    });
    ctx.stroke();
  }
  if (kind === "server" || kind === "archive" || kind === "fan") {
    for (let i = 0; i < SMOKE.count; i++) {
      const drift = (fx.time * SMOKE.rate + i * SMOKE.phase) % 1;
      ctx.fillStyle = `rgba(188, 209, 222, ${SMOKE.opacity * (1 - drift)})`;
      ctx.beginPath();
      ctx.ellipse(
        x + w * (SMOKE.x + i * SMOKE.xStep) + drift * SMOKE.driftX,
        y + SMOKE.y - drift * SMOKE.rise,
        SMOKE.radiusX + drift * SMOKE.growth,
        SMOKE.radiusY + drift * SMOKE.growth,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  if (kind === "hourglass") {
    const cx = x + w * SAND.x, top = y + h * SAND.y;
    ctx.strokeStyle = "#ffdf88";
    ctx.lineWidth = SAND.width;
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx, top + h * SAND.length);
    ctx.stroke();
    ctx.fillStyle = "#fff3b7";
    ctx.fillRect(
      cx - SAND.grainX,
      top + h * (SAND.grainY + fx.sand * SAND.length),
      SAND.grainSize,
      SAND.grainSize
    );
  }
  if (kind === "slowdown") {
    ctx.fillStyle = "rgba(150, 245, 228, .55)";
    ctx.fillRect(
      x + w * SNAIL.firstX + fx.crawl,
      y + h * SNAIL.firstY,
      SNAIL.firstWidth,
      SNAIL.height
    );
    ctx.fillRect(
      x + w * SNAIL.secondX - fx.crawl,
      y + h * SNAIL.secondY,
      SNAIL.secondWidth,
      SNAIL.height
    );
    ctx.strokeStyle = "rgba(119, 238, 244, .65)";
    ctx.lineWidth = SNAIL.strokeWidth;
    ctx.beginPath();
    ctx.arc(
      x + w * SNAIL.shellX,
      y + h * SNAIL.shellY,
      SNAIL.radius,
      fx.time * SNAIL.rate,
      fx.time * SNAIL.rate + SNAIL.sweep
    );
    ctx.stroke();
  }
  ctx.restore();
}
export {
  drawHazardEffects,
  drawItemCue,
  hazardEffectState
};
