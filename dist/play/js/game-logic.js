// Generated from src/ by npm run build. Do not edit.
const PUBLIC_ROUTE_SCORE = 2e3;
function intersects(a, b, inset = 0) {
  return a.x + inset < b.x + b.w && a.x + a.w - inset > b.x && a.y + inset < b.y + b.h && a.y + a.h - inset > b.y;
}
function stageForTime(seconds, durations) {
  let left = seconds;
  for (let index = 0; index < durations.length; index++) {
    if (left < durations[index]) return index;
    left -= durations[index];
  }
  return durations.length;
}
function chooseEnding(choice) {
  if (choice !== "open" && choice !== "committee")
    throw new Error("Unknown ending");
  return choice === "open" ? "good" : "bad";
}
function scoreForRoute(route) {
  return route === "public" ? PUBLIC_ROUTE_SCORE : 0;
}
export {
  chooseEnding,
  intersects,
  scoreForRoute,
  stageForTime
};
