// Fraction of visible canvas height reserved for the upper jump region.
const JUMP_REGION_RATIO = 0.5;
// Use the visible canvas bounds, so the split remains stable at mobile sizes.

export function touchAction(
  bounds: { top: number; height: number },
  clientY: number
) {
  return clientY - bounds.top < bounds.height * JUMP_REGION_RATIO
    ? 'jump'
    : 'duck';
}

export function keyboardAction(code: string) {
  if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') return 'jump';
  if (code === 'ArrowDown' || code === 'KeyS') return 'duck';
  return null;
}

export function duckActive(held: boolean, now: number, minimumUntil: number) {
  return held || now < minimumUntil;
}
