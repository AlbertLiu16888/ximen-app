import { useState, useEffect, useRef } from 'react';

const QUESTIONS = [
  {
    q: '1930 年代台灣的戲院放映電影前，通常會先進行什麼？',
    options: ['播放新聞片', '唱國歌', '抽獎活動', '廣播廣告'],
    answer: 0,
  },
  {
    q: '早期西門町的紅樓最初建造的主要用途是什麼？',
    options: ['百貨商場', '公有市場', '電影院', '政府機關'],
    answer: 1,
  },
  {
    q: '日治時期台灣電影院的座位通常如何安排？',
    options: ['自由入座', '依票價分區', '先到先坐', '按姓氏排列'],
    answer: 1,
  },
  {
    q: '1930 年代看電影時，觀眾常常會做什麼？',
    options: ['安靜觀看', '跟著大聲朗讀字幕', '站著看', '邊吃邊看不准出聲'],
    answer: 1,
  },
  {
    q: '西門紅樓的建築外觀是什麼形狀？',
    options: ['圓形', '八角形', '六角形', '正方形'],
    answer: 1,
  },
];

export default function QuizGame({ mission, timeLimit, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [done, setDone] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) { clearInterval(t); finishGame(score); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done, score]);

  const finishGame = (finalScore) => {
    setDone(true);
    const ratio = finalScore / QUESTIONS.length;
    const stars = ratio >= 0.8 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.4 ? 1 : 0;
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const s = stars === 0 ? 0 : Math.round(mission.baseScore * (stars / 3));
    onComplete(stars, s, elapsed);
  };

  const handleAnswer = (idx) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    const correct = idx === QUESTIONS[currentQ].answer;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((q) => q + 1);
        setSelected(null);
        setShowAnswer(false);
      } else {
        finishGame(newScore);
      }
    }, 1200);
  };

  const q = QUESTIONS[currentQ];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="mb-3 flex gap-4 bg-ink/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/50">
          <span className="text-parchment font-serif text-sm">第 {currentQ + 1}/{QUESTIONS.length} 題</span>
          <span className={`font-serif font-bold text-lg ${timeLeft <= 15 ? 'text-red-light' : 'text-gold'}`}>{timeLeft}s</span>
          <span className="text-jade font-serif text-sm">✓ {score}</span>
        </div>

        <div className="bg-ink/85 backdrop-blur-sm border-2 border-gold rounded-xl p-5 max-w-md w-full">
          <p className="text-parchment font-serif text-base leading-relaxed mb-4 text-center">{q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let cls = 'border-gold/40 bg-parchment/10 text-parchment hover:border-gold hover:bg-gold/10';
              if (showAnswer) {
                if (i === q.answer) cls = 'border-jade bg-jade/20 text-jade';
                else if (i === selected) cls = 'border-red-light bg-red/20 text-red-light';
                else cls = 'border-ink-light/20 bg-ink/20 text-parchment/30';
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={showAnswer}
                  className={`w-full p-3 rounded-lg border-2 font-serif text-sm text-left transition-all ${cls}`}>
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
