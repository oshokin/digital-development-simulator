// The road starts ten pixels below the grass stripe painted at `floor`.
export const ROAD_OFFSET = 10;
export function obstacleArtRect(item, prop, floor) {
  const overhead = item.kind === 'drone' || prop.overhead;
  const bonus = item.kind === 'shield' || item.kind === 'coffee';
  const baseY = overhead ? floor - 225 : bonus ? floor - 282 : floor + ROAD_OFFSET - 110;
  return { x: item.x - 13, y: baseY + (prop.artBottomInset ?? 9), w: 110, h: prop.artHeight || 110 };
}

export function obstacleBox(item, prop, floor) {
  if (item.kind === 'drone' || prop.overhead) {
    return { x: item.x + 8, y: floor - 195, w: prop.w - 15, h: 70 };
  }
  if (item.kind === 'shield' || item.kind === 'coffee') {
    return { x: item.x + 8, y: floor - 256, w: 45, h: 80 };
  }
  return { x: item.x + 9, y: floor + ROAD_OFFSET - prop.h + 1, w: prop.w - 16, h: prop.h - 7 };
}

export function playerBox(playerX, floor, jumpHeight, duck) {
  return duck
    ? { x: playerX + 2, y: floor - 112 + ROAD_OFFSET, w: 66, h: 104 }
    : { x: playerX + 8, y: floor - 170 + ROAD_OFFSET - jumpHeight, w: 58, h: 162 };
}

export function shieldHeadPoint(playerX, floor, jumpHeight, duck) {
  return { x: playerX + 45, y: floor + ROAD_OFFSET - (duck ? 140 : 198) - jumpHeight };
}
