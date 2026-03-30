import { useState, useEffect, useRef } from 'react';

const STEPS = [
  { id: 0, name: '磨製麵粉', emoji: '🌾', desc: '將小麥磨製成細緻的麵粉' },
  { id: 1, name: '揉製麵糰', emoji: '🫳', desc: '加水揉製出有彈性的麵糰' },
  { id: 2, name: '拉製麵線', emoji: '🍜', desc: '將麵糰拉製成細長的麵線' },
  { id: 3, name: '熬煮高湯', emoji: '🫕', desc: '以大骨熬煮濃郁的高湯底' },
  { id: 4, name: '煮麵線', emoji: '♨️', desc: '將麵線放入高湯中煮至軟嫩' },
  { id: 5, name: '加入肉羹', emoji: '🥩', desc: '加入手工肉羹增添風味' },
  { id: 6, name: '加入佐料', emoji: '🧄', desc: '加入蝦仁、香菜等佐料' },
  { id: 7, name: '完成上桌', emoji: '🥣', desc: '盛碗淋上特製醬汁上桌' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CookingGame({ mission, timeLimit, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [shuffled] = useState(() => shuffle(STEPS));
  const [selected, setSelected] = useState([]);
  const [done, setDone] = useState(false);
  const [showError, setShowError] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) { clearInterval(t); onComplete(0, 0, timeLimit); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  const handleSelect = (step) => {
    if (done) return;
    const expectedIdx = selected.length;
    if (step.id === expectedIdx) {
      const next = [...selected, step.id];
      setSelected(next);
      setShowError(false);
      if (next.length === STEPS.length) {
        setDone(true);
        const elapsed = Math.round((Date.now() - startTime.current) / 1000);
        const ratio = elapsed / timeLimit;
        const stars = ratio < 0.4 ? 3 : ratio < 0.7 ? 2 : 1;
        const score = Math.round(mission.baseScore * (stars === 3 ? 1 : stars === 2 ? 0.7 : 0.4));
        onComplete(stars, score, elapsed);
      }
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 1000);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="mb-3 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className="text-parchment font-serif text-sm">剩餘時間：</span>
          <span className={`font-serif font-bold text-lg ${timeLeft <= 15 ? 'text-red-light' : 'text-gold'}`}>{timeLeft}s</span>
          <span className="text-parchment font-serif text-sm ml-4">步驟：{selected.length}/{STEPS.length}</span>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-3 max-w-md flex-wrap justify-center">
          {STEPS.map((s, i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-all
              ${i < selected.length ? 'bg-jade/80 border-jade text-white' : i === selected.length ? 'bg-gold/30 border-gold text-gold animate-pulse' : 'bg-ink/30 border-ink-light/20 text-parchment/30'}`}>
              {i < selected.length ? '✓' : s.emoji}
            </div>
          ))}
        </div>

        {showError && (
          <div className="mb-2 bg-red/20 border border-red-light/40 rounded-lg px-3 py-1">
            <span className="text-red-light font-serif text-xs">順序不對！請選擇正確的下一步</span>
          </div>
        )}

        <p className="text-gold/70 font-serif text-xs mb-3">
          請選擇第 {selected.length + 1} 步：{selected.length < STEPS.length ? STEPS[selected.length].desc : '完成！'}
        </p>

        {/* Choices */}
        <div className="grid grid-cols-2 gap-2 max-w-sm w-full">
          {shuffled.map((step) => {
            const isDone = selected.includes(step.id);
            return (
              <button key={step.id} onClick={() => handleSelect(step)} disabled={isDone || done}
                className={`p-3 rounded-lg border-2 font-serif text-sm transition-all
                  ${isDone ? 'border-jade/30 bg-jade/10 text-jade/50' : 'border-gold/40 bg-parchment/10 text-parchment hover:border-gold hover:bg-gold/10 active:scale-95'}`}>
                <span className="text-xl block">{step.emoji}</span>
                <span className="text-xs">{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
