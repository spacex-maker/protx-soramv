const STORAGE_KEY = 'jiazi-python-practice-v1';

const defaultState = () => ({
  answers: {}, // id -> { choice, correct, at }
  dailyDone: {}, // dateKey -> { correct, total, finishedAt }
  expanded: {}, // optional, not required
});

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      answers: parsed.answers || {},
      dailyDone: parsed.dailyDone || {},
    };
  } catch {
    return defaultState();
  }
}

export function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordAnswer(questionId, choice, correct) {
  const state = loadProgress();
  state.answers[questionId] = {
    choice,
    correct,
    at: new Date().toISOString(),
  };
  saveProgress(state);
  return state;
}

export function markDailyFinished(dateKey, correct, total) {
  const state = loadProgress();
  state.dailyDone[dateKey] = {
    correct,
    total,
    finishedAt: new Date().toISOString(),
  };
  saveProgress(state);
  return state;
}

export function getWrongQuestionIds() {
  const state = loadProgress();
  return Object.entries(state.answers)
    .filter(([, v]) => v && v.correct === false)
    .map(([id]) => id);
}

export function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
