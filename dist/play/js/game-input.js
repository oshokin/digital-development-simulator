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
export {
  duckActive,
  keyboardAction,
  touchAction
};
