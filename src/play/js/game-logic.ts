// Score points awarded for completing the public route with the good ending.
const PUBLIC_ROUTE_SCORE = 2000;

export function intersects(
  a: import('./types.js').Rect,
  b: import('./types.js').Rect,
  inset: number = 0
) {
  return (
    a.x + inset < b.x + b.w &&
    a.x + a.w - inset > b.x &&
    a.y + inset < b.y + b.h &&
    a.y + a.h - inset > b.y
  );
}

export function stageForTime(seconds: number, durations: number[]) {
  let left = seconds;
  for (let index = 0; index < durations.length; index++) {
    if (left < durations[index]) return index;
    left -= durations[index];
  }
  return durations.length;
}

export function chooseEnding(choice: 'open' | 'committee'): 'good' | 'bad' {
  if (choice !== 'open' && choice !== 'committee')
    throw new Error('Unknown ending');
  return choice === 'open' ? 'good' : 'bad';
}

export function scoreForRoute(route: 'public' | 'white' | null) {
  return route === 'public' ? PUBLIC_ROUTE_SCORE : 0;
}
