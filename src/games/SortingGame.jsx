import { useState, useEffect, useRef } from 'react';

const CATEGORIES = [
  { id: 'sour', name: '酸', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/40' },
  { id: 'sweet', name: '甜', color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/40' },
  { id: 'bitter', name: '苦', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/40' },
  { id: 'spicy', name: '辣', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/40' },
];

const INGREDIENTS = [
  { name: '梅子', emoji: '🫒', category: 'sour' },
  { name: '檸檬', emoji: '🍋', category: 'sour' },
  { name: '醋', emoji: '🫙', category: 'sour' },
  { name: '甘蔗', emoji: '🎋', category: 'sweet' },
  { name: '蜂蜜', emoji: '🍯', category: 'sweet' },
  { name: '紅棗', emoji: '🫘', category: 'sweet' },
  { name: '苦瓜', emoji: '🥒', category: 'bitter' },
  { name: '蓮子', emoji: '🫛', category: 'bitter' },
  { name: '茶葉', emoji: '🍃', category: 'bitter' },
  { name: '辣椒', emoji: '🌶️', category: 'spicy' },
  { name: '薑', emoji: '🫚', category: 'spicy' },
  { name: '胡椒', emoji: '⚫', category: 'spicy' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SortingGame({ mission, timeLimit, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [items] = useState(() => shuffle(INGREDIENTS));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) { clearInterval(t); finish(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done, correct]);

  const finish = () => {
    setDone(true);
    const ratio = correct / INGREDIENTS.length;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const score = stars === 0 ? 0 : Math.round(mission.baseScore * (stars / 3));
    onComplete(stars, score, elapsed);
  };

  const handleSort = (categoryId) => {
    if (done || currentIdx >= items.length) return;
    const item = items[currentIdx];
    const isCorrect = item.category === categoryId;
    if (isCorrect) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (currentIdx + 1 >= items.length) finish();
      else setCurrentIdx((i) => i + 1);
    }, 500);
  };

  const currentItem = items[currentIdx];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="mb-3 flex gap-3 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className={`font-serif font-bold text-lg ${timeLeft <= 10 ? 'text-red-light' : 'text-gold'}`}>{timeLeft}s</span>
          <span className="text-jade font-serif text-sm">✓{correct}</span>
          <span className="text-red-light font-serif text-sm">✗{wrong}</span>
          <span className="text-parchment/60 font-serif text-sm">{currentIdx}/{INGREDIENTS.length}</span>
        </div>

        {/* Current item */}
        {currentItem && !done && (
          <div className={`bg-ink/85 backdrop-blur-sm border-2 rounded-xl p-4 mb-4 text-center transition-all
            ${feedback === 'correct' ? 'border-jade scale-105' : feedback === 'wrong' ? 'border-red-light scale-95' : 'border-gold'}`}>
            <span className="text-5xl block mb-2">{currentItem.emoji}</span>
            <span className="text-parchment font-serif font-bold text-lg">{currentItem.name}</span>
            <p className="text-parchment/50 font-serif text-xs mt-1">這是什麼味道？</p>
          </div>
        )}

        {/* Category buttons */}
        <div className="grid grid-cols-2 gap-3 max-w-xs w-full">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => handleSort(cat.id)} disabled={done}
              className={`p-4 rounded-xl border-2 ${cat.bg} font-serif text-lg font-bold transition-all hover:scale-105 active:scale-95`}>
              <span className={cat.color}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
