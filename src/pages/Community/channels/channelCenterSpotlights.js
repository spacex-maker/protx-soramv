/** 12 种「滑到视口中心」聚焦动效，按频道 index 循环取用 */
const springSnappy = { type: 'spring', stiffness: 260, damping: 22 };
const springSoft = { type: 'spring', stiffness: 140, damping: 18 };
const easeOut = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

const idleInner = { x: 0, y: 0, opacity: 0.68, filter: 'blur(0px)', rotate: 0 };
const activeInner = { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', rotate: 0 };

export const CENTER_SPOTLIGHTS = [
  {
    id: 'focus',
    label: 'FOCUS',
    inner: { idle: idleInner, active: activeInner, transition: springSnappy },
    title: {
      idle: { scale: 0.94, opacity: 0.8 },
      active: { scale: 1, opacity: 1 },
      transition: springSnappy,
    },
    line: { idle: { scaleX: 0.2, opacity: 0.3 }, active: { scaleX: 1, opacity: 1 }, transition: easeOut },
    frame: { idle: { opacity: 0.2 }, active: { opacity: 1 }, transition: { duration: 0.4 } },
    bg: { idle: { scale: 1.14 }, active: { scale: 1.06 }, transition: springSoft },
  },
  {
    id: 'slideLeft',
    label: 'SLIDE_L',
    inner: {
      idle: { ...idleInner, x: -24 },
      active: { ...activeInner, x: 0 },
      transition: springSnappy,
    },
    title: {
      idle: { x: -40, opacity: 0.7 },
      active: { x: 0, opacity: 1 },
      transition: { ...easeOut, delay: 0.05 },
    },
    line: { idle: { scaleX: 0, opacity: 0 }, active: { scaleX: 1, opacity: 1 }, transition: { duration: 0.65, delay: 0.1 } },
    frame: { idle: { opacity: 0.15 }, active: { opacity: 0.85 }, transition: { duration: 0.45 } },
    bg: { idle: { scale: 1.16 }, active: { scale: 1.08 }, transition: springSoft },
  },
  {
    id: 'slideRight',
    label: 'SLIDE_R',
    inner: {
      idle: { ...idleInner, x: 24 },
      active: { ...activeInner, x: 0 },
      transition: springSnappy,
    },
    title: {
      idle: { x: 40, opacity: 0.7 },
      active: { x: 0, opacity: 1 },
      transition: { ...easeOut, delay: 0.05 },
    },
    line: { idle: { scaleX: 0, opacity: 0, transformOrigin: 'right center' }, active: { scaleX: 1, opacity: 1 }, transition: { duration: 0.65 } },
    frame: { idle: { opacity: 0.15 }, active: { opacity: 0.85 }, transition: { duration: 0.45 } },
    bg: { idle: { scale: 1.16 }, active: { scale: 1.08 }, transition: springSoft },
  },
  {
    id: 'rise',
    label: 'RISE',
    inner: {
      idle: { ...idleInner, y: 56 },
      active: { ...activeInner, y: 0 },
      transition: springSnappy,
    },
    title: {
      idle: { y: 32, opacity: 0.75 },
      active: { y: 0, opacity: 1 },
      transition: { ...springSnappy, delay: 0.06 },
    },
    line: { idle: { scaleY: 0, opacity: 0 }, active: { scaleY: 1, scaleX: 1, opacity: 1 }, transition: { duration: 0.5, delay: 0.08 } },
    frame: { idle: { opacity: 0.2, y: 20 }, active: { opacity: 1, y: 0 }, transition: springSoft },
    bg: { idle: { scale: 1.18, y: 12 }, active: { scale: 1.07, y: 0 }, transition: springSoft },
    flash: true,
  },
  {
    id: 'drop',
    label: 'DROP',
    inner: {
      idle: { ...idleInner, y: -36 },
      active: { ...activeInner, y: 0 },
      transition: springSnappy,
    },
    title: {
      idle: { y: -24, opacity: 0.75 },
      active: { y: 0, opacity: 1 },
      transition: springSnappy,
    },
    line: { idle: { scaleX: 0.5, opacity: 0.2 }, active: { scaleX: 1, opacity: 1 }, transition: easeOut },
    frame: { idle: { opacity: 0.2 }, active: { opacity: 1 }, transition: { duration: 0.35 } },
    bg: { idle: { scale: 1.12 }, active: { scale: 1.05 }, transition: springSoft },
  },
  {
    id: 'blurReveal',
    label: 'REVEAL',
    inner: { idle: { ...idleInner, filter: 'blur(4px)' }, active: activeInner, transition: { duration: 0.6 } },
    title: {
      idle: { filter: 'blur(10px)', scale: 0.9, opacity: 0.5 },
      active: { filter: 'blur(0px)', scale: 1, opacity: 1 },
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
    line: { idle: { scaleX: 0, opacity: 0 }, active: { scaleX: 1, opacity: 1 }, transition: { duration: 0.8, delay: 0.15 } },
    frame: { idle: { opacity: 0.1 }, active: { opacity: 0.9 }, transition: { duration: 0.5 } },
    bg: { idle: { scale: 1.15 }, active: { scale: 1.04 }, transition: { duration: 0.8 } },
  },
  {
    id: 'spread',
    label: 'SPREAD',
    inner: { idle: idleInner, active: activeInner, transition: easeOut },
    title: {
      idle: { letterSpacing: '-0.06em', opacity: 0.82 },
      active: { letterSpacing: '-0.02em', opacity: 1 },
      transition: { duration: 0.65 },
    },
    line: { idle: { width: 40, opacity: 0.4 }, active: { width: 160, opacity: 1 }, transition: { duration: 0.7 } },
    frame: { idle: { opacity: 0.25, scale: 0.99 }, active: { opacity: 1, scale: 1 }, transition: springSoft },
    bg: { idle: { scale: 1.14 }, active: { scale: 1.06 }, transition: springSoft },
  },
  {
    id: 'glitch',
    label: 'GLITCH',
    inner: { idle: idleInner, active: activeInner, transition: { duration: 0.3 } },
    title: {
      idle: { x: 0, opacity: 0.85 },
      active: { x: [0, -6, 5, -3, 2, 0], opacity: 1 },
      transition: { duration: 0.5 },
    },
    line: { idle: { scaleX: 0.6, opacity: 0.4 }, active: { scaleX: 1, opacity: 1 }, transition: { duration: 0.25 } },
    frame: { idle: { opacity: 0.3 }, active: { opacity: 1 }, transition: { duration: 0.2 } },
    bg: { idle: { scale: 1.12 }, active: { scale: 1.08 }, transition: { duration: 0.35 } },
    glitch: true,
  },
  {
    id: 'sweep',
    label: 'SWEEP',
    inner: { idle: idleInner, active: activeInner, transition: easeOut },
    title: {
      idle: { opacity: 0.7, clipPath: 'inset(0 100% 0 0)' },
      active: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
    line: { idle: { scaleX: 0, opacity: 0 }, active: { scaleX: 1, opacity: 1 }, transition: { duration: 0.5, delay: 0.2 } },
    frame: { idle: { opacity: 0.2 }, active: { opacity: 0.95 }, transition: { duration: 0.4 } },
    bg: { idle: { scale: 1.16 }, active: { scale: 1.05 }, transition: springSoft },
    sweep: true,
  },
  {
    id: 'pulse',
    label: 'PULSE',
    inner: { idle: idleInner, active: activeInner, transition: { duration: 0.4 } },
    title: {
      idle: { scale: 0.96, opacity: 0.8 },
      active: { scale: [0.96, 1.03, 1], opacity: 1 },
      transition: { duration: 0.55 },
    },
    line: { idle: { scaleX: 0.3, opacity: 0.3 }, active: { scaleX: 1, opacity: 1 }, transition: { duration: 0.45 } },
    frame: {
      idle: { opacity: 0.2, scale: 0.98 },
      active: { opacity: [0.5, 1, 0.85, 1], scale: 1 },
      transition: { duration: 0.7 },
    },
    bg: { idle: { scale: 1.14 }, active: { scale: [1.14, 1.08, 1.06], }, transition: { duration: 0.7 } },
    flash: true,
  },
  {
    id: 'zoom',
    label: 'ZOOM',
    inner: { idle: { ...idleInner, scale: 0.97 }, active: { ...activeInner, scale: 1 }, transition: springSnappy },
    title: {
      idle: { scale: 0.88, opacity: 0.75 },
      active: { scale: 1, opacity: 1 },
      transition: springSnappy,
    },
    line: { idle: { scaleX: 0, opacity: 0 }, active: { scaleX: 1, opacity: 1 }, transition: { duration: 0.5, delay: 0.08 } },
    frame: { idle: { opacity: 0.15, scale: 1.02 }, active: { opacity: 1, scale: 1 }, transition: springSoft },
    bg: { idle: { scale: 1.22 }, active: { scale: 1.04 }, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
  },
  {
    id: 'tilt',
    label: 'TILT',
    inner: {
      idle: { ...idleInner, rotate: -2.5 },
      active: { ...activeInner, rotate: 0 },
      transition: springSnappy,
    },
    title: {
      idle: { rotate: -1.5, opacity: 0.8 },
      active: { rotate: 0, opacity: 1 },
      transition: springSnappy,
    },
    line: { idle: { scaleX: 0, rotate: -8 }, active: { scaleX: 1, rotate: 0 }, transition: { duration: 0.55 } },
    frame: { idle: { opacity: 0.2, rotate: 1 }, active: { opacity: 1, rotate: 0 }, transition: springSoft },
    bg: { idle: { scale: 1.15, rotate: 0.5 }, active: { scale: 1.06, rotate: 0 }, transition: springSoft },
  },
];

export const getSpotlight = (index) => CENTER_SPOTLIGHTS[index % CENTER_SPOTLIGHTS.length];
