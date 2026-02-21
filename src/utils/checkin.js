export const CHECKIN_STORAGE_KEY = "rihea_daily_checkins_v1";

export const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeEntry = (entry) => {
  if (!entry || typeof entry !== "object") return null;
  const date = typeof entry.date === "string" ? entry.date : "";
  const mood = Number.isInteger(entry.mood) ? entry.mood : -1;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (mood < 0 || mood > 4) return null;
  return {
    date,
    mood,
    tag: typeof entry.tag === "string" ? entry.tag : "",
    note: typeof entry.note === "string" ? entry.note : "",
    updatedAt: Number.isFinite(entry.updatedAt) ? entry.updatedAt : Date.now(),
  };
};

export const readCheckIns = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHECKIN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeEntry)
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 90);
  } catch {
    return [];
  }
};

export const saveCheckIns = (entries) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(entries.slice(0, 90)));
  } catch {
    // ignore storage errors
  }
};

export const calcCheckInStreak = (entries) => {
  const dateSet = new Set(entries.map((item) => item.date));
  let streak = 0;
  const cursor = new Date();

  while (dateSet.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};
