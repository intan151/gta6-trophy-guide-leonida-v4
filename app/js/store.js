// Leonida Ledger — saved progress. Everything lives in localStorage; nothing leaves the browser.
const PROGRESS_KEY = 'leonida-ledger-progress-v1';
const SETTINGS_KEY = 'leonida-ledger-settings-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { earned: {}, notes: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { earned: {}, notes: {} };
    return { earned: parsed.earned || {}, notes: parsed.notes || {} };
  } catch {
    return { earned: {}, notes: {} };
  }
}

export function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { spoilers: false };
    const parsed = JSON.parse(raw);
    return { spoilers: Boolean(parsed && parsed.spoilers) };
  } catch {
    return { spoilers: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function earnedCount(progress, trophies) {
  return trophies.filter((t) => progress.earned[t.id]).length;
}

export function countByGrade(progress, trophies, grade) {
  const list = trophies.filter((t) => t.grade === grade);
  return { earned: list.filter((t) => progress.earned[t.id]).length, total: list.length };
}

export function exportProgress(progress) {
  return JSON.stringify({ app: 'leonida-ledger', version: 1, exportedAt: new Date().toISOString(), progress }, null, 2);
}

export function importProgress(text) {
  const parsed = JSON.parse(text);
  const progress = parsed && parsed.progress ? parsed.progress : parsed;
  if (!progress || typeof progress !== 'object') throw new Error('That file is not a Leonida Ledger export.');
  const earned = {};
  const notes = {};
  for (const [key, value] of Object.entries(progress.earned || {})) {
    const id = Number(key);
    if (Number.isInteger(id) && value) earned[id] = true;
  }
  for (const [key, value] of Object.entries(progress.notes || {})) {
    const id = Number(key);
    if (Number.isInteger(id) && typeof value === 'string' && value.trim()) notes[id] = value.slice(0, 500);
  }
  return { earned, notes };
}
