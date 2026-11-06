// Authored campaign records: duration is active gameplay seconds; obstacle arrays
// list eligible kinds and palette values are CSS colors.

export const STAGES: import('./types.js').Stage[] = [
  {
    key: 'paper',
    duration: 76,
    obstacles: ['paper', 'cone', 'barrier', 'drone', 'cable'],
    speaker: 'CHECKPOINT',
    palette: '#436c8c'
  },
  {
    key: 'kii',
    duration: 80,
    obstacles: ['server', 'calendar', 'camera', 'barrier', 'drone'],
    speaker: 'CHECKPOINT',
    palette: '#79547b'
  },
  {
    key: 'cloud',
    duration: 80,
    obstacles: ['drone', 'fan', 'server', 'crate', 'cable'],
    speaker: 'CHECKPOINT',
    palette: '#497f81'
  },
  {
    key: 'list',
    duration: 80,
    obstacles: ['paper', 'cone', 'calendar', 'camera', 'barrier', 'server'],
    speaker: 'CHECKPOINT',
    palette: '#847656'
  },
  {
    key: 'boss',
    duration: 84,
    obstacles: [
      'drone',
      'camera',
      'barrier',
      'paper',
      'server',
      'crate',
      'cable'
    ],
    speaker: 'FINAL',
    palette: '#a65d67'
  }
];

