import { getLanguage, getTheme, setTheme, initPreferences } from './preferences.js';

const copy = {
  en: {
    navWork: 'Work', navAbout: 'About', navContact: 'Contact',
    eyebrow: 'OLEG SHOKIN  /  SOFTWARE ENGINEER',
    hero1: 'I make software', hero2: 'for people who build software.',
    intro: 'I build backend systems and developer tools. Currently working on distributed object storage.',
    workTitle: 'Systems and tools',
    p1Type: 'CURRENT ROLE · GO / ROCKSDB', p1Title: 'Distributed object storage', p1Desc: 'Reduce data and memory overhead, tune read performance and keep storage healthy under load.',
    p2Type: 'NDA · BACKEND', p2Title: 'Property valuation', p2Desc: 'Built a system for calculating property values.',
    p3Type: 'NDA · PRODUCT', p3Title: 'Custom CRM', p3Desc: 'Built a CRM for a private client.',
    p4Type: 'LOAD TESTING · GO', p4Title: 'xk6-kv', p4Desc: 'Mutable test data and leases for k6 virtual users, without another service.',
    p5Type: 'DEVELOPER TOOLS', p5Title: 'Cursor Chat Transit', p5Desc: 'Move Cursor conversations between workspaces and devices.',
    source: 'View source',
    aboutEyebrow: '02 / ABOUT', aboutTitle: 'What I do',
    aboutBody: 'Go, PostgreSQL, RocksDB and distributed systems. I profile real workloads and fix what they reveal.',
    aboutAside: 'READ THE CODE. MEASURE THE RESULT.',
    gameEyebrow: '03 / AFTER HOURS', gameTitle: 'A small game about a very large firewall.',
    gameBody: 'Max just wants the internet to work. The paperwork, drones and RKN-9000 have other plans.',
    gameButton: 'Play Digital Development Simulator', gameNote: 'No sign-up. No SMS.', gameCaption: 'RUN / JUMP / DECIDE',
    contactEyebrow: '04 / CONTACT', contactTitle: 'Get in touch',
    github: 'GitHub', telegram: 'Telegram',
    themeLabel: 'Appearance', languageLabel: 'Language', system: 'Auto', light: 'Light', dark: 'Dark', skip: 'Skip to content'
  },
  ru: {
    navWork: 'Работа', navAbout: 'Обо мне', navContact: 'Связаться',
    eyebrow: 'ОЛЕГ ШОКИН  /  РАЗРАБОТЧИК', hero1: 'Делаю программы', hero2: 'для тех, кто делает программы.',
    intro: 'Разрабатываю серверные системы и инструменты. Сейчас работаю над распределённым объектным хранилищем.',
    workTitle: 'Системы и инструменты',
    p1Type: 'ТЕКУЩАЯ РАБОТА · GO / ROCKSDB', p1Title: 'Распределённое объектное хранилище', p1Desc: 'Сокращаю расход диска и памяти, ускоряю чтение и проверяю работу хранилища под нагрузкой.',
    p2Type: 'NDA · СЕРВЕРНАЯ ЧАСТЬ', p2Title: 'Оценка недвижимости', p2Desc: 'Сделал систему расчёта стоимости объектов недвижимости.',
    p3Type: 'NDA · ПРОДУКТ', p3Title: 'CRM на заказ', p3Desc: 'Написал CRM для частного заказчика.',
    p4Type: 'НАГРУЗОЧНОЕ ТЕСТИРОВАНИЕ · GO', p4Title: 'xk6-kv', p4Desc: 'Изменяемые тестовые данные и аренда записей для виртуальных пользователей k6 без отдельного сервиса.',
    p5Type: 'ИНСТРУМЕНТЫ РАЗРАБОТЧИКА', p5Title: 'Cursor Chat Transit', p5Desc: 'Перенос бесед Cursor между проектами и устройствами.',
    source: 'Исходный код', aboutEyebrow: '02 / ОБО МНЕ', aboutTitle: 'Чем я занимаюсь',
    aboutBody: 'Go, PostgreSQL, RocksDB и распределённые системы. Изучаю работу систем под нагрузкой, нахожу ошибки и ускоряю медленные участки.',
    aboutAside: 'Изучаю код. Измеряю быстродействие.',
    gameEyebrow: '03 / ПОСЛЕ РАБОТЫ', gameTitle: 'Маленькая игра о большом файрволе.',
    gameBody: 'Макс хочет, чтобы интернет работал. У бумажек, дронов и РКН-9000 другие планы.',
    gameButton: 'Играть в симулятор цифрового развития', gameNote: 'Без регистрации и СМС', gameCaption: 'БЕГИ / ПРЫГАЙ / ПРИНИМАЙ РЕШЕНИЕ',
    contactEyebrow: '04 / КОНТАКТЫ', contactTitle: 'Как связаться',
    github: 'GitHub', telegram: 'Telegram',
    themeLabel: 'Тема', languageLabel: 'Язык', system: 'Авто', light: 'Светлая', dark: 'Тёмная', skip: 'К содержимому'
  },
  es: {
    navWork: 'Trabajo', navAbout: 'Sobre mí', navContact: 'Contacto',
    eyebrow: 'OLEG SHOKIN  /  INGENIERO DE SOFTWARE', hero1: 'Hago software', hero2: 'para quienes hacen software.',
    intro: 'Desarrollo sistemas backend y herramientas. Ahora trabajo en almacenamiento distribuido de objetos.',
    workTitle: 'Sistemas y herramientas',
    p1Type: 'TRABAJO ACTUAL · GO / ROCKSDB', p1Title: 'Almacenamiento distribuido de objetos', p1Desc: 'Reduzco el uso de disco y memoria, optimizo lecturas y pruebo el sistema bajo carga.',
    p2Type: 'NDA · BACKEND', p2Title: 'Valoración inmobiliaria', p2Desc: 'Desarrollé un sistema para calcular el valor de inmuebles.',
    p3Type: 'NDA · PRODUCTO', p3Title: 'CRM a medida', p3Desc: 'Desarrollé un CRM para un cliente privado.',
    p4Type: 'PRUEBAS DE CARGA · GO', p4Title: 'xk6-kv', p4Desc: 'Datos de prueba mutables y préstamos de registros para usuarios virtuales de k6 sin otro servicio.',
    p5Type: 'HERRAMIENTAS DE DESARROLLO', p5Title: 'Cursor Chat Transit', p5Desc: 'Traslada conversaciones de Cursor entre proyectos y dispositivos.',
    source: 'Ver código', aboutEyebrow: '02 / SOBRE MÍ', aboutTitle: 'A qué me dedico',
    aboutBody: 'Go, PostgreSQL, RocksDB y sistemas distribuidos. Analizo cargas reales y corrijo los problemas que encuentro.',
    aboutAside: 'LEE EL CÓDIGO. MIDE EL RESULTADO.',
    gameEyebrow: '03 / TIEMPO LIBRE', gameTitle: 'Un pequeño juego sobre un enorme cortafuegos.',
    gameBody: 'Max solo quiere que Internet funcione. Los papeles, drones y RKN-9000 tienen otros planes.',
    gameButton: 'Jugar Digital Development Simulator', gameNote: 'Sin registro ni SMS', gameCaption: 'CORRE / SALTA / DECIDE',
    contactEyebrow: '04 / CONTACTO', contactTitle: 'Contacto',
    github: 'GitHub', telegram: 'Telegram',
    themeLabel: 'Tema', languageLabel: 'Idioma', system: 'Auto', light: 'Claro', dark: 'Oscuro', skip: 'Saltar al contenido'
  }
};

function translate() {
  const t = copy[getLanguage()];
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t[element.dataset.i18n] || '';
  });
  document.title = getLanguage() === 'ru' ? 'Олег Шокин — разработчик' : 'Oleg Shokin — Software Engineer';
  updateThemeLabel();
}

function updateThemeLabel() {
  const names = { en: { system: 'Auto', light: 'Light', dark: 'Dark' }, ru: { system: 'Авто', light: 'Светлая', dark: 'Тёмная' }, es: { system: 'Auto', light: 'Claro', dark: 'Oscuro' } };
  document.getElementById('theme-name').textContent = names[getLanguage()][getTheme()];
}

document.getElementById('theme-cycle').addEventListener('click', () => {
  const themes = ['system', 'light', 'dark'];
  setTheme(themes[(themes.indexOf(getTheme()) + 1) % themes.length]);
  updateThemeLabel();
});

initPreferences();
document.addEventListener('app:language', translate);
document.addEventListener('app:theme', updateThemeLabel);
translate();
