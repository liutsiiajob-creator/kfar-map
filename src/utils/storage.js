const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
export const load = (key, fallback) => safe(() => { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }, fallback);
export const save = (key, value) => safe(() => { localStorage.setItem(key, JSON.stringify(value)); return true; }, false);
