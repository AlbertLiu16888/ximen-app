import { useState, useEffect } from 'react';

export default function PlaceholderGame({ mission, timeLimit, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    setProgress((p) => {
      const next = p + 10 + Math.floor(Math.random() * 10);
      if (next >= 100) {
        const elapsed = timeLimit - timeLeft;
        const ratio = elapsed / timeLimit;
        const stars = ratio < 0.3 ? 3 : ratio < 0.6 ? 2 : 1;
        const multiplier = stars === 3 ? 1 : stars === 2 ? 0.7 : 0.4;
        setTimeout(() => onComplete(stars, Math.round(mission.baseScore * multiplier), elapsed), 300);
        return 100;
      }
      return next;
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="mb-4 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className="text-parchment font-serif text-sm">剩餘時間：</span>
          <span className={`font-serif font-bold text-lg ${timeLeft <= 10 ? 'text-red-light' : 'text-gold'}`}>
            {timeLeft}s
          </span>
        </div>

        <div className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-5 max-w-sm w-full shadow-2xl text-center">
          <h3 className="text-gold font-serif font-bold text-xl mb-2">{mission.name}</h3>
          <p className="text-parchment/70 font-serif text-xs mb-4">{mission.gameDescription}</p>

          {/* Progress bar */}
          <div className="h-3 bg-ink-light/30 rounded-full mb-4 overflow-hidden border border-gold/20">
            <div
              className="h-full bg-gradient-to-r from-gold to-jade rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gold font-serif text-sm mb-4">{Math.min(progress, 100)}%</p>

          {progress < 100 && (
            <button
              onClick={handleClick}
              className="w-full py-4 rounded-xl font-serif font-bold text-lg bg-gradient-to-b from-parchment-dark to-parchment text-ink border-2 border-gold hover:from-gold-light hover:to-gold active:scale-95 transition-all"
            >
              執行任務
            </button>
          )}
          {progress >= 100 && (
            <p className="text-jade font-serif font-bold">任務完成！</p>
          )}
        </div>
      </div>
    </div>
  );
}
