import { useState, useEffect, useRef } from 'react';

const ROLES = [
  { id: 'sheng', name: '生', desc: '男性正面角色', emoji: '🎭' },
  { id: 'dan', name: '旦', desc: '女性角色', emoji: '💃' },
  { id: 'jing', name: '淨', desc: '花臉角色', emoji: '🎨' },
  { id: 'chou', name: '丑', desc: '丑角', emoji: '🤡' },
];

const TRAITS = [
  { id: 't1', text: '素雅俊秀的淡妝，眉清目秀', role: 'sheng' },
  { id: 't2', text: '劍眉星目，英氣逼人', role: 'sheng' },
  { id: 't3', text: '柳葉細眉，桃腮粉面', role: 'dan' },
  { id: 't4', text: '鳳眼朱唇，華麗頭飾', role: 'dan' },
  { id: 't5', text: '大面積色塊臉譜，紅黑為主', role: 'jing' },
  { id: 't6', text: '濃烈粗獷的油彩，誇張線條', role: 'jing' },
  { id: 't7', text: '鼻樑白色豆腐塊', role: 'chou' },
  { id: 't8', text: '歪嘴斜眉，滑稽可愛造型', role: 'chou' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchingGame({ mission, timeLimit, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [traits] = useState(() => shuffle(TRAITS));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
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
    const ratio = correct / TRAITS.length;
    const stars = ratio >= 0.875 ? 3 : ratio >= 0.625 ? 2 : ratio >= 0.375 ? 1 : 0;
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const score = stars === 0 ? 0 : Math.round(mission.baseScore * (stars / 3));
    onComplete(stars, score, elapsed);
  };

  const handleMatch = (roleId) => {
    if (done || feedback) return;
    const trait = traits[currentIdx];
    const isCorrect = trait.role === roleId;
    if (isCorrect) setCorrect((c) => c + 1);
    setTotal((t) => t + 1);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      if (currentIdx + 1 >= traits.length) finish();
      else setCurrentIdx((i) => i + 1);
    }, 800);
  };

  const trait = traits[currentIdx];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="mb-3 flex gap-3 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className={`font-serif font-bold text-lg ${timeLeft <= 15 ? 'text-red-light' : 'text-gold'}`}>{timeLeft}s</span>
          <span className="text-jade font-serif text-sm">✓{correct}</span>
          <span className="text-parchment/60 font-serif text-sm">{currentIdx}/{TRAITS.length}</span>
        </div>

        {trait && !done && (
          <div className={`bg-ink/85 backdrop-blur-sm border-2 rounded-xl p-5 max-w-sm w-full mb-4 transition-all text-center
            ${feedback === 'correct' ? 'border-jade' : feedback === 'wrong' ? 'border-red-light' : 'border-gold'}`}>
            <p className="text-parchment font-serif text-base leading-relaxed">
              「{trait.text}」
            </p>
            <p className="text-parchment/40 font-serif text-xs mt-2">這是哪個角色的妝容特徵？</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 max-w-xs w-full">
          {ROLES.map((role) => (
            <button key={role.id} onClick={() => handleMatch(role.id)} disabled={done || !!feedback}
              className="p-4 rounded-xl border-2 border-gold/40 bg-parchment/10 font-serif transition-all hover:border-gold hover:bg-gold/10 active:scale-95">
              <span className="text-3xl block mb-1">{role.emoji}</span>
              <span className="text-gold font-bold text-lg block">{role.name}</span>
              <span className="text-parchment/50 text-xs">{role.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
