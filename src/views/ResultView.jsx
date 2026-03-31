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

export default function ResultView({ mission, stars, score, onBackToMap, onRetry }) {
  const [show, setShow] = useState(false);
  const isFail = stars === 0;

  // On success: let the player see the result image for 3 seconds before showing the message
  useEffect(() => {
    const delay = isFail ? 300 : 3000;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [isFail]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={isFail ? mission.bg : mission.resultBg}
        alt={mission.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: show
            ? 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.2))'
            : 'linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0.1), rgba(0,0,0,0.05))',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <div
          className={`bg-ink/85 backdrop-blur-sm border-2 rounded-xl p-6 max-w-sm w-full shadow-2xl shadow-black/50 transition-all duration-700
            ${isFail ? 'border-red-light/50' : 'border-gold'}`}
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          }}
        >
          <h2 className={`font-serif font-bold text-xl mb-2 text-center ${isFail ? 'text-red-light' : 'text-gold'}`}>
            {isFail ? '任務失敗' : '任務完成！'}
          </h2>

          {!isFail && <StarRating stars={stars} />}

          <div className="bg-parchment/10 rounded-lg p-3 mb-4">
            <p className="text-parchment font-serif text-sm leading-relaxed text-center">
              「{isFail ? mission.failMessage : mission.successMessage}」
            </p>
          </div>

          {!isFail && (
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
          )}

          {isFail && (
            <p className="text-parchment/50 font-serif text-xs text-center mb-5">
              未達通關門檻，無法獲得獎勵與成績。
            </p>
          )}

          <div className="flex gap-2">
            {isFail && onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 bg-gradient-to-b from-jade to-jade-dark text-parchment font-serif font-bold text-base py-3 rounded-lg border border-jade hover:from-jade/90 active:scale-95 transition-all"
              >
                再次挑戰
              </button>
            )}
            <button
              onClick={onBackToMap}
              className={`${isFail && onRetry ? 'flex-1' : 'w-full'} bg-gradient-to-b from-gold to-gold/80 text-ink font-serif font-bold text-base py-3 rounded-lg border border-gold-light hover:from-gold-light hover:to-gold active:scale-95 transition-all shadow-lg shadow-black/30`}
            >
              返回地圖
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
