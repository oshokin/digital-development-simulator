// Use the visible canvas bounds, so the split remains stable at mobile sizes.
export function touchAction(bounds, clientY) {
  return clientY - bounds.top < bounds.height / 2 ? 'jump' : 'duck';
}

export function keyboardAction(code) {
  if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') return 'jump';
  if (code === 'ArrowDown' || code === 'KeyS') return 'duck';
  return null;
}

export function duckActive(held, now, minimumUntil) {
  return held || now < minimumUntil;
}
