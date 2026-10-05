export const STORAGE_KEY = 'memory-game-leaderboard';
export const LEADERBOARD_LIMIT = 10;

export function compareScores(left, right) {
  if (left.moves !== right.moves) {
    return left.moves - right.moves;
  }

  return left.playedAt - right.playedAt;
}

export function formatScoreDate(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}.${month}.${year}`;
}

export function normalizeScore(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const moves = Number(entry.moves);
  const playedAt = Number(entry.playedAt);

  if (!Number.isInteger(moves) || moves < 0 || !Number.isFinite(playedAt)) {
    return null;
  }

  return { moves, playedAt };
}

export function rankScores(entries) {
  return entries
    .map(normalizeScore)
    .filter((entry) => entry !== null)
    .sort(compareScores)
    .slice(0, LEADERBOARD_LIMIT);
}

export function loadScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return rankScores(parsed);
  } catch {
    return [];
  }
}

export function saveScore(moves) {
  const next = rankScores([
    ...loadScores(),
    { moves, playedAt: Date.now() },
  ]);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
