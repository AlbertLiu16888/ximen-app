import { useState, useEffect } from 'react';
import { missions, mapGuideText } from '../data/missions';
import { getLocalLeaderboard } from '../store/leaderboard';
import { sfx, haptic } from '../utils/sound';

export default function MapView({ playerName, currentScore, completedMissions, onSelectMission }) {
  const [showGuide, setShowGuide] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const getResult = (id) => completedMissions.find((m) => m.id === id);
  const isCompleted = (id) => completedMissions.some((m) => m.id === id);

  const handleSelectMission = (id) => {
    sfx.click();
    haptic('light');
    onSelectMission(id);
  };

  const openLeaderboard = () => {
    setLeaderboard(getLocalLeaderboard());
    setShowLeaderboard(true);
    sfx.click();
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src="/map.png" alt="西門町地圖" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/10" />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-3 py-2 bg-ink/70 backdrop-blur-sm border-b border-gold/50">
        <div className="text-parchment font-serif text-xs">
          <span className="text-gold font-bold">{playerName}</span>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-parchment font-serif text-xs">
            積分：<span className="text-gold font-bold">{currentScore}</span>
          </span>
          <span className="text-parchment font-serif text-xs">
            {completedMissions.length}/{missions.length}
          </span>
          <button onClick={() => setShowDropdown(!showDropdown)}
            className="text-gold font-serif text-xs border border-gold/40 rounded px-2 py-0.5 hover:bg-gold/10">
            任務列表
          </button>
          <button onClick={openLeaderboard}
            className="text-gold font-serif text-xs border border-gold/40 rounded px-2 py-0.5 hover:bg-gold/10">
            🏆 排行榜
          </button>
        </div>
      </div>

      {/* Guide tooltip */}
      {showGuide && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-ink/90 backdrop-blur-sm border border-gold rounded-lg p-3 max-w-xs shadow-lg"
          onClick={() => setShowGuide(false)}>
          <p className="text-parchment font-serif text-xs leading-relaxed">{mapGuideText}</p>
          <p className="text-gold/60 font-serif text-xs mt-1 text-center">點擊關閉</p>
        </div>
      )}

      {/* Mission dropdown */}
      {showDropdown && (
        <div className="absolute top-10 right-2 z-30 bg-ink/95 backdrop-blur-sm border border-gold rounded-lg shadow-2xl w-64 max-h-[70vh] overflow-y-auto">
          <div className="p-2 border-b border-gold/30">
            <h3 className="text-gold font-serif font-bold text-sm text-center">任務列表</h3>
          </div>
          {missions.map((m) => {
            const result = getResult(m.id);
            return (
              <button key={m.id} onClick={() => { setShowDropdown(false); handleSelectMission(m.id); }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gold/10 border-b border-gold/10 transition-colors text-left">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                  ${result ? 'bg-jade/80 border-jade text-white' : 'bg-ink-light/30 border-gold/30 text-gold'}`}>
                  {result ? '✓' : m.id}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-parchment font-serif text-xs block truncate">{m.name}</span>
                  {result && (
                    <span className="text-gold text-xs">
                      {'★'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}
                      <span className="text-parchment/40 ml-1">+{result.score}</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          <button onClick={() => setShowDropdown(false)}
            className="w-full py-2 text-parchment/50 font-serif text-xs hover:bg-gold/10">關閉</button>
        </div>
      )}

      {/* Leaderboard modal */}
      {showLeaderboard && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50" onClick={() => setShowLeaderboard(false)}>
          <div className="bg-ink/95 backdrop-blur-sm border-2 border-gold rounded-xl p-4 w-80 max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-gold font-serif font-bold text-lg text-center mb-3">🏆 排行榜</h3>
            <div className="space-y-1">
              {leaderboard.length === 0 && (
                <p className="text-parchment/50 font-serif text-xs text-center py-4">尚無紀錄</p>
              )}
              {leaderboard.slice(0, 20).map((entry, i) => (
                <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg
                  ${entry.name === playerName ? 'bg-gold/10 border border-gold/30' : ''}`}>
                  <span className={`w-6 text-center font-serif font-bold text-sm
                    ${i === 0 ? 'text-gold' : i === 1 ? 'text-parchment-dark' : i === 2 ? 'text-amber-600' : 'text-parchment/40'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span className="flex-1 text-parchment font-serif text-xs truncate">{entry.name}</span>
                  <span className="text-gold font-serif text-xs font-bold">{entry.score}</span>
                  <span className="text-parchment/40 font-serif text-xs">{entry.completedCount}關</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowLeaderboard(false)}
              className="w-full mt-3 py-2 rounded-lg bg-gold/20 text-gold font-serif text-sm border border-gold/30 hover:bg-gold/30">
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Map hotspots — flag pins */}
      {missions.map((mission) => {
        const done = isCompleted(mission.id);
        return (
          <button key={mission.id} onClick={() => handleSelectMission(mission.id)}
            className="absolute z-10 group"
            style={{ top: `${mission.mapPosition.top}%`, left: `${mission.mapPosition.left}%`, transform: 'translate(-50%, -100%)' }}>
            {/* Flag pin */}
            <div className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
              {/* Flag */}
              <div className="relative">
                <svg width="28" height="32" viewBox="0 0 28 32" className="drop-shadow-lg">
                  {/* Pole */}
                  <line x1="4" y1="6" x2="4" y2="32" stroke={done ? '#1a5c38' : '#7a1a1a'} strokeWidth="2.5" strokeLinecap="round" />
                  {/* Flag body */}
                  <path d={`M 4 4 L 24 4 C 22 8, 22 12, 24 16 L 4 16 Z`}
                    fill={done ? '#2d8b56' : '#c0392b'}
                    stroke={done ? '#1a5c38' : '#7a1a1a'}
                    strokeWidth="1"
                  />
                  {/* Flag text */}
                  <text x="14" y="12.5" textAnchor="middle" fontSize="8" fontWeight="bold"
                    fill="white" fontFamily="serif">
                    {done ? '✓' : mission.id}
                  </text>
                  {/* Pin dot at bottom */}
                  <circle cx="4" cy="31" r="2" fill={done ? '#2d8b56' : '#c0392b'} />
                </svg>
                {/* Bounce animation for incomplete missions */}
                {!done && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-light animate-ping opacity-60" />
                )}
              </div>
            </div>
            {/* Hover label */}
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-ink/90 text-parchment text-xs font-serif px-2 py-1 rounded border border-gold/30 shadow-lg">
              {mission.name}
              {done && (() => { const r = getResult(mission.id); return r ? ` ${'★'.repeat(r.stars)}` : ''; })()}
            </div>
          </button>
        );
      })}
    </div>
  );
}
