import { useState, useEffect, useRef } from 'react';

const TEA_STEPS = [
  { id: 1, name: '溫壺', desc: '以熱水溫暖茶壺', duration: 5, icon: '🫖' },
  { id: 2, name: '置茶', desc: '放入適量茶葉', duration: 3, icon: '🍃' },
  { id: 3, name: '注水', desc: '注入 95°C 熱水', duration: 4, icon: '💧' },
  { id: 4, name: '浸泡', desc: '等待茶葉舒展（按住計時）', duration: 8, icon: '⏳' },
  { id: 5, name: '出湯', desc: '將茶湯倒入茶海', duration: 3, icon: '🍵' },
];

export default function TeaGame({ mission, timeLimit, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [stepTimer, setStepTimer] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [stepResults, setStepResults] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const holdInterval = useRef(null);
  const startTime = useRef(Date.now());

  // Global timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          finishGame([...stepResults]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, stepResults]);

  const step = TEA_STEPS[currentStep];

  const startHold = () => {
    if (gameOver || !step) return;
    setIsHolding(true);
    setStepTimer(0);
    holdInterval.current = setInterval(() => {
      setStepTimer((t) => t + 0.1);
    }, 100);
  };

  const stopHold = () => {
    if (!isHolding || !step) return;
    setIsHolding(false);
    clearInterval(holdInterval.current);

    const target = step.duration;
    const diff = Math.abs(stepTimer - target);
    const accuracy = Math.max(0, 1 - diff / target);
    const result = { stepId: step.id, accuracy, time: stepTimer, target };

    const newResults = [...stepResults, result];
    setStepResults(newResults);

    if (currentStep < TEA_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      setStepTimer(0);
    } else {
      finishGame(newResults);
    }
  };

  const finishGame = (results) => {
    setGameOver(true);
    const completedSteps = results.length;
    const avgAccuracy = completedSteps > 0
      ? results.reduce((sum, r) => sum + r.accuracy, 0) / TEA_STEPS.length
      : 0;
    const stars = avgAccuracy >= 0.8 ? 3 : avgAccuracy >= 0.5 ? 2 : 1;
    const scoreMultiplier = stars === 3 ? 1 : stars === 2 ? 0.7 : 0.4;
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    onComplete(stars, Math.round(mission.baseScore * scoreMultiplier), elapsed);
  };

  const progressPct = step ? Math.min((stepTimer / step.duration) * 100, 150) : 0;
  const isInRange = step && stepTimer >= step.duration * 0.7 && stepTimer <= step.duration * 1.3;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Timer */}
        <div className="mb-4 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className="text-parchment font-serif text-sm">剩餘時間：</span>
          <span className={`font-serif font-bold text-lg ${timeLeft <= 15 ? 'text-red-light' : 'text-gold'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Step progress */}
        <div className="flex gap-2 mb-4">
          {TEA_STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all
                ${i < currentStep
                  ? 'bg-jade/80 border-jade text-white'
                  : i === currentStep
                    ? 'bg-gold/80 border-gold text-ink scale-110'
                    : 'bg-ink-light/30 border-ink-light/30 text-parchment/40'
                }`}
            >
              {i < currentStep ? '✓' : s.icon}
            </div>
          ))}
        </div>

        {step && !gameOver && (
          <div className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-4xl">{step.icon}</span>
              <h3 className="text-gold font-serif font-bold text-xl mt-2">
                步驟 {currentStep + 1}：{step.name}
              </h3>
              <p className="text-parchment/70 font-serif text-xs mt-1">{step.desc}</p>
              <p className="text-gold/60 font-serif text-xs mt-1">
                目標時間：{step.duration} 秒
              </p>
            </div>

            {/* Progress bar */}
            <div className="relative h-4 bg-ink-light/30 rounded-full mb-4 overflow-hidden border border-gold/20">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  isInRange ? 'bg-jade' : progressPct > 100 ? 'bg-red' : 'bg-gold'
                }`}
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              />
              {/* Target zone marker */}
              <div
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-parchment/50"
                style={{ left: '70%' }}
              />
              <div
                className="absolute top-0 bottom-0 border-r-2 border-dashed border-parchment/50"
                style={{ left: '100%' }}
              />
            </div>

            <p className="text-center text-parchment font-serif text-lg mb-3">
              {isHolding ? `${stepTimer.toFixed(1)}s` : '按住開始計時'}
            </p>

            {/* Hold button */}
            <button
              onMouseDown={startHold}
              onMouseUp={stopHold}
              onMouseLeave={() => isHolding && stopHold()}
              onTouchStart={(e) => { e.preventDefault(); startHold(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopHold(); }}
              className={`w-full py-4 rounded-xl font-serif font-bold text-lg transition-all select-none
                ${isHolding
                  ? isInRange
                    ? 'bg-jade text-parchment scale-95 border-2 border-jade'
                    : 'bg-gold/80 text-ink scale-95 border-2 border-gold'
                  : 'bg-gradient-to-b from-parchment-dark to-parchment text-ink border-2 border-gold hover:from-gold-light hover:to-gold active:scale-95'
                }`}
            >
              {isHolding ? (isInRange ? '✓ 放開！' : '按住中...') : `按住 ${step.name}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