export const TEXT = {
  en: {
    skip: 'Skip to game',
    back: 'Back to Oleg Shokin',
    eyebrow: 'A SMALL SATIRE IN FIVE LEVELS',
    title: 'Run, Max, run.',
    lead: 'Five levels of paperwork between one man and an open internet.',
    level: 'LEVEL',
    score: 'SCORE',
    lives: 'LIVES',
    pause: 'PAUSE',
    controls: 'CONTROLS',
    instructions:
      'Space / ↑ / W jump · ↓ / S duck · P pause. Touch upper half to jump; tap lower half to duck, hold to stay low.',
    shield: 'Shield absorbs a hit',
    coffee: 'Coffee restores a life',
    jump: 'JUMP',
    duck: 'DUCK',
    fiction: 'Everyone here is an algorithm. Probably.',
    portfolio: 'PORTFOLIO ↗',
    statusReady: 'SYSTEM READY',
    statusRun: 'RUNNING',
    statusPause: 'PAUSED',
    routeNone: 'ROUTE: —',
    routePublic: 'ROUTE: PUBLIC',
    routeWhite: 'ROUTE: WHITELIST',
    startTitle: 'RUN, MAX, RUN.',
    startBody: 'Clear five checkpoints and choose how the story ends.',
    startButton: 'START RUNNING',
    startFoot: 'JUMP over obstacles · DUCK under drones.',
    stageNames: [
      'THE PAPERWORK',
      'CRITICAL INFRASTRUCTURE',
      'YA-CLOUD',
      'THE LIST',
      'RKN-9000'
    ],
    stageIntros: [
      'Jump the paperwork.',
      'Watch the servers and cameras.',
      'Drones ahead.',
      'Choose the open route or the whitelist.',
      'Reach the final gate.'
    ],
    stageQuips: [
      'Paperwork cleared.',
      'Infrastructure cleared.',
      'Cloud cleared.',
      'Route cleared.',
      'Final checkpoint.'
    ],
    checkpointTitle: 'CHECKPOINT CLEARED',
    continue: 'NEXT LEVEL',
    routeTitle: 'CHOOSE A ROUTE',
    routeBody:
      'Public is harder and worth +2000 points. The whitelist is easier.',
    routeOpenButton: 'PUBLIC ROUTE',
    routeWhiteButton: 'WHITELIST',
    routeOpenFoot: 'Harder · +2000',
    routeWhiteFoot: 'Easier · no bonus',
    finalTitle: 'ONE LAST CLICK',
    finalBody:
      'RKN-9000 offers Max a seat on the Committee for Approved Loading Screens. Or he can open the gates.',
    finalGood: 'OPEN ACCESS',
    finalBad: 'JOIN THE COMMITTEE',
    goodTitle: 'THE INTERNET IS OPEN',
    goodBody:
      'Max opens the gates. People can read, ask, argue and choose for themselves. The loading spinner finally retires.',
    badTitle: 'WELCOME TO THE COMMITTEE',
    badBody:
      'Max joins the team of evil. His first task: approve a button labeled “Approve button.” It takes six weeks.',
    replay: 'PLAY AGAIN',
    endless: 'ENDLESS RUN',
    endlessTitle: 'ENDLESS BUREAUCRACY',
    endlessBody:
      'No ending. Just you, the road, and an inexhaustible supply of forms.',
    pauseTitle: 'COFFEE BREAK',
    pauseBody: 'The paperwork can wait a moment.',
    resume: 'RESUME',
    restart: 'RESTART LEVEL',
    downTitle: 'RETRY FROM CHECKPOINT',
    downBody: 'The forms got you. The checkpoint keeps your progress.',
    retry: 'TRY AGAIN',
    toastShield: 'Shield acquired',
    toastCoffee: 'Coffee break: +1 life',
    toastHit: 'Ouch. Filed under “incident.”',
    toastBlock: 'Shield blocked a hit'
  },
  ru: {
    skip: 'К игре',
    back: 'На сайт Олега Шокина',
    eyebrow: 'МАЛЕНЬКАЯ САТИРА В ПЯТИ УРОВНЯХ',
    title: 'Беги, Макс, беги.',
    lead: 'Пять уровней бумажек между одним человеком и свободным интернетом.',
    level: 'УРОВЕНЬ',
    score: 'ОЧКИ',
    lives: 'ЖИЗНИ',
    pause: 'ПАУЗА',
    controls: 'УПРАВЛЕНИЕ',
    instructions:
      'Пробел / ↑ / W — прыжок · ↓ / S — присесть · P — пауза. Касание сверху — прыжок, снизу — присесть; удержание продлевает приседание.',
    shield: 'Щит держит один удар',
    coffee: 'Кофе возвращает жизнь',
    jump: 'ПРЫЖОК',
    duck: 'ПРИСЕСТЬ',
    fiction: 'Здесь все — алгоритмы. Наверное.',
    portfolio: 'НА САЙТ ↗',
    statusReady: 'СИСТЕМА ГОТОВА',
    statusRun: 'БЕЖИМ',
    statusPause: 'ПАУЗА',
    routeNone: 'МАРШРУТ: —',
    routePublic: 'МАРШРУТ: ОТКРЫТЫЙ',
    routeWhite: 'МАРШРУТ: БЕЛЫЙ СПИСОК',
    startTitle: 'БЕГИ, МАКС, БЕГИ.',
    startBody: 'Пройди пять этапов и выбери финал.',
    startButton: 'НАЧАТЬ ЗАБЕГ',
    startFoot: 'ПРЫГАЙ через преграды · ПРИСЕДАЙ под дронами.',
    stageNames: [
      'БУМАЖКИ',
      'КРИТИЧЕСКАЯ ИНФРАСТРУКТУРА',
      'Я-ОБЛАКО',
      'СПИСОК',
      'РКН-9000'
    ],
    stageIntros: [
      'Перепрыгивай бумажки.',
      'Берегись серверов и камер.',
      'Впереди дроны.',
      'Выбери открытый путь или белый список.',
      'Доберись до финального шлюза.'
    ],
    stageQuips: [
      'Бумажки пройдены.',
      'Инфраструктура пройдена.',
      'Облако пройдено.',
      'Маршрут пройден.',
      'Финальный этап.'
    ],
    checkpointTitle: 'ЭТАП ПРОЙДЕН',
    continue: 'ДАЛЬШЕ',
    routeTitle: 'ВЫБЕРИ МАРШРУТ',
    routeBody: 'Открытый путь сложнее и даёт +2000 очков. Белый список проще.',
    routeOpenButton: 'ОТКРЫТЫЙ ПУТЬ',
    routeWhiteButton: 'БЕЛЫЙ СПИСОК',
    routeOpenFoot: 'Сложнее · +2000',
    routeWhiteFoot: 'Проще · без бонуса',
    finalTitle: 'ПОСЛЕДНИЙ КЛИК',
    finalBody:
      'РКН-9000 предлагает Максу кресло в Комитете по согласованию экранов загрузки. А можно открыть шлюзы.',
    finalGood: 'ОТКРЫТЬ ДОСТУП',
    finalBad: 'ВСТУПИТЬ В КОМИТЕТ',
    goodTitle: 'ИНТЕРНЕТ ОТКРЫТ',
    goodBody:
      'Макс открывает шлюзы. Люди могут читать, спрашивать, спорить и выбирать сами. Кружок загрузки наконец уходит на пенсию.',
    badTitle: 'ДОБРО ПОЖАЛОВАТЬ В КОМИТЕТ',
    badBody:
      'Макс вступает в команду зла. Первое задание — согласовать кнопку «Согласовать кнопку». Срок исполнения: шесть недель.',
    replay: 'ИГРАТЬ СНОВА',
    endless: 'БЕСКОНЕЧНЫЙ ЗАБЕГ',
    endlessTitle: 'БЕСКОНЕЧНАЯ БЮРОКРАТИЯ',
    endlessBody: 'Без финала. Только ты, дорога и неиссякаемый запас бланков.',
    pauseTitle: 'КОФЕ-БРЕЙК',
    pauseBody: 'Бумажки подождут.',
    resume: 'ПРОДОЛЖИТЬ',
    restart: 'ЗАНОВО С УРОВНЯ',
    downTitle: 'ПОВТОР С КОНТРОЛЬНОЙ ТОЧКИ',
    downBody: 'Бумажки тебя достали. Прогресс сохранён на уровне.',
    retry: 'ПОПРОБОВАТЬ ЕЩЁ',
    toastShield: 'Щит получен',
    toastCoffee: 'Кофе: +1 жизнь',
    toastHit: 'Ай. Записано как «инцидент».',
    toastBlock: 'Щит выдержал удар'
  },
  es: {
    skip: 'Ir al juego',
    back: 'Volver al sitio de Oleg',
    eyebrow: 'UNA PEQUEÑA SÁTIRA EN CINCO NIVELES',
    title: 'Corre, Max, corre.',
    lead: 'Cinco niveles de papeleo entre una persona e Internet abierto.',
    level: 'NIVEL',
    score: 'PUNTOS',
    lives: 'VIDAS',
    pause: 'PAUSA',
    controls: 'CONTROLES',
    instructions:
      'Espacio / ↑ / W saltar · ↓ / S agacharse · P pausa. Toca arriba para saltar; abajo para agacharte, mantén pulsado para seguir agachado.',
    shield: 'El escudo absorbe un golpe',
    coffee: 'El café recupera una vida',
    jump: 'SALTAR',
    duck: 'AGACHARSE',
    fiction: 'Todos aquí son algoritmos. Probablemente.',
    portfolio: 'PORTAFOLIO ↗',
    statusReady: 'SISTEMA LISTO',
    statusRun: 'CORRIENDO',
    statusPause: 'PAUSA',
    routeNone: 'RUTA: —',
    routePublic: 'RUTA: PÚBLICA',
    routeWhite: 'RUTA: LISTA BLANCA',
    startTitle: 'CORRE, MAX, CORRE.',
    startBody: 'Supera cinco etapas y elige el final.',
    startButton: 'EMPEZAR',
    startFoot: 'SALTA los obstáculos · AGÁCHATE bajo los drones.',
    stageNames: [
      'LOS PAPELES',
      'INFRAESTRUCTURA CRÍTICA',
      'YA-NUBE',
      'LA LISTA',
      'RKN-9000'
    ],
    stageIntros: [
      'Salta los papeles.',
      'Cuidado con servidores y cámaras.',
      'Hay drones por delante.',
      'Elige la ruta pública o la lista blanca.',
      'Llega a la puerta final.'
    ],
    stageQuips: [
      'Papeles superados.',
      'Infraestructura superada.',
      'Nube superada.',
      'Ruta superada.',
      'Etapa final.'
    ],
    checkpointTitle: 'ETAPA SUPERADA',
    continue: 'SIGUIENTE NIVEL',
    routeTitle: 'ELIGE UNA RUTA',
    routeBody:
      'La ruta pública es más difícil y da +2000 puntos. La lista blanca es más fácil.',
    routeOpenButton: 'RUTA PÚBLICA',
    routeWhiteButton: 'LISTA BLANCA',
    routeOpenFoot: 'Difícil · +2000',
    routeWhiteFoot: 'Fácil · sin bonus',
    finalTitle: 'UN ÚLTIMO CLIC',
    finalBody:
      'RKN-9000 ofrece a Max un asiento en el Comité de Pantallas de Carga Aprobadas. O puede abrir las puertas.',
    finalGood: 'ABRIR ACCESO',
    finalBad: 'UNIRSE AL COMITÉ',
    goodTitle: 'INTERNET ESTÁ ABIERTO',
    goodBody:
      'Max abre las puertas. La gente puede leer, preguntar, debatir y elegir por sí misma. El icono de carga se jubila.',
    badTitle: 'BIENVENIDO AL COMITÉ',
    badBody:
      'Max se une al equipo del mal. Primera tarea: aprobar un botón llamado «Aprobar botón». Tarda seis semanas.',
    replay: 'JUGAR DE NUEVO',
    endless: 'CARRERA INFINITA',
    endlessTitle: 'BUROCRACIA INFINITA',
    endlessBody: 'Sin final. Solo tú, el camino y formularios inagotables.',
    pauseTitle: 'PAUSA PARA CAFÉ',
    pauseBody: 'Los papeles pueden esperar.',
    resume: 'CONTINUAR',
    restart: 'REINICIAR NIVEL',
    downTitle: 'REINTENTAR DESDE EL CONTROL',
    downBody: 'Los papeles te alcanzaron. Conservas el progreso del nivel.',
    retry: 'INTENTAR DE NUEVO',
    toastShield: 'Escudo conseguido',
    toastCoffee: 'Café: +1 vida',
    toastHit: 'Incidente registrado',
    toastBlock: 'El escudo absorbió el golpe'
  }
};
