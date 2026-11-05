import { STAGES as originalStages, TEXT as originalText } from './game-data.js';

// One flying drone uses the animated scanner art throughout the game.
export const NEW_HAZARDS = ['stamp', 'lock', 'drone', 'hourglass', 'gate', 'permit', 'archive', 'slowdown', 'sovereign'];
export const ANIMAL_HAZARDS = ['bear', 'orca', 'tiger'];
export const WILDLIFE_HAZARDS = ['polarBear', 'glider', 'crane'];
const additions = [
  ['stamp', 'lock', 'archive', 'bear', 'polarBear'],
  ['drone', 'permit', 'sovereign', 'orca', 'glider'],
  ['drone', 'hourglass', 'slowdown', 'tiger', 'crane'],
  ['gate', 'permit', 'lock', 'sovereign', 'bear', 'orca', 'polarBear', 'crane'],
  ['stamp', 'lock', 'drone', 'hourglass', 'gate', 'permit', 'archive', 'slowdown', 'sovereign', 'bear', 'orca', 'tiger', 'polarBear', 'glider', 'crane']
];
export const STAGES = originalStages.map((stage, index) => ({
  ...stage,
  obstacles: [...new Set([...stage.obstacles, ...additions[index]])]
}));
const modes = {
  en: { modeLabel:'MODE', endlessLabel:'∞ / ENDLESS RUN', timeLabel:'TIME', restartEndless:'RESTART RUN', endlessDownTitle:'RUN OVER', endlessDownBody:'No checkpoints here. Start a new run.', downTitle:'LEVEL FAILED', downBody:'Restart this level or begin the campaign again.', restartLevel:'RESTART LEVEL', restartGame:'RESTART GAME', newEndlessRun:'START A NEW RUN' },
  ru: { modeLabel:'РЕЖИМ', endlessLabel:'∞ / БЕСКОНЕЧНЫЙ ЗАБЕГ', timeLabel:'ВРЕМЯ', restartEndless:'НАЧАТЬ ЗАНОВО', endlessDownTitle:'ЗАБЕГ ОКОНЧЕН', endlessDownBody:'Контрольных точек нет. Начни новый забег.', downTitle:'УРОВЕНЬ НЕ ПРОЙДЕН', downBody:'Начни этот уровень или всю игру заново.', restartLevel:'НАЧАТЬ УРОВЕНЬ ЗАНОВО', restartGame:'НАЧАТЬ ИГРУ ЗАНОВО', newEndlessRun:'НАЧАТЬ НОВЫЙ ЗАБЕГ' },
  es: { modeLabel:'MODO', endlessLabel:'∞ / CARRERA INFINITA', timeLabel:'TIEMPO', restartEndless:'REINICIAR CARRERA', endlessDownTitle:'FIN DE LA CARRERA', endlessDownBody:'Aquí no hay puntos de control. Empieza otra carrera.', downTitle:'NIVEL FALLIDO', downBody:'Reinicia este nivel o toda la campaña.', restartLevel:'REINICIAR NIVEL', restartGame:'REINICIAR JUEGO', newEndlessRun:'INICIAR OTRA CARRERA' }
};
export const TEXT = Object.fromEntries(Object.entries(originalText).map(([lang, strings]) => [lang, { ...strings, ...modes[lang] }]));
