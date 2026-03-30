import { useState, useEffect, useRef } from 'react';

const OFFERINGS = [
  { id: 'fruit', name: '水果盤', emoji: '🍊', slot: 0 },
  { id: 'incense', name: '香爐', emoji: '🪔', slot: 1 },
  { id: 'flowers', name: '鮮花', emoji: '💐', slot: 2 },
  { id: 'candle', name: '燭台', emoji: '🕯️', slot: 3 },
  { id: 'rice', name: '米飯', emoji: '🍚', slot: 4 },
  { id: 'wine', name: '酒杯', emoji: '🍶', slot: 5 },
];

const SLOT_NAMES = ['左前方', '正中央', '右前方', '左後方', '正後方', '右後方'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ShrineGame({ mission, timeLimit, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [items] = useState(() => shuffle(OFFERINGS));
  const [placed, setPlaced] = useState({});
  const [dragging, setDragging] = useState(null);
  const [done, setDone] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(t);
          finish(Object.keys(placed).length);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done, placed]);

  const finish = (correctCount) => {
    setDone(true);
    const ratio = correctCount / OFFERINGS.length;
    const stars = ratio >= 1 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0;
    if (stars === 0) {
      onComplete(0, 0, timeLimit);
      return;
    }
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const timeBonus = Math.max(0, 1 - elapsed / timeLimit);
    const score = Math.round(mission.baseScore * (0.4 + 0.6 * timeBonus) * ratio);
    onComplete(stars, score, elapsed);
  };

  const handleDrop = (slotIdx) => {
    if (!dragging || done) return;
    const item = items.find((i) => i.id === dragging);
    if (item && item.slot === slotIdx) {
      setPlaced((p) => {
        const next = { ...p, [item.id]: slotIdx };
        if (Object.keys(next).length === OFFERINGS.length) {
          setTimeout(() => finish(OFFERINGS.length), 300);
        }
        return next;
      });
    }
    setDragging(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="mb-3 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className="text-parchment font-serif text-sm">剩餘時間：</span>
          <span className={`font-serif font-bold text-lg ${timeLeft <= 10 ? 'text-red-light' : 'text-gold'}`}>{timeLeft}s</span>
          <span className="text-parchment font-serif text-sm ml-4">已歸位：{Object.keys(placed).length}/{OFFERINGS.length}</span>
        </div>

        {/* Drop slots (shrine positions) */}
        <div className="grid grid-cols-3 gap-2 mb-4 max-w-xs w-full">
          {SLOT_NAMES.map((name, idx) => {
            const placedItem = OFFERINGS.find((o) => o.slot === idx && placed[o.id] !== undefined);
            return (
              <div
                key={idx}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                onTouchEnd={() => handleDrop(idx)}
                className={`h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all
                  ${placedItem ? 'border-jade bg-jade/20' : 'border-gold/40 bg-ink/40'}`}
              >
                {placedItem ? (
                  <>
                    <span className="text-2xl">{placedItem.emoji}</span>
                    <span className="text-jade font-serif text-xs">✓</span>
                  </>
                ) : (
                  <span className="text-parchment/50 font-serif text-xs text-center">{name}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Draggable items */}
        <div className="flex flex-wrap gap-2 justify-center max-w-xs">
          {items.filter((i) => !placed[i.id]).map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragging(item.id)}
              onTouchStart={() => setDragging(item.id)}
              className={`bg-parchment/90 rounded-lg px-3 py-2 border-2 border-gold cursor-grab active:cursor-grabbing
                flex flex-col items-center transition-all hover:scale-105 active:scale-95
                ${dragging === item.id ? 'ring-2 ring-gold scale-95' : ''}`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-ink font-serif text-xs">{item.name}</span>
            </div>
          ))}
        </div>

        <p className="text-parchment/60 font-serif text-xs mt-3 text-center">
          拖曳供品到神龕上正確的位置
        </p>
      </div>
    </div>
  );
}
