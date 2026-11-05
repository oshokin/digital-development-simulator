export function intersects(a, b, inset = 0) {
  return a.x + inset < b.x + b.w && a.x + a.w - inset > b.x && a.y + inset < b.y + b.h && a.y + a.h - inset > b.y;
}

export function stageForTime(seconds, durations) {
  let left = seconds;
  for (let index = 0; index < durations.length; index++) {
    if (left < durations[index]) return index;
    left -= durations[index];
  }
  return durations.length;
}

export function chooseEnding(choice) {
  if (choice !== 'open' && choice !== 'committee') throw new Error('Unknown ending');
  return choice === 'open' ? 'good' : 'bad';
}

export function scoreForRoute(route) {
  return route === 'public' ? 2000 : 0;
}
