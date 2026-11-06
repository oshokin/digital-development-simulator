// Generated from src/ by npm run build. Do not edit.
import {
  getLanguage,
  themeLabel,
  effectiveTheme,
  cycleTheme,
  initPreferences
} from "../../shared/js/preferences.js";
import { STAGES, TEXT } from "./game-world.js";
import { intersects, chooseEnding, scoreForRoute } from "./game-logic.js";
import {
  newMotion,
  startMotion,
  advanceMotion,
  poseFor,
  FOOT_ANCHOR
} from "./animation.js";
import { paceFor } from "./game-pace.js";
import {
  checkpointTransition,
  elapsedLabel,
  recoveryOptions,
  chooseSpawn,
  canCollectBonus
} from "./game-flow.js";
import {
  obstacleArtRect,
  obstacleBox,
  playerBox as runnerBox,
  shieldHeadPoint,
  ROAD_OFFSET
} from "./game-geometry.js";
import {
  bindAudioControls,
  setAudioRunning,
  restartMusic,
  playEffect
} from "./game-audio.js";
import { hazardPose } from "./hazard-animation.js";
import { hazardLayouts } from "./hazard-layout.js";
import {
  createBackgroundLoader,
  createSceneGate
} from "./background-loader.js?v=decoded-scenes-2";
import { drawHazardEffects, drawItemCue } from "./hazard-effects.js";
import {
  touchAction,
  keyboardAction,
  duckActive,
  focusPlayfield,
  handleGameKey
} from "./game-input.js";
const JUMP_VELOCITY = 790;
const GRAVITY = 1880;
const MIN_DUCK_SECONDS = 0.42;
const TOAST_SECONDS = 2.6;
const RUN_SCORE_PER_SECOND = 11;
const BONUS_SCORE = 80;
const COLLISION_INSET = 7;
const HIT_INVULNERABILITY_SECONDS = 1.4;
const SPAWN_MARGIN = 34;
const DESPAWN_X = -130;
const WHITE_ROUTE_STAGE = 3;
const WHITE_ROUTE_SPAWN = Object.freeze({ delay: 1.75, jitter: 0.8 });
const VIEWPORT = Object.freeze({
  desktopWidth: 960,
  desktopHeight: 540,
  initialFloor: 442,
  initialPlayerX: 148,
  mobileWidth: 640,
  mobileHeight: 650,
  floorMargin: 98,
  mobilePlayerX: 80,
  desktopPlayerX: 150,
  maxDpr: 2
});
const RUN_START = Object.freeze({
  spawnSeconds: 2.4,
  lives: 3,
  bonusCooldown: 2
});
const RUN_FRAME_COUNT = 6;
const PLAYER_ART = Object.freeze({
  size: 190,
  defaultFoot: 331,
  sourceHeight: 362,
  roadInset: 2,
  leftOffset: 56,
  shakeRate: 75,
  shakePixels: 3
});
const CAMERA = Object.freeze({
  xRate: 0.12,
  yRate: 0.09,
  stagePhase: 0.7,
  xPixels: 14,
  yPixels: 7
});
const BEACONS = Object.freeze({
  paperwork: [
    [114, 150],
    [1142, 189]
  ],
  other: [
    [115, 46],
    [1110, 46]
  ],
  sourceWidth: 1254,
  sourceHeight: 706,
  opacity: 0.24,
  pulseOpacity: 0.2,
  pulseRate: 1.7,
  floorClearance: 90,
  radius: 2.2
});
const ROAD = Object.freeze({
  tintStop: 0.65,
  speedRatio: 0.28,
  spacing: 88,
  y: 34,
  width: 52,
  height: 4
});
const FRAME_TIME = Object.freeze({
  millisecondsPerSecond: 1e3,
  maxSeconds: 0.035
});
const HIT_BLINK_RATE = 13;
const SHIELD_ART = Object.freeze({
  duckX: 43,
  standingX: 46,
  duckRise: 47,
  standingRise: 87,
  duckRadiusX: 92,
  standingRadiusX: 88,
  duckRadiusY: 57,
  standingRadiusY: 98,
  pulse: 0.75,
  pulseRate: 4.5,
  pulseAmplitude: 0.2,
  blur: 18,
  innerRadius: 0.18,
  gradientStop: 0.7,
  auraOpacity: 0.05,
  groundOpacity: 0.42,
  groundPulseOpacity: 0.2,
  lineWidth: 2,
  groundRise: 2,
  groundRadiusRatio: 0.72,
  groundRadiusY: 8,
  leftNodeY: 0.08,
  rightNodeY: 0.12,
  nodeRadius: 2.5,
  nodeLineWidth: 1.5,
  nodeRingRadius: 7,
  nodePulseRadius: 2,
  headBlur: 15,
  headRadius: 4,
  headLineWidth: 2,
  headRingRadius: 9,
  headPulseRate: 5,
  headPulseRadius: 1.5
});
const PROPELLER = Object.freeze({
  glider: [[0.78, 0.56]],
  drone: [
    [0.16, 0.25],
    [0.81, 0.25],
    [0.23, 0.43],
    [0.75, 0.43]
  ],
  rate: 28,
  width: 2,
  radiusX: 8,
  radiusY: 5
});
const SCANNER = Object.freeze({
  opacity: 0.08,
  amplitude: 0.1,
  rate: 12,
  topX: 0.63,
  topY: 0.48,
  rightX: 0.94,
  leftX: 0.48
});
const HUD_ART = Object.freeze({
  x: 20,
  y: 20,
  horizontalMargin: 40,
  width: 300,
  height: 48,
  textX: 32,
  textY: 49,
  textMargin: 65,
  textWidth: 278,
  progressHeight: 6,
  bossRight: 110,
  bossY: 48
});
const HUD_DIGITS = Object.freeze({ stage: 2, score: 4, pace: 1 });
const CAMPAIGN = Object.freeze({ finalStage: 4, routeStage: 3 });
const MOBILE_BREAKPOINT = 600;
initPreferences();
const $ = (id) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element: ${id}`);
  return element;
};
let displayedLanguage = getLanguage();
const refreshAudioLabels = bindAudioControls(
  $("music-toggle"),
  $("effects-toggle"),
  () => displayedLanguage
);
const canvasElement = $("game-canvas");
if (!(canvasElement instanceof HTMLCanvasElement))
  throw new Error("Game canvas must be a canvas element");
const canvas = canvasElement;
const context = canvas.getContext("2d");
if (!context) throw new Error("Canvas 2D context unavailable");
const ctx = context;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const images = {};
const spriteNames = [
  "max-duck",
  "max-hit",
  "max-defeat",
  "calendar",
  "glider",
  "stamp",
  "lock",
  "drone",
  "gate",
  "archive",
  "slowdown",
  "sovereign",
  ...[...Array(RUN_FRAME_COUNT)].map((_, i) => `max-run-${i}`),
  "max-jump-takeoff",
  "max-jump-air",
  "max-jump-land"
];
for (const name of spriteNames) {
  const img = new Image();
  const category = name.startsWith("max-") ? "character" : "hazards";
  img.src = `/assets/game/sprites/${category}/${name}.webp`;
  images[name] = img;
}
const animationSheets = Object.fromEntries(
  [
    ["bear", "bear"],
    ["polar-bear", "polar-bear"],
    ["orca", "orca"],
    ["tiger", "tiger"],
    ["crane", "crane"],
    ["hourglass", "hourglass"],
    ["permit", "permit"],
    ["server", "server"],
    ["cable", "cable"],
    ["exposed-cable", "exposed-cable"],
    ["coffee", "coffee"],
    ["shield", "shield"],
    ["barrier", "barrier"],
    ["gate", "gate"],
    ["cone", "cone"],
    ["fan", "fan"],
    ["paper", "paper"],
    ["crate", "crate"]
  ].map(([key, filename]) => {
    const img = new Image();
    const category = key === "coffee" || key === "shield" ? "perks" : "hazards";
    img.src = `/assets/game/sprites/${category}/${filename}.webp`;
    return [key, img];
  })
);
const stageBackgrounds = [
  "scene-paperwork",
  "scene-infrastructure",
  "scene-cloud",
  "scene-whitelist",
  "scene-rkn9000"
];
const loadSceneBackground = createBackgroundLoader(
  () => new Image(),
  (name, language) => `/assets/game/backgrounds/${name}${language === "ru" ? "" : `-${language}`}.webp`
);
const spriteReady = Promise.all(
  [...Object.values(images), ...Object.values(animationSheets)].map(
    (img) => new Promise((resolve) => {
      const loaded = () => {
        if (img.decode && img.naturalWidth)
          img.decode().catch(() => {
          }).then(resolve);
        else resolve();
      };
      if (img.complete) loaded();
      else {
        img.addEventListener("load", loaded, { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      }
    })
  )
);
const loadBackground = (name, language, retry = false) => {
  const entry = loadSceneBackground(name, language, retry);
  return {
    ...entry,
    ready: Promise.all([entry.ready, spriteReady]).then(
      ([background]) => background
    )
  };
};
const endlessObstacles = [...new Set(STAGES.flatMap((stage) => stage.obstacles))];
const scene = createSceneGate(loadBackground, () => {
  if (!scene.pending && scene.current) {
    displayedLanguage = scene.current.language;
    $("toast").classList.remove("show");
  }
  setAudioRunning(state.mode === "running" && !scene.pending);
  localizeStatic();
});
function requestScene() {
  return scene.request(
    state.endless ? "scene-endless" : stageBackgrounds[state.stage],
    getLanguage()
  );
}
const loadingText = {
  en: ["Loading scene…", "Scene could not be loaded.", "Retry"],
  ru: ["Загрузка сцены…", "Не удалось загрузить сцену.", "Повторить"],
  es: ["Cargando escena…", "No se pudo cargar la escena.", "Reintentar"]
};
let W = VIEWPORT.desktopWidth;
let H = VIEWPORT.desktopHeight;
let floor = VIEWPORT.initialFloor;
let playerX = VIEWPORT.initialPlayerX;
const state = {
  mode: "start",
  stage: 0,
  elapsed: 0,
  total: 0,
  spawnIn: RUN_START.spawnSeconds,
  score: 0,
  checkpointScore: 0,
  checkpointTotal: 0,
  lives: RUN_START.lives,
  shield: false,
  route: null,
  endless: false,
  jumpHeight: 0,
  velocity: 0,
  duck: false,
  invulnerable: 0,
  objects: [],
  ambience: 0,
  toastTimer: 0,
  ending: null,
  motion: newMotion(),
  duckUntil: 0,
  spawnState: {
    cooldown: RUN_START.bonusCooldown,
    lastObstacle: null,
    lastBonus: null,
    lastLane: null,
    laneStreak: 0
  }
};
function t(key) {
  return TEXT[displayedLanguage][key];
}
function resize() {
  const small = matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  W = small ? VIEWPORT.mobileWidth : VIEWPORT.desktopWidth;
  H = small ? VIEWPORT.mobileHeight : VIEWPORT.desktopHeight;
  floor = H - VIEWPORT.floorMargin;
  playerX = small ? VIEWPORT.mobilePlayerX : VIEWPORT.desktopPlayerX;
  const dpr = Math.min(devicePixelRatio || 1, VIEWPORT.maxDpr);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);
function localizeStatic() {
  document.documentElement.lang = displayedLanguage;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && key in TEXT[displayedLanguage]) {
      const value = TEXT[displayedLanguage][key];
      if (typeof value === "string") el.textContent = value;
    }
  });
  document.title = displayedLanguage === "ru" ? "Беги, Макс, беги — Олег Шокин" : "Digital Development Simulator — Oleg Shokin";
  $("year").textContent = String((/* @__PURE__ */ new Date()).getFullYear());
  updateThemeLabel();
  refreshAudioLabels();
  updateHUD();
  renderOverlay();
}
function updateThemeLabel() {
  $("theme-name").textContent = themeLabel(displayedLanguage);
}
$("theme-cycle").addEventListener("click", () => {
  cycleTheme();
  updateThemeLabel();
});
document.addEventListener("app:language", requestScene);
document.addEventListener("app:theme", updateThemeLabel);
document.querySelector(".header-tools")?.addEventListener("click", (event) => {
  if (event instanceof MouseEvent && event.detail > 0 && event.target instanceof Element && event.target.closest(
    "#music-toggle, #effects-toggle, #theme-cycle, button[data-lang-choice]"
  ))
    focusPlayfield(canvas);
});
function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  state.toastTimer = TOAST_SECONDS;
}
function updateHUD() {
  ($("hud-level-label") || document.querySelector('[data-i18n="level"]')).textContent = t(state.endless ? "modeLabel" : "level");
  $("hud-level").textContent = state.endless ? "∞" : `${String(state.stage + 1).padStart(HUD_DIGITS.stage, "0")}/05`;
  $("hud-score").textContent = String(Math.floor(state.score)).padStart(
    HUD_DIGITS.score,
    "0"
  );
  $("hud-lives").textContent = "♥ ".repeat(state.lives).trim() || "—";
  $("scene-label").textContent = state.endless ? t("endlessLabel") : `${String(state.stage + 1).padStart(HUD_DIGITS.stage, "0")} / ${t("stageNames")[state.stage]}`;
  $("scene-progress").textContent = state.endless ? "" : STAGES.map((_, i) => i <= state.stage ? "●" : "○").join(" ");
  $("route-label").textContent = state.endless ? `${t("timeLabel")} ${elapsedLabel(state.total)}` : t(
    state.route === "public" ? "routePublic" : state.route === "white" ? "routeWhite" : "routeNone"
  );
  const pace = paceFor(state.total);
  $("status-text").textContent = state.mode === "running" ? `${t("statusRun")} ×${pace.multiplier.toFixed(HUD_DIGITS.pace)}` : t(state.mode === "paused" ? "statusPause" : "statusReady");
  $("pause-button").textContent = state.mode === "paused" ? t("resume") : t("pause");
  $("pause-button").setAttribute(
    "aria-label",
    state.mode === "paused" ? t("resume") : t("pause")
  );
}
function overlay(kicker, title, body, actions, foot = "") {
  $("overlay").hidden = false;
  $("overlay-kicker").textContent = kicker;
  $("overlay-kicker").hidden = !kicker;
  $("overlay-title").textContent = title;
  $("overlay-body").textContent = body;
  $("overlay-body").hidden = !body;
  $("overlay-foot").textContent = foot;
  $("overlay-foot").hidden = !foot;
  const area = $("overlay-actions");
  area.replaceChildren();
  for (const [label, callback, secondary] of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (secondary) button.className = "secondary";
    button.addEventListener("click", callback);
    area.append(button);
  }
}
function renderOverlay() {
  if (scene.pending) {
    const labels = loadingText[scene.current ? displayedLanguage : getLanguage()];
    overlay(
      "",
      labels[scene.failed ? 1 : 0],
      "",
      scene.failed ? [[labels[2], () => scene.retry()]] : []
    );
    return;
  }
  const mode = state.mode;
  if (mode === "running") {
    $("overlay").hidden = true;
    return;
  }
  if (mode === "start")
    overlay(
      "SYSTEM NOTICE / 001",
      t("startTitle"),
      t("startBody"),
      [
        [t("startButton"), startGame],
        [t("endless"), startEndless, true]
      ],
      t("startFoot")
    );
  if (mode === "interlude")
    overlay(
      `${String(state.stage + 1).padStart(HUD_DIGITS.stage, "0")} / 05`,
      t("checkpointTitle"),
      t("stageQuips")[state.stage],
      [[t("continue"), beginStage]],
      t("stageIntros")[state.stage]
    );
  if (mode === "route")
    overlay(
      "FORM / 004",
      t("routeTitle"),
      t("routeBody"),
      [
        [t("routeOpenButton"), () => selectRoute("public")],
        [t("routeWhiteButton"), () => selectRoute("white"), true]
      ],
      `${t("routeOpenFoot")}   /   ${t("routeWhiteFoot")}`
    );
  if (mode === "final")
    overlay(
      "RKN-9000 / DECISION",
      t("finalTitle"),
      t("finalBody"),
      [
        [t("finalGood"), () => finish("open")],
        [t("finalBad"), () => finish("committee"), true]
      ],
      t("stageQuips")[CAMPAIGN.finalStage]
    );
  if (mode === "ending")
    overlay(
      state.ending === "good" ? "ENDING / OPEN" : "ENDING / COMMITTEE",
      t(state.ending === "good" ? "goodTitle" : "badTitle"),
      t(state.ending === "good" ? "goodBody" : "badBody"),
      [
        [t("restartGame"), startGame],
        [t("endless"), startEndless, true]
      ],
      `SCORE / ${Math.floor(state.score).toLocaleString()}`
    );
  if (mode === "paused")
    overlay("SYSTEM / PAUSED", t("pauseTitle"), t("pauseBody"), [
      [t("resume"), resume],
      [t(state.endless ? "newEndlessRun" : "restartLevel"), retryStage, true]
    ]);
  if (mode === "down") {
    const callbacks = {
      newEndlessRun: retryStage,
      restartLevel: retryStage,
      restartGame: startGame
    };
    const actions = recoveryOptions(state.endless).map(
      (key, index) => [t(key), callbacks[key], index > 0]
    );
    overlay(
      "",
      t(state.endless ? "endlessDownTitle" : "downTitle"),
      "",
      actions
    );
  }
}
function setMode(mode) {
  state.mode = mode;
  setAudioRunning(mode === "running" && !scene.pending);
  updateHUD();
  renderOverlay();
  if (mode === "running") focusPlayfield(canvas);
}
function resetRun(endless = false) {
  Object.assign(state, {
    stage: 0,
    score: 0,
    checkpointScore: 0,
    checkpointTotal: 0,
    route: null,
    total: 0,
    endless,
    ending: null,
    spawnState: {
      cooldown: RUN_START.bonusCooldown,
      lastObstacle: null,
      lastBonus: null,
      lastLane: null,
      laneStreak: 0
    }
  });
  restartMusic();
  beginStage();
}
function startGame() {
  resetRun(false);
}
function startEndless() {
  resetRun(true);
}
function beginStage() {
  Object.assign(state, {
    elapsed: 0,
    spawnIn: RUN_START.spawnSeconds,
    lives: RUN_START.lives,
    shield: false,
    jumpHeight: 0,
    velocity: 0,
    duck: false,
    duckUntil: 0,
    invulnerable: 0,
    objects: [],
    checkpointScore: state.score,
    checkpointTotal: state.total,
    motion: newMotion()
  });
  setMode("running");
  requestScene();
  if (!state.endless && state.stage < stageBackgrounds.length - 1)
    loadBackground(stageBackgrounds[state.stage + 1], getLanguage());
  toast(state.endless ? t("endlessBody") : t("stageIntros")[state.stage]);
}
function retryStage() {
  if (state.endless) resetRun(true);
  else {
    state.score = state.checkpointScore;
    state.total = state.checkpointTotal;
    beginStage();
  }
}
function selectRoute(route) {
  state.route = route;
  state.stage = CAMPAIGN.routeStage;
  setMode("interlude");
  requestScene();
}
function finish(choice) {
  state.ending = chooseEnding(choice);
  if (state.ending === "good") state.score += scoreForRoute(state.route);
  setMode("ending");
}
function resume() {
  setMode("running");
}
function togglePause() {
  if (state.mode === "running") setMode("paused");
  else if (state.mode === "paused") resume();
}
function pauseRunning() {
  if (state.mode === "running") {
    duckPointers.clear();
    duckKeys.clear();
    state.duckUntil = state.total;
    state.duck = false;
    setMode("paused");
  }
}
$("pause-button").addEventListener("click", togglePause);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseRunning();
});
window.addEventListener("blur", pauseRunning);
function jump() {
  if (scene.pending) return;
  if (state.mode !== "running" || state.jumpHeight > 0 || state.duck || state.motion.phase === "hit")
    return;
  state.velocity = JUMP_VELOCITY;
  state.motion = startMotion(state.motion, "takeoff");
  playEffect("jump");
}
function duck(on) {
  if (scene.pending) return;
  if (state.mode !== "running") return;
  const next = on && state.jumpHeight === 0;
  if (next === state.duck) return;
  state.duck = next;
  if (state.motion.phase !== "hit")
    state.motion = startMotion(state.motion, next ? "duck-enter" : "duck-exit");
  if (next) playEffect("duck");
}
const duckKeys = /* @__PURE__ */ new Set();
function requestDuck() {
  if (state.mode !== "running") return;
  state.duckUntil = Math.max(state.duckUntil, state.total + MIN_DUCK_SECONDS);
  duck(true);
}
window.addEventListener("keydown", (e) => {
  handleGameKey(e, canvas, document.activeElement, {
    jump: () => {
      if (state.mode === "start") startGame();
      else jump();
    },
    duck: (code) => {
      duckKeys.add(code);
      requestDuck();
    },
    pause: togglePause,
    pauseRunning
  });
});
window.addEventListener("keyup", (e) => {
  if (e.code === "PrintScreen") pauseRunning();
  if (keyboardAction(e.code) === "duck") duckKeys.delete(e.code);
});
const duckPointers = /* @__PURE__ */ new Set();
for (const event of ["contextmenu", "selectstart", "dragstart"]) {
  canvas.addEventListener(event, (e) => e.preventDefault());
}
canvas.addEventListener("touchstart", (e) => e.preventDefault(), {
  passive: false
});
canvas.tabIndex = 0;
canvas.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  focusPlayfield(canvas);
  if (state.mode !== "running" || e.pointerType === "mouse" && e.button !== 0)
    return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  if (touchAction(rect, e.clientY) === "jump") {
    jump();
    return;
  }
  duckPointers.add(e.pointerId);
  canvas.setPointerCapture(e.pointerId);
  requestDuck();
});
function releaseDuckPointer(e) {
  if (e instanceof PointerEvent) duckPointers.delete(e.pointerId);
}
for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
  canvas.addEventListener(event, releaseDuckPointer);
const props = {
  paper: { w: 72, h: 56, artBottomInset: 9 },
  fan: { w: 86, h: 62, artBottomInset: 16 },
  server: { w: 65, h: 74, artBottomInset: 3 },
  barrier: { w: 80, h: 47, artBottomInset: 14 },
  drone: { w: 86, h: 47, overhead: true, artHeight: 100, artBottomInset: 8 },
  shield: { w: 65, h: 65, artBottomInset: 16 },
  coffee: { w: 61, h: 55, artBottomInset: 17 },
  cone: { w: 62, h: 58, artBottomInset: 19 },
  calendar: { image: "calendar", w: 76, h: 55, artBottomInset: 15 },
  camera: { w: 72, h: 70, artBottomInset: 27 },
  crate: { w: 76, h: 66, artBottomInset: 16 },
  cable: { w: 84, h: 43, artBottomInset: 9 },
  stamp: { w: 74, h: 72 },
  lock: { w: 78, h: 80 },
  hourglass: { w: 68, h: 76 },
  gate: { w: 82, h: 69 },
  permit: { w: 76, h: 72 },
  archive: { w: 76, h: 83 },
  slowdown: { w: 70, h: 79 },
  sovereign: { w: 78, h: 88 },
  bear: { w: 82, h: 88 },
  orca: { w: 86, h: 81 },
  tiger: { w: 85, h: 57, overhead: true, artHeight: 100 },
  polarBear: { w: 86, h: 86 },
  glider: { image: "glider", w: 87, h: 56, overhead: true, artHeight: 100 },
  crane: { w: 86, h: 52, overhead: true, artHeight: 100 }
};
function spawn() {
  const stage = STAGES[state.stage];
  const pool = state.endless ? endlessObstacles : stage.obstacles;
  const { kind, next } = chooseSpawn(
    pool,
    state.spawnState,
    Math.random,
    state
  );
  state.spawnState = next;
  state.objects.push({ kind, x: W + SPAWN_MARGIN, age: 0, taken: false });
  const easy = state.stage === WHITE_ROUTE_STAGE && state.route === "white";
  const pace = paceFor(state.total);
  state.spawnIn = easy ? WHITE_ROUTE_SPAWN.delay + Math.random() * WHITE_ROUTE_SPAWN.jitter : pace.spawnDelay + Math.random() * pace.spawnJitter;
}
function objectBox(item) {
  return obstacleBox(item, props[item.kind], floor);
}
function playerBox() {
  return runnerBox(playerX, floor, state.jumpHeight, state.duck);
}
function update(dt) {
  if (scene.pending) return;
  state.ambience += dt;
  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    if (state.toastTimer <= 0) $("toast").classList.remove("show");
  }
  if (state.mode !== "running") return;
  state.elapsed += dt;
  state.total += dt;
  state.score += dt * RUN_SCORE_PER_SECOND;
  const pace = paceFor(state.total);
  state.invulnerable = Math.max(0, state.invulnerable - dt);
  if (state.velocity || state.jumpHeight) {
    state.jumpHeight += state.velocity * dt;
    state.velocity -= GRAVITY * dt;
    if (state.jumpHeight <= 0) {
      state.jumpHeight = 0;
      state.velocity = 0;
    }
  }
  duck(
    duckActive(
      duckPointers.size > 0 || duckKeys.size > 0,
      state.total,
      state.duckUntil
    )
  );
  state.motion = advanceMotion(state.motion, dt, {
    ...state,
    cadence: pace.multiplier
  });
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) spawn();
  for (const item of state.objects) {
    item.age += dt;
    item.x -= pace.speed * dt;
    if (item.taken || !intersects(playerBox(), objectBox(item), COLLISION_INSET))
      continue;
    if (item.kind === "shield" || item.kind === "coffee") {
      if (!canCollectBonus(item.kind, state)) continue;
      item.taken = true;
      if (item.kind === "shield") {
        state.shield = true;
        toast(t("toastShield"));
        playEffect("shield-pickup");
      } else {
        state.lives++;
        toast(t("toastCoffee"));
        playEffect("coffee-pickup");
      }
      state.score += BONUS_SCORE;
    } else if (state.invulnerable <= 0) {
      item.taken = true;
      if (state.shield) {
        state.shield = false;
        toast(t("toastBlock"));
        playEffect("shield-break");
      } else {
        state.invulnerable = HIT_INVULNERABILITY_SECONDS;
        state.motion = startMotion(state.motion, "hit");
        state.lives--;
        toast(t("toastHit"));
        if (state.lives <= 0) {
          state.jumpHeight = 0;
          setMode("down");
          playEffect("death");
          break;
        }
        playEffect("hit-gong");
      }
    }
  }
  state.objects = state.objects.filter(
    (item) => !item.taken && item.x > DESPAWN_X
  );
  const transition = checkpointTransition(state, STAGES[state.stage].duration);
  if (state.mode === "running" && transition) {
    if ("stage" in transition) state.stage = transition.stage;
    setMode(transition.mode);
    requestScene();
  }
  updateHUD();
}
function image(name, x, y, w, h) {
  const img = images[name];
  if (img?.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
}
function drawPlayer(pose, jumpHeight, opacity = 1) {
  const size = PLAYER_ART.size;
  const width = size * pose.scaleX;
  const height = size * pose.scaleY;
  const bottom = pose.sprite in FOOT_ANCHOR ? FOOT_ANCHOR[pose.sprite] : PLAYER_ART.defaultFoot;
  const drawY = floor + ROAD_OFFSET - PLAYER_ART.roadInset - jumpHeight - pose.lift - bottom * height / PLAYER_ART.sourceHeight;
  const shake = state.motion.phase === "hit" ? Math.sin(state.motion.age * PLAYER_ART.shakeRate) * PLAYER_ART.shakePixels : 0;
  ctx.save();
  ctx.globalAlpha = opacity;
  image(
    pose.sprite,
    playerX - PLAYER_ART.leftOffset - (width - size) / 2 + shake,
    drawY,
    width,
    height
  );
  ctx.restore();
}
function drawBackgroundImage(img, stage = 0) {
  if (!img?.complete || !img.naturalWidth || !img.naturalHeight) return false;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const ratio = W / H;
  const viewW = Math.min(iw, ih * ratio);
  const viewH = Math.min(ih, iw / ratio);
  const marginX = Math.max(0, (iw - viewW) / 2);
  const marginY = Math.max(0, (ih - viewH) / 2);
  const sx = marginX + (reducedMotion.matches ? 0 : Math.sin(state.ambience * CAMERA.xRate + stage) * Math.min(marginX, CAMERA.xPixels));
  const sy = marginY + (reducedMotion.matches ? 0 : Math.sin(state.ambience * CAMERA.yRate + stage * CAMERA.stagePhase) * Math.min(marginY, CAMERA.yPixels));
  const scene2 = state.endless ? "scene-endless" : stageBackgrounds[stage];
  ctx.drawImage(img, sx, sy, viewW, viewH, 0, 0, W, H);
  if (!reducedMotion.matches) {
    const lamps = scene2 === "scene-paperwork" ? BEACONS.paperwork : BEACONS.other;
    const phase = BEACONS.opacity + BEACONS.pulseOpacity * Math.sin(state.ambience * BEACONS.pulseRate);
    ctx.fillStyle = `rgba(255, 141, 110, ${phase})`;
    for (const [px, py] of lamps) {
      const cx = (px * iw / BEACONS.sourceWidth - sx) * W / viewW;
      const cy = (py * ih / BEACONS.sourceHeight - sy) * H / viewH;
      if (cx > 0 && cx < W && cy > 0 && cy < floor - BEACONS.floorClearance) {
        ctx.beginPath();
        ctx.arc(cx, cy, BEACONS.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return true;
}
function drawStageBackdrop(dark) {
  const drawn = drawBackgroundImage(scene.current?.image, state.stage);
  if (!drawn) {
    ctx.fillStyle = dark ? "#1a2f4b" : "#5f82aa";
    ctx.fillRect(0, 0, W, H);
  }
  const tint = ctx.createLinearGradient(0, 0, 0, H);
  tint.addColorStop(0, dark ? "#05102244" : "#ffffff1f");
  tint.addColorStop(ROAD.tintStop, dark ? "#0b172e55" : "#18263e35");
  tint.addColorStop(1, dark ? "#0a1426c0" : "#13213d88");
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = STAGES[state.stage].palette;
  ctx.fillRect(0, floor, W, ROAD_OFFSET);
  ctx.fillStyle = dark ? "#0d1a2cd4" : "#15324eb0";
  ctx.fillRect(0, floor + ROAD_OFFSET, W, H - floor);
  ctx.fillStyle = dark ? "#5ecb7480" : "#dff7f095";
  const pace = paceFor(state.total);
  for (let x = -(state.ambience * pace.speed * ROAD.speedRatio % ROAD.spacing); x < W; x += ROAD.spacing)
    ctx.fillRect(x, floor + ROAD.y, ROAD.width, ROAD.height);
}
function drawShield() {
  const crouching = state.duck;
  const cx = playerX + (crouching ? SHIELD_ART.duckX : SHIELD_ART.standingX);
  const cy = floor + ROAD_OFFSET - (crouching ? SHIELD_ART.duckRise : SHIELD_ART.standingRise) - state.jumpHeight;
  const rx = crouching ? SHIELD_ART.duckRadiusX : SHIELD_ART.standingRadiusX;
  const ry = crouching ? SHIELD_ART.duckRadiusY : SHIELD_ART.standingRadiusY;
  const pulse = SHIELD_ART.pulse + Math.sin(state.ambience * SHIELD_ART.pulseRate) * SHIELD_ART.pulseAmplitude;
  ctx.save();
  ctx.shadowColor = "#49f5f2";
  ctx.shadowBlur = SHIELD_ART.blur;
  const aura = ctx.createRadialGradient(
    cx,
    cy,
    rx * SHIELD_ART.innerRadius,
    cx,
    cy,
    ry
  );
  aura.addColorStop(0, "rgba(73, 245, 242, 0)");
  aura.addColorStop(
    SHIELD_ART.gradientStop,
    `rgba(73, 245, 242, ${pulse * SHIELD_ART.auraOpacity})`
  );
  aura.addColorStop(1, "rgba(73, 245, 242, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(101, 244, 247, ${SHIELD_ART.groundOpacity + pulse * SHIELD_ART.groundPulseOpacity})`;
  ctx.lineWidth = SHIELD_ART.lineWidth;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    floor + ROAD_OFFSET - SHIELD_ART.groundRise - state.jumpHeight,
    rx * SHIELD_ART.groundRadiusRatio,
    SHIELD_ART.groundRadiusY,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  const nodes = [
    [cx - rx, cy + ry * SHIELD_ART.leftNodeY],
    [cx + rx, cy - ry * SHIELD_ART.rightNodeY]
  ];
  for (const [x, y] of nodes) {
    ctx.fillStyle = "#d9ffef";
    ctx.beginPath();
    ctx.arc(x, y, SHIELD_ART.nodeRadius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(101, 244, 247, .55)";
    ctx.lineWidth = SHIELD_ART.nodeLineWidth;
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      SHIELD_ART.nodeRingRadius + pulse * SHIELD_ART.nodePulseRadius,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
  ctx.restore();
}
function drawShieldHead() {
  const { x, y } = shieldHeadPoint(
    playerX,
    floor,
    state.jumpHeight,
    state.duck
  );
  ctx.save();
  ctx.shadowColor = "#69faff";
  ctx.shadowBlur = SHIELD_ART.headBlur;
  ctx.fillStyle = "#e5fffc";
  ctx.beginPath();
  ctx.arc(x, y, SHIELD_ART.headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5af1f7";
  ctx.lineWidth = SHIELD_ART.headLineWidth;
  ctx.beginPath();
  ctx.arc(
    x,
    y,
    SHIELD_ART.headRingRadius + Math.sin(state.ambience * SHIELD_ART.headPulseRate) * SHIELD_ART.headPulseRadius,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  ctx.restore();
}
function drawObstacle(item) {
  const prop = props[item.kind];
  const { x, y, w, h } = obstacleArtRect(item, prop, floor);
  const pose = hazardPose(item.kind, reducedMotion.matches ? 0 : item.age);
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 + pose.bob);
  ctx.rotate(pose.tilt);
  ctx.scale(pose.squash, 1 / pose.squash);
  ctx.translate(-x - w / 2, -y - h / 2);
  let drawn = false;
  if (pose.sheet) {
    const sheet = animationSheets[pose.sheet];
    if (sheet.complete && sheet.naturalWidth) {
      const layout = hazardLayouts[pose.sheet];
      const cw = sheet.naturalWidth / (layout?.frames ?? 4);
      const sourceScaleY = h / (layout?.scaleHeight ?? sheet.naturalHeight);
      const ground = layout?.ground[pose.frame] ?? sheet.naturalHeight;
      ctx.drawImage(
        sheet,
        pose.frame * cw,
        0,
        cw,
        sheet.naturalHeight,
        x,
        y + h - (ground - (layout?.top ?? 0)) * sourceScaleY,
        w,
        sheet.naturalHeight * sourceScaleY
      );
      drawn = true;
    }
  }
  if (!pose.sheet && images[item.kind]) {
    if (item.kind === "slowdown") {
      ctx.save();
      ctx.translate(2 * x + w, 0);
      ctx.scale(-1, 1);
    }
    const layout = hazardLayouts[item.kind];
    const scale = h / (layout?.height ?? h);
    image(
      item.kind,
      x,
      layout?.anchor === "center" ? y + h / 2 + (layout.top - layout.height / 2) * scale : y + h - ((layout?.height ?? h) - (layout?.top ?? 0)) * scale,
      w,
      layout ? (layout.bottom - layout.top) * scale : h
    );
    if (item.kind === "slowdown") ctx.restore();
  } else if (!pose.sheet && !drawn && prop.image !== void 0) {
    const layout = hazardLayouts[prop.image];
    const scale = h / (layout?.height ?? h);
    image(
      prop.image,
      x,
      y + (layout?.top ?? 0) * scale,
      w,
      layout ? (layout.bottom - layout.top) * scale : h
    );
  }
  if (item.kind === "glider" || item.kind === "drone") {
    const centers = item.kind === "glider" ? PROPELLER.glider : PROPELLER.drone;
    for (const [px, py] of centers) {
      ctx.save();
      ctx.translate(x + w * px, y + h * py);
      ctx.rotate(item.age * PROPELLER.rate);
      ctx.strokeStyle = "#c9f8ff";
      ctx.lineWidth = PROPELLER.width;
      ctx.beginPath();
      ctx.moveTo(-PROPELLER.radiusX, 0);
      ctx.lineTo(PROPELLER.radiusX, 0);
      ctx.moveTo(0, -PROPELLER.radiusY);
      ctx.lineTo(0, PROPELLER.radiusY);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (item.kind === "drone") {
    ctx.fillStyle = `rgba(255, 77, 60, ${SCANNER.opacity + SCANNER.amplitude * (1 + Math.sin(item.age * SCANNER.rate)) / 2})`;
    ctx.beginPath();
    ctx.moveTo(x + w * SCANNER.topX, y + h * SCANNER.topY);
    ctx.lineTo(x + w * SCANNER.rightX, y + h);
    ctx.lineTo(x + w * SCANNER.leftX, y + h);
    ctx.closePath();
    ctx.fill();
  }
  drawHazardEffects(
    ctx,
    item.kind,
    { x, y, w, h },
    item.age,
    reducedMotion.matches
  );
  ctx.restore();
  drawItemCue(ctx, item.kind, { x, y, w, h });
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  const dark = effectiveTheme() === "dark";
  if (!scene.current) {
    ctx.fillStyle = dark ? "#101b2b" : "#edf1ef";
    ctx.fillRect(0, 0, W, H);
    return;
  }
  drawStageBackdrop(dark);
  ctx.fillStyle = dark ? "#101b2bbc" : "#eff6e5d9";
  ctx.fillRect(
    HUD_ART.x,
    HUD_ART.y,
    Math.min(W - HUD_ART.horizontalMargin, HUD_ART.width),
    HUD_ART.height
  );
  ctx.fillStyle = dark ? "#d7fa5b" : "#21352e";
  ctx.font = "800 15px ui-monospace, monospace";
  ctx.fillText(
    state.endless ? t("endlessLabel") : `${String(state.stage + 1).padStart(HUD_DIGITS.stage, "0")} / ${t("stageNames")[state.stage]}`,
    HUD_ART.textX,
    HUD_ART.textY,
    Math.min(W - HUD_ART.textMargin, HUD_ART.textWidth)
  );
  if (!state.endless) {
    ctx.fillStyle = STAGES[state.stage].palette;
    ctx.fillRect(
      0,
      0,
      W * Math.min(1, state.elapsed / STAGES[state.stage].duration),
      HUD_ART.progressHeight
    );
  }
  for (const item of state.objects) drawObstacle(item);
  const pose = state.mode === "down" ? { sprite: "max-defeat", lift: 0, scaleX: 1, scaleY: 1 } : poseFor(state.motion);
  if (state.shield) drawShield();
  if (state.mode === "down" || state.invulnerable <= 0 || Math.floor(state.ambience * HIT_BLINK_RATE) % 2 === 0) {
    drawPlayer(pose, state.jumpHeight);
  }
  if (state.shield) drawShieldHead();
  if (!state.endless && state.stage === CAMPAIGN.finalStage) {
    ctx.fillStyle = dark ? "#d7fa5b" : "#173944";
    ctx.font = "900 12px ui-monospace, monospace";
    ctx.fillText("RKN-9000", W - HUD_ART.bossRight, HUD_ART.bossY);
  }
}
let previous = performance.now();
function loop(now) {
  const dt = Math.min(
    (now - previous) / FRAME_TIME.millisecondsPerSecond,
    FRAME_TIME.maxSeconds
  );
  previous = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestScene();
requestAnimationFrame(loop);
