import questionBank, { DAILY_QUESTION_COUNT } from './data';

/** 把 YYYY-MM-DD 转成稳定整数种子 */
export function dateSeed(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

export function formatDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 确定性洗牌，同一天同一题库顺序固定 */
export function seededShuffle(list, seed) {
  const arr = [...list];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 按难度分层抽题，保证每天既有入门也有巩固/拔高
 */
export function getDailyQuestions(date = new Date(), count = DAILY_QUESTION_COUNT) {
  const seed = dateSeed(date);
  const byDiff = {
    1: seededShuffle(questionBank.filter((q) => q.difficulty === 1), seed + 1),
    2: seededShuffle(questionBank.filter((q) => q.difficulty === 2), seed + 2),
    3: seededShuffle(questionBank.filter((q) => q.difficulty === 3), seed + 3),
  };

  const plan = [];
  // 默认 8 题：入门3 + 巩固4 + 拔高1
  const quota = { 1: 3, 2: 4, 3: 1 };
  Object.keys(quota).forEach((diff) => {
    const n = quota[diff];
    plan.push(...byDiff[diff].slice(0, n));
  });

  // 若某档不足，用全库补齐
  if (plan.length < count) {
    const used = new Set(plan.map((q) => q.id));
    const rest = seededShuffle(
      questionBank.filter((q) => !used.has(q.id)),
      seed + 9,
    );
    plan.push(...rest.slice(0, count - plan.length));
  }

  return seededShuffle(plan.slice(0, count), seed + 99);
}

export function getQuestionsByCategory(category) {
  if (!category || category === 'all') return questionBank;
  return questionBank.filter((q) => q.category === category);
}

export function getQuestionById(id) {
  return questionBank.find((q) => q.id === id);
}
