// Generated from src/ by npm run build. Do not edit.
const JUMP_REGION_RATIO = 0.5;
function touchAction(bounds, clientY) {
  return clientY - bounds.top < bounds.height * JUMP_REGION_RATIO ? "jump" : "duck";
}
function keyboardAction(code) {
  if (code === "Space" || code === "ArrowUp" || code === "KeyW") return "jump";
  if (code === "ArrowDown" || code === "KeyS") return "duck";
  return null;
}
function duckActive(held, now, minimumUntil) {
  return held || now < minimumUntil;
}
function focusPlayfield(canvas) {
  canvas.focus({ preventScroll: true });
}
function handleGameKey(event, canvas, activeElement, actions) {
  if (activeElement !== canvas) return;
  const action = keyboardAction(event.code);
  if (action || event.code === "KeyP" || event.code === "Escape")
    event.preventDefault();
  if (event.repeat) return;
  if (event.code === "PrintScreen") actions.pauseRunning();
  else if (event.code === "KeyP" || event.code === "Escape") actions.pause();
  else if (action === "jump") actions.jump();
  else if (action === "duck") actions.duck(event.code);
}
export {
  duckActive,
  focusPlayfield,
  handleGameKey,
  keyboardAction,
  touchAction
};
