import { useState, useEffect, useRef } from 'react';

const SUSPECTS = [
  {
    name: '張太太',
    avatar: '👩',
    testimony: '我整晚都在舞池跳舞，從八點一直到十點半。我穿的是紅色旗袍，手上戴著珍珠項鏈。中間只去了一次化妝室，大約九點十五分，待了五分鐘就回來了。',
  },
  {
    name: '李先生',
    avatar: '🧑',
    testimony: '我大約八點半到場，一直在吧檯喝酒聊天。九點左右我看到張太太穿著藍色洋裝在舞池。我十點就先離開了，因為第二天一早有生意要談。',
  },
  {
    name: '王秘書',
    avatar: '👨‍💼',
    testimony: '我是跟署長一起到的，大約八點十五分。整晚我都在大廳招呼賓客。九點半的時候我注意到千金的手鐲還在她手上，因為燈光照得它特別閃亮。',
  },
  {
    name: '陳小姐',
    avatar: '👧',
    testimony: '我九點才到場，一進來就去找千金聊天。我們聊到九點半她就說手鐲不見了。我穿的是綠色禮服，整晚都和朋友在一起，沒有離開過大廳。',
  },
];

// 李先生 的證詞有矛盾：他說看到張太太穿「藍色洋裝」，但張太太說自己穿的是「紅色旗袍」
// 同時李先生說九點看到張太太在舞池，但張太太說九點十五去了化妝室
const GUILTY_INDEX = 1; // 李先生

const CLUES = [
  { text: '張太太說自己穿紅色旗袍，但李先生說看到她穿藍色洋裝。', highlight: true },
  { text: '王秘書九點半時看到手鐲還在，陳小姐說九點半就不見了。', highlight: false },
  { text: '李先生說九點看到張太太在舞池，但張太太說九點十五在化妝室。', highlight: true },
  { text: '陳小姐九點才到場，但手鐲九點半才失蹤。', highlight: false },
];

export default function DetectiveGame({ mission, timeLimit, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [phase, setPhase] = useState('read'); // read | clues | choose
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [viewingSuspect, setViewingSuspect] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (showResult) return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) { clearInterval(t); onComplete(0, 0, timeLimit); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showResult]);

  const handleChoose = (idx) => {
    setSelectedSuspect(idx);
    setShowResult(true);
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const correct = idx === GUILTY_INDEX;
    const stars = correct ? (elapsed < 60 ? 3 : elapsed < 90 ? 2 : 1) : 0;
    const score = correct ? Math.round(mission.baseScore * (stars === 3 ? 1 : stars === 2 ? 0.7 : 0.4)) : 0;
    setTimeout(() => onComplete(stars, score, elapsed), 1500);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 flex flex-col items-center h-full px-4 pt-4 overflow-y-auto">
        <div className="mb-3 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className="text-parchment font-serif text-sm">剩餘時間：</span>
          <span className={`font-serif font-bold text-lg ${timeLeft <= 20 ? 'text-red-light' : 'text-gold'}`}>{timeLeft}s</span>
        </div>

        {phase === 'read' && (
          <div className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-4 max-w-md w-full">
            <h3 className="text-gold font-serif font-bold text-base mb-3 text-center">嫌疑人證詞 ({viewingSuspect + 1}/4)</h3>
            <div className="bg-parchment/10 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{SUSPECTS[viewingSuspect].avatar}</span>
                <span className="text-gold font-serif font-bold">{SUSPECTS[viewingSuspect].name}</span>
              </div>
              <p className="text-parchment font-serif text-sm leading-relaxed">
                「{SUSPECTS[viewingSuspect].testimony}」
              </p>
            </div>
            <div className="flex gap-2">
              {viewingSuspect > 0 && (
                <button onClick={() => setViewingSuspect((v) => v - 1)}
                  className="flex-1 py-2 rounded-lg bg-ink-light/30 text-parchment font-serif text-sm border border-gold/30">上一位</button>
              )}
              {viewingSuspect < 3 ? (
                <button onClick={() => setViewingSuspect((v) => v + 1)}
                  className="flex-1 py-2 rounded-lg bg-gold text-ink font-serif font-bold text-sm">下一位</button>
              ) : (
                <button onClick={() => setPhase('clues')}
                  className="flex-1 py-2 rounded-lg bg-jade text-parchment font-serif font-bold text-sm">查看線索分析</button>
              )}
            </div>
          </div>
        )}

        {phase === 'clues' && (
          <div className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-4 max-w-md w-full">
            <h3 className="text-gold font-serif font-bold text-base mb-3 text-center">🔍 線索分析</h3>
            <div className="space-y-2 mb-4">
              {CLUES.map((c, i) => (
                <div key={i} className={`p-2 rounded-lg font-serif text-xs ${c.highlight ? 'bg-red/20 border border-red-light/30 text-parchment' : 'bg-parchment/10 text-parchment/70'}`}>
                  {c.text}
                </div>
              ))}
            </div>
            <button onClick={() => setPhase('choose')}
              className="w-full py-2 rounded-lg bg-gold text-ink font-serif font-bold text-sm">指認嫌疑人</button>
          </div>
        )}

        {phase === 'choose' && (
          <div className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-4 max-w-md w-full">
            <h3 className="text-gold font-serif font-bold text-base mb-3 text-center">誰最可疑？</h3>
            <div className="grid grid-cols-2 gap-2">
              {SUSPECTS.map((s, i) => (
                <button key={i} onClick={() => !showResult && handleChoose(i)}
                  disabled={showResult}
                  className={`p-3 rounded-lg border-2 font-serif text-sm transition-all
                    ${showResult && i === GUILTY_INDEX ? 'border-red-light bg-red/20 text-parchment' :
                      showResult && i === selectedSuspect && i !== GUILTY_INDEX ? 'border-red-light/50 bg-red/10 text-parchment/50' :
                      'border-gold/40 bg-parchment/10 text-parchment hover:border-gold hover:bg-gold/10'}`}
                >
                  <span className="text-2xl block mb-1">{s.avatar}</span>
                  <span className="font-bold">{s.name}</span>
                  {showResult && i === GUILTY_INDEX && <span className="block text-red-light text-xs mt-1">⚠ 證詞矛盾！</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
