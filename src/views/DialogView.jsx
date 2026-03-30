import { useState } from 'react';
import TypewriterText from '../components/TypewriterText';

export default function DialogView({ mission, onStartGame, onBack }) {
  const [password, setPassword] = useState('');
  const [dialogDone, setDialogDone] = useState(false);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const handleSubmit = () => {
    if (password.trim() === mission.password) {
      setUnlocked(true);
      setError('');
    } else {
      setError('密語錯誤，請再試一次！');
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={mission.bg}
        alt={mission.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-20 bg-ink/70 backdrop-blur-sm text-parchment font-serif text-sm px-3 py-1.5 rounded-lg border border-gold/50 hover:border-gold transition-colors"
      >
        ← 返回地圖
      </button>

      {/* Mission title */}
      <div className="absolute top-4 right-4 z-20 bg-ink/70 backdrop-blur-sm text-gold font-serif font-bold text-sm px-3 py-1.5 rounded-lg border border-gold/50">
        關卡 {mission.id}：{mission.name}
      </div>

      {/* Dialog box at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <div className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-5 max-w-lg mx-auto shadow-2xl shadow-black/50">
          {/* Character dialog */}
          <div className="mb-4 min-h-[80px]">
            <p className="text-parchment font-serif text-sm leading-relaxed text-left">
              <TypewriterText
                text={mission.dialog}
                speed={35}
                onComplete={() => setDialogDone(true)}
              />
            </p>
          </div>

          {/* Password input */}
          {dialogDone && !unlocked && (
            <div className="border-t border-gold/30 pt-4 mt-2 animate-[fadeIn_0.5s_ease]">
              <p className="text-gold/70 font-serif text-xs mb-3">{mission.passwordHint}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="輸入通關密語..."
                  className="flex-1 bg-parchment/90 text-ink font-serif text-sm px-3 py-2 rounded-lg border border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 placeholder:text-ink-light/40"
                />
                <button
                  onClick={handleSubmit}
                  className="bg-gold text-ink font-serif font-bold text-sm px-4 py-2 rounded-lg hover:bg-gold-light active:scale-95 transition-all"
                >
                  確認
                </button>
              </div>
              {error && <p className="text-red-light font-serif text-xs mt-2">{error}</p>}
            </div>
          )}

          {/* Unlocked - start game */}
          {unlocked && (
            <div className="border-t border-gold/30 pt-4 mt-2 animate-[fadeIn_0.5s_ease] text-center">
              <p className="text-jade font-serif text-sm mb-3">✓ 密語正確！準備開始任務</p>
              <p className="text-parchment/70 font-serif text-xs mb-4">{mission.gameDescription}</p>
              <button
                onClick={onStartGame}
                className="bg-gradient-to-b from-jade to-jade-dark text-parchment font-serif font-bold text-base px-8 py-3 rounded-lg border border-jade hover:from-jade/90 hover:to-jade-dark/90 active:scale-95 transition-all shadow-lg shadow-black/30"
              >
                開始任務
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
