// Generated from src/ by npm run build. Do not edit.
const ROAD_OFFSET = 10;
const ART = Object.freeze({
  overheadRise: 225,
  bonusRise: 282,
  size: 110,
  leftInset: 13,
  bottomInset: 9
});
const COLLISION = Object.freeze({
  overhead: Object.freeze({ x: 8, rise: 195, widthTrim: 15, height: 70 }),
  bonus: Object.freeze({ x: 8, rise: 256, width: 45, height: 80 }),
  ground: Object.freeze({ x: 9, y: 1, widthTrim: 16, heightTrim: 7 }),
  duck: Object.freeze({ x: 2, rise: 112, width: 66, height: 104 }),
  standing: Object.freeze({ x: 8, rise: 170, width: 58, height: 162 })
});
const SHIELD_HEAD = Object.freeze({ x: 45, duckRise: 140, standingRise: 198 });
function obstacleArtRect(item, prop, floor) {
  const overhead = item.kind === "drone" || prop.overhead;
  const bonus = item.kind === "shield" || item.kind === "coffee";
  const baseY = overhead ? floor - ART.overheadRise : bonus ? floor - ART.bonusRise : floor + ROAD_OFFSET - ART.size;
  return {
    x: item.x - ART.leftInset,
    y: baseY + (prop.artBottomInset ?? ART.bottomInset),
    w: ART.size,
    h: prop.artHeight || ART.size
  };
}
function obstacleBox(item, prop, floor) {
  if (item.kind === "drone" || prop.overhead) {
    return {
      x: item.x + COLLISION.overhead.x,
      y: floor - COLLISION.overhead.rise,
      w: prop.w - COLLISION.overhead.widthTrim,
      h: COLLISION.overhead.height
    };
  }
  if (item.kind === "shield" || item.kind === "coffee") {
    return {
      x: item.x + COLLISION.bonus.x,
      y: floor - COLLISION.bonus.rise,
      w: COLLISION.bonus.width,
      h: COLLISION.bonus.height
    };
  }
  return {
    x: item.x + COLLISION.ground.x,
    y: floor + ROAD_OFFSET - prop.h + COLLISION.ground.y,
    w: prop.w - COLLISION.ground.widthTrim,
    h: prop.h - COLLISION.ground.heightTrim
  };
}
function playerBox(playerX, floor, jumpHeight, duck) {
  return duck ? {
    x: playerX + COLLISION.duck.x,
    y: floor - COLLISION.duck.rise + ROAD_OFFSET,
    w: COLLISION.duck.width,
    h: COLLISION.duck.height
  } : {
    x: playerX + COLLISION.standing.x,
    y: floor - COLLISION.standing.rise + ROAD_OFFSET - jumpHeight,
    w: COLLISION.standing.width,
    h: COLLISION.standing.height
  };
}
function shieldHeadPoint(playerX, floor, jumpHeight, duck) {
  return {
    x: playerX + SHIELD_HEAD.x,
    y: floor + ROAD_OFFSET - (duck ? SHIELD_HEAD.duckRise : SHIELD_HEAD.standingRise) - jumpHeight
  };
}
export {
  ROAD_OFFSET,
  obstacleArtRect,
  obstacleBox,
  playerBox,
  shieldHeadPoint
};
