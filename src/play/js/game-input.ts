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

export function focusPlayfield(canvas: HTMLCanvasElement) {
  canvas.focus({ preventScroll: true });
}

// Only the playfield owns game shortcuts. Native controls and editable content
// retain their normal keyboard behavior, including Space/Enter activation.
export function handleGameKey(
  event: KeyboardEvent,
  canvas: HTMLCanvasElement,
  activeElement: Element | null,
  actions: {
    jump(): void;
    duck(code: string): void;
    pause(): void;
    pauseRunning(): void;
  }
) {
  if (activeElement !== canvas) return;
  const action = keyboardAction(event.code);
  if (action || event.code === 'KeyP' || event.code === 'Escape')
    event.preventDefault();
  if (event.repeat) return;
  if (event.code === 'PrintScreen') actions.pauseRunning();
  else if (event.code === 'KeyP' || event.code === 'Escape') actions.pause();
  else if (action === 'jump') actions.jump();
  else if (action === 'duck') actions.duck(event.code);
}
