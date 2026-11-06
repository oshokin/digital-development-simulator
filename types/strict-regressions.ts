// Compile-only contracts; never shipped or executed.
import { newMotion, startMotion } from '../src/play/js/animation.js';
import { checkpointTransition } from '../src/play/js/game-flow.js';
import type { GameState, WorldItem } from '../src/play/js/types.js';

declare const state: GameState;
state.mode = 'running';
state.route = 'white';
state.ending = 'good';
// @ts-expect-error Unknown game modes must not enter mutable state.
state.mode = 'playing';
// @ts-expect-error Route values are authored choices, not arbitrary strings.
state.route = 'private';
// @ts-expect-error Ending results differ from final-choice input values.
state.ending = 'open';
// @ts-expect-error Motion phases must be known animation states.
startMotion(newMotion(), 'flying');
// @ts-expect-error World items require an authored hazard or pickup kind.
const invalidItem: WorldItem = { kind: 'coin', x: 0, age: 0, taken: false };
// @ts-expect-error A complete state cannot omit mutable runtime fields.
const incompleteState: GameState = { mode: 'start' };
const transition = checkpointTransition(state, 10);
if (transition?.mode === 'interlude') transition.stage.toFixed();
if (transition?.mode === 'route') {
  // @ts-expect-error Route transitions do not carry a stage destination.
  transition.stage;
}
void invalidItem;
void incompleteState;
import type { Translation, Language } from '../src/site/js/site.js';
import type { PropConfig } from '../src/play/js/types.js';
// @ts-expect-error Unsupported portfolio languages cannot index translations.
const invalidLanguage: Language = 'fr';
// @ts-expect-error Every portfolio translation requires the complete English key set.
const incompleteTranslation: Translation = { hero1: 'Hello' };
// @ts-expect-error Geometry dimensions must remain numeric.
const invalidConfig: PropConfig = { w: 'wide', h: 10 };
void invalidLanguage;
void incompleteTranslation;
void invalidConfig;
