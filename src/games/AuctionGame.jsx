import { useState, useEffect, useRef } from 'react';

const ITEMS_POOL = [
  { name: '翡翠玉佩', emoji: '💎', basePrice: 200, isTarget: true },
  { name: '青花瓷瓶', emoji: '🏺', basePrice: 150, isTarget: true },
  { name: '銅製香爐', emoji: '🪔', basePrice: 80, isTarget: false },
  { name: '木雕佛像', emoji: '🗿', basePrice: 120, isTarget: false },
  { name: '古書手稿', emoji: '📜', basePrice: 100, isTarget: false },
];

const TOTAL_BUDGET = 600;

export default function AuctionGame({ mission, timeLimit, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [budget, setBudget] = useState(TOTAL_BUDGET);
  const [round, setRound] = useState(0);
  const [currentBid, setCurrentBid] = useState(0);
  const [aiBid, setAiBid] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro | bidding | result | done
  const [won, setWon] = useState([]);
  const [roundResult, setRoundResult] = useState(null);
  const startTime = useRef(Date.now());

  const item = ITEMS_POOL[round];
  const targetsWon = won.filter((w) => w.isTarget).length;

  useEffect(() => {
    if (phase === 'done') return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) { clearInterval(t); endGame(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const endGame = () => {
    setPhase('done');
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const stars = targetsWon >= 2 ? 3 : targetsWon === 1 ? 2 : 0;
    const score = stars === 0 ? 0 : Math.round(mission.baseScore * (stars / 3));
    onComplete(stars, score, elapsed);
  };

  const startBidding = () => {
    const base = item.basePrice;
    setCurrentBid(base);
    setAiBid(base + Math.floor(Math.random() * 40) + 10);
    setPhase('bidding');
  };

  const placeBid = (amount) => {
    if (amount > budget) return;
    const newAiBid = aiBid + Math.floor(Math.random() * 30) + 10;
    if (amount >= newAiBid) {
      // Player wins
      setBudget((b) => b - amount);
      setWon((w) => [...w, item]);
      setRoundResult({ won: true, price: amount });
    } else {
      setAiBid(newAiBid);
      setRoundResult({ won: false, aiPrice: newAiBid });
    }
    setPhase('result');
  };

  const nextRound = () => {
    if (round + 1 >= ITEMS_POOL.length) {
      endGame();
    } else {
      setRound((r) => r + 1);
      setPhase('intro');
      setRoundResult(null);
      setCurrentBid(0);
      setAiBid(0);
    }
  };

  const bidOptions = item ? [
    item.basePrice,
    Math.round(item.basePrice * 1.3),
    Math.round(item.basePrice * 1.6),
    Math.round(item.basePrice * 2),
  ] : [];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="mb-3 flex gap-3 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className={`font-serif font-bold text-lg ${timeLeft <= 20 ? 'text-red-light' : 'text-gold'}`}>{timeLeft}s</span>
          <span className="text-parchment font-serif text-sm">預算：<span className="text-gold font-bold">${budget}</span></span>
          <span className="text-jade font-serif text-sm">珍品：{targetsWon}/2</span>
        </div>

        <div className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-4 max-w-sm w-full">
          <h3 className="text-gold font-serif font-bold text-sm mb-1 text-center">第 {round + 1}/{ITEMS_POOL.length} 件拍品</h3>

          {item && (
            <div className="text-center mb-3">
              <span className="text-4xl block">{item.emoji}</span>
              <span className="text-parchment font-serif font-bold text-lg">{item.name}</span>
              {item.isTarget && <span className="block text-gold text-xs font-serif">⭐ 指定珍品</span>}
              <span className="block text-parchment/50 text-xs font-serif">起拍價：${item.basePrice}</span>
            </div>
          )}

          {phase === 'intro' && (
            <button onClick={startBidding} className="w-full py-3 rounded-lg bg-gold text-ink font-serif font-bold active:scale-95 transition-all">
              開始競拍
            </button>
          )}

          {phase === 'bidding' && (
            <>
              <p className="text-parchment/70 font-serif text-xs mb-2 text-center">對手出價：<span className="text-red-light font-bold">${aiBid}</span></p>
              <div className="grid grid-cols-2 gap-2">
                {bidOptions.map((amt) => (
                  <button key={amt} onClick={() => placeBid(amt)} disabled={amt > budget}
                    className={`py-2 rounded-lg border-2 font-serif text-sm font-bold transition-all
                      ${amt > budget ? 'border-ink-light/20 text-parchment/30 bg-ink/20' :
                        amt >= aiBid ? 'border-jade bg-jade/20 text-jade hover:bg-jade/30' :
                        'border-gold/40 bg-parchment/10 text-parchment hover:border-gold'}`}>
                    ${amt}
                  </button>
                ))}
              </div>
              <button onClick={() => { setRoundResult({ won: false, passed: true }); setPhase('result'); }}
                className="w-full mt-2 py-2 rounded-lg border border-parchment/20 text-parchment/50 font-serif text-xs">
                放棄此件
              </button>
            </>
          )}

          {phase === 'result' && roundResult && (
            <div className="text-center">
              {roundResult.won ? (
                <div className="text-jade font-serif">
                  <p className="font-bold text-lg">🎉 拍得！</p>
                  <p className="text-sm">以 ${roundResult.price} 得標</p>
                </div>
              ) : (
                <div className="text-parchment/60 font-serif">
                  <p className="font-bold">{roundResult.passed ? '已跳過' : '被搶走了！'}</p>
                </div>
              )}
              <button onClick={nextRound} className="mt-3 w-full py-2 rounded-lg bg-gold text-ink font-serif font-bold active:scale-95">
                {round + 1 >= ITEMS_POOL.length ? '結算' : '下一件'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
