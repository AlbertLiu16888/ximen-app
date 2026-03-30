const LOCAL_KEY = 'ximen_leaderboard';

export function getLocalLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveToLeaderboard(playerName, score, completedCount) {
  const board = getLocalLeaderboard();
  const existing = board.findIndex((e) => e.name === playerName);
  const entry = {
    name: playerName,
    score,
    completedCount,
    date: new Date().toISOString(),
  };
  if (existing >= 0) {
    if (board[existing].score < score) board[existing] = entry;
  } else {
    board.push(entry);
  }
  board.sort((a, b) => b.score - a.score);
  const top50 = board.slice(0, 50);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(top50));
  return top50;
}

export function getPlayerRank(playerName) {
  const board = getLocalLeaderboard();
  const idx = board.findIndex((e) => e.name === playerName);
  return idx >= 0 ? idx + 1 : null;
}
