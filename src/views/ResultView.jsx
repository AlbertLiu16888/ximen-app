import { useEffect, useState } from 'react';

function StarRating({ stars }) {
  return (
    <div className="flex justify-center gap-2 mb-4">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`text-4xl star-animate ${i <= stars ? 'text-gold' : 'text-ink-light/30'}`}
          style={{ animationDelay: `${(i - 1) * 0.3}s` }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ResultView({ mission, stars, score, onBackToMap }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={mission.resultBg}
        alt={mission.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <div
          className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-6 max-w-sm w-full shadow-2xl shadow-black/50 transition-all duration-700"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          }}
        >
          <h2 className="text-gold font-serif font-bold text-xl mb-2 text-center">任務完成！</h2>

          <StarRating stars={stars} />

          <div className="bg-parchment/10 rounded-lg p-3 mb-4">
            <p className="text-parchment font-serif text-sm leading-relaxed text-center">
              「{mission.successMessage}」
            </p>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-sm font-serif">
              <span className="text-parchment/70">獲得積分</span>
              <span className="text-gold font-bold">+{score}</span>
            </div>
            <div className="flex justify-between text-sm font-serif">
              <span className="text-parchment/70">獲得物品</span>
              <span className="text-jade font-bold">{mission.reward}</span>
            </div>
            <div className="flex justify-between text-sm font-serif">
              <span className="text-parchment/70">星等評價</span>
              <span className="text-gold">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
            </div>
          </div>

          <button
            onClick={onBackToMap}
            className="w-full bg-gradient-to-b from-gold to-gold/80 text-ink font-serif font-bold text-base py-3 rounded-lg border border-gold-light hover:from-gold-light hover:to-gold active:scale-95 transition-all shadow-lg shadow-black/30"
          >
            返回地圖
          </button>
        </div>
      </div>
    </div>
  );
}
