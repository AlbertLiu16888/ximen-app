import { useState, useEffect, useRef } from 'react';

// A simple substitution cipher
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CIPHER =   'QWERTYUIOPASDFGHJKLZXCVBNM';
const SECRET_MESSAGE = 'XIMEN IS AMAZING';
const ENCODED = SECRET_MESSAGE.split('').map((c) => {
  const idx = ALPHABET.indexOf(c);
  return idx >= 0 ? CIPHER[idx] : c;
}).join('');

// Hints: reveal some mappings
const INITIAL_HINTS = { Q: 'A', Z: 'X' }; // Reveal A and X

export default function CipherGame({ mission, timeLimit, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [activeChar, setActiveChar] = useState(null);
  const startTime = useRef(Date.now());

  // Build unique cipher chars that need solving
  const uniqueChars = [...new Set(ENCODED.split('').filter((c) => c !== ' '))];
  const neededMappings = {};
  ENCODED.split('').forEach((c, i) => {
    if (c !== ' ') neededMappings[c] = SECRET_MESSAGE[i];
  });

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) { clearInterval(t); finish(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  const finish = () => {
    setDone(true);
    let correct = 0, total = 0;
    for (const [cipher, plain] of Object.entries(neededMappings)) {
      if (INITIAL_HINTS[cipher]) continue;
      total++;
      if (answers[cipher] === plain) correct++;
    }
    const ratio = total > 0 ? correct / total : 0;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0;
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const score = stars === 0 ? 0 : Math.round(mission.baseScore * (stars / 3));
    onComplete(stars, score, elapsed);
  };

  const handleInput = (letter) => {
    if (!activeChar || done || INITIAL_HINTS[activeChar]) return;
    setAnswers((a) => {
      const next = { ...a, [activeChar]: letter };
      // Check if all solved
      let allCorrect = true;
      for (const [cipher, plain] of Object.entries(neededMappings)) {
        if (INITIAL_HINTS[cipher]) continue;
        if (next[cipher] !== plain) { allCorrect = false; break; }
      }
      if (allCorrect) setTimeout(finish, 500);
      return next;
    });
    setActiveChar(null);
  };

  const getDecoded = (cipherChar) => {
    if (INITIAL_HINTS[cipherChar]) return INITIAL_HINTS[cipherChar];
    return answers[cipherChar] || '_';
  };

  const isCorrect = (cipherChar) => {
    const decoded = getDecoded(cipherChar);
    return decoded === neededMappings[cipherChar];
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="mb-3 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className="text-parchment font-serif text-sm">剩餘時間：</span>
          <span className={`font-serif font-bold text-lg ${timeLeft <= 15 ? 'text-red-light' : 'text-gold'}`}>{timeLeft}s</span>
        </div>

        <div className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-4 max-w-md w-full">
          <h3 className="text-gold font-serif font-bold text-sm mb-1 text-center">神秘電碼</h3>
          <p className="text-parchment/50 font-serif text-xs mb-3 text-center">點擊密文字母，再選擇對應的明文</p>

          {/* Cipher display */}
          <div className="bg-ink/60 rounded-lg p-3 mb-3 font-mono">
            <div className="flex flex-wrap gap-1 justify-center mb-2">
              {ENCODED.split('').map((c, i) => (
                c === ' ' ? <span key={i} className="w-4" /> : (
                  <button key={i} onClick={() => !INITIAL_HINTS[c] && setActiveChar(c)}
                    className={`w-8 h-10 rounded border flex flex-col items-center justify-center text-xs transition-all
                      ${activeChar === c ? 'border-gold bg-gold/20' :
                        INITIAL_HINTS[c] ? 'border-jade/40 bg-jade/10' :
                        isCorrect(c) ? 'border-jade bg-jade/20' :
                        'border-gold/30 bg-ink/40 hover:border-gold'}`}>
                    <span className="text-parchment/40">{c}</span>
                    <span className={`font-bold ${isCorrect(c) ? 'text-jade' : 'text-gold'}`}>
                      {getDecoded(c)}
                    </span>
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Reference table */}
          <div className="bg-parchment/5 rounded-lg p-2 mb-3">
            <p className="text-parchment/40 font-serif text-xs mb-1 text-center">已知對照：</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {Object.entries(INITIAL_HINTS).map(([c, p]) => (
                <span key={c} className="text-jade font-mono text-xs">{c}→{p}</span>
              ))}
              {Object.entries(answers).filter(([c]) => !INITIAL_HINTS[c] && isCorrect(c)).map(([c, p]) => (
                <span key={c} className="text-gold font-mono text-xs">{c}→{p}</span>
              ))}
            </div>
          </div>

          {/* Letter keyboard */}
          {activeChar && (
            <div>
              <p className="text-gold font-serif text-xs mb-1 text-center">選擇 {activeChar} 對應的字母：</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {ALPHABET.split('').map((l) => (
                  <button key={l} onClick={() => handleInput(l)}
                    className="w-7 h-7 rounded bg-parchment/10 border border-gold/30 text-parchment font-mono text-xs hover:bg-gold/20 active:scale-90 transition-all">
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!activeChar && !done && (
            <p className="text-parchment/40 font-serif text-xs text-center">點擊上方密文字母開始破譯</p>
          )}

          <button onClick={finish} disabled={done}
            className="w-full mt-3 py-2 rounded-lg bg-gold/80 text-ink font-serif font-bold text-sm active:scale-95 transition-all">
            提交解碼結果
          </button>
        </div>
      </div>
    </div>
  );
}
