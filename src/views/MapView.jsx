import { useState, useEffect } from 'react';
import { missions, mapGuideText } from '../data/missions';

export default function MapView({ playerName, currentScore, completedMissions, onSelectMission }) {
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const isCompleted = (id) => completedMissions.some((m) => m.id === id);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src="/map.png"
        alt="西門町地圖"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* HUD - Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-2 bg-ink/70 backdrop-blur-sm border-b border-gold/50">
        <div className="text-parchment font-serif text-sm">
          探險家：<span className="text-gold font-bold">{playerName}</span>
        </div>
        <div className="text-parchment font-serif text-sm">
          積分：<span className="text-gold font-bold">{currentScore}</span>
        </div>
        <div className="text-parchment font-serif text-sm">
          進度：<span className="text-gold font-bold">{completedMissions.length}</span> / {missions.length}
        </div>
      </div>

      {/* Guide tooltip */}
      {showGuide && (
        <div
          className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-ink/90 backdrop-blur-sm border border-gold rounded-lg p-3 max-w-xs shadow-lg transition-opacity duration-500"
          onClick={() => setShowGuide(false)}
        >
          <p className="text-parchment font-serif text-xs leading-relaxed">{mapGuideText}</p>
          <p className="text-gold/60 font-serif text-xs mt-1 text-center">點擊關閉</p>
        </div>
      )}

      {/* Mission hotspots */}
      {missions.map((mission) => {
        const done = isCompleted(mission.id);
        return (
          <button
            key={mission.id}
            onClick={() => onSelectMission(mission.id)}
            className="absolute z-10 group"
            style={{
              top: `${mission.mapPosition.top}%`,
              left: `${mission.mapPosition.left}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all
                ${done
                  ? 'bg-jade/80 border-2 border-jade shadow-lg shadow-jade/30'
                  : 'bg-gold/30 border-2 border-gold glow-hotspot cursor-pointer hover:scale-110'
                }`}
            >
              {done ? (
                <span className="text-white text-lg">✓</span>
              ) : (
                <span className="text-gold font-serif font-bold text-sm">{mission.id}</span>
              )}
            </div>
            {/* Label on hover */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-ink/90 text-parchment text-xs font-serif px-2 py-1 rounded border border-gold/30">
              {mission.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}
