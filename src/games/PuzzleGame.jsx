import { useState, useEffect, useCallback, useRef } from 'react';

const GRID = 3; // 3x3 puzzle
const TOTAL = GRID * GRID;

function shuffleTiles() {
  // Create solvable shuffle by doing random moves from solved state
  const tiles = Array.from({ length: TOTAL }, (_, i) => i); // 0 = empty
  let emptyIdx = 0;
  const getNeighbors = (idx) => {
    const neighbors = [];
    const r = Math.floor(idx / GRID), c = idx % GRID;
    if (r > 0) neighbors.push(idx - GRID);
    if (r < GRID - 1) neighbors.push(idx + GRID);
    if (c > 0) neighbors.push(idx - 1);
    if (c < GRID - 1) neighbors.push(idx + 1);
    return neighbors;
  };
  for (let i = 0; i < 100; i++) {
    const neighbors = getNeighbors(emptyIdx);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[emptyIdx], tiles[pick]] = [tiles[pick], tiles[emptyIdx]];
    emptyIdx = pick;
  }
  return tiles;
}

export default function PuzzleGame({ mission, timeLimit, onComplete }) {
  const [tiles, setTiles] = useState(() => shuffleTiles());
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [solved, setSolved] = useState(false);
  const startTime = useRef(Date.now());

  // Timer
  useEffect(() => {
    if (solved) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          // Time's up - give 1 star
          const elapsed = timeLimit;
          onComplete(1, Math.round(mission.baseScore * 0.3), elapsed);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [solved]);

  // Check if solved
  useEffect(() => {
    if (tiles.every((t, i) => t === i)) {
      setSolved(true);
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      const ratio = elapsed / timeLimit;
      const stars = ratio < 0.4 ? 3 : ratio < 0.7 ? 2 : 1;
      const scoreMultiplier = stars === 3 ? 1 : stars === 2 ? 0.7 : 0.4;
      onComplete(stars, Math.round(mission.baseScore * scoreMultiplier), elapsed);
    }
  }, [tiles]);

  const handleTileClick = useCallback((idx) => {
    if (solved) return;
    setTiles((prev) => {
      const emptyIdx = prev.indexOf(0);
      const r1 = Math.floor(idx / GRID), c1 = idx % GRID;
      const r2 = Math.floor(emptyIdx / GRID), c2 = emptyIdx % GRID;
      const isAdjacent = (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
      if (!isAdjacent) return prev;
      const next = [...prev];
      [next[idx], next[emptyIdx]] = [next[emptyIdx], next[idx]];
      return next;
    });
  }, [solved]);

  const pct = 100 / GRID;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={mission.gameBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Timer */}
        <div className="mb-4 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className="text-parchment font-serif text-sm">剩餘時間：</span>
          <span className={`font-serif font-bold text-lg ${timeLeft <= 10 ? 'text-red-light' : 'text-gold'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Game instruction */}
        <p className="text-parchment/80 font-serif text-xs mb-3 text-center">
          點擊數字方塊移動，將 1-8 依序排列即可完成拼圖
        </p>

        {/* Puzzle grid */}
        <div
          className="relative bg-ink/60 backdrop-blur-sm rounded-xl border-2 border-gold/50 overflow-hidden shadow-2xl"
          style={{ width: 'min(80vw, 320px)', height: 'min(80vw, 320px)' }}
        >
          {tiles.map((tile, idx) => {
            if (tile === 0) return null;
            const row = Math.floor(idx / GRID);
            const col = idx % GRID;
            const isCorrect = tile === idx;
            return (
              <button
                key={tile}
                onClick={() => handleTileClick(idx)}
                className={`absolute flex items-center justify-center font-serif font-bold text-2xl
                  rounded-lg border transition-all duration-150 active:scale-95
                  ${isCorrect
                    ? 'bg-jade/80 border-jade text-parchment'
                    : 'bg-gradient-to-b from-parchment-dark to-parchment border-gold text-ink hover:from-gold-light hover:to-gold'
                  }`}
                style={{
                  width: `${pct - 2}%`,
                  height: `${pct - 2}%`,
                  top: `${row * pct + 1}%`,
                  left: `${col * pct + 1}%`,
                }}
              >
                {tile}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
