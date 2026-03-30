import { useState } from 'react';
import TypewriterText from '../components/TypewriterText';
import { welcomeText } from '../data/missions';

export default function HomeView({ onStart }) {
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleStart = () => {
    if (name.trim()) onStart(name.trim());
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <img
        src="/home.png"
        alt="西門尋秘"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Content — flex column, card at the end */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end items-center p-4">
        <div className="bg-ink/80 backdrop-blur-sm border-2 border-gold rounded-lg p-4 shadow-lg shadow-black/50 w-full max-w-md">
          <p className="text-parchment font-serif text-sm leading-relaxed text-left">
            <TypewriterText
              text={welcomeText}
              speed={25}
              onComplete={() => setShowInput(true)}
            />
          </p>

          {/* Input area — slides in after typewriter finishes */}
          {showInput && (
            <div className="flex gap-3 pt-3 mt-3 border-t border-gold/30 animate-[fadeIn_0.5s_ease]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="請輸入您的名字..."
                maxLength={10}
                autoFocus
                className="flex-1 min-w-0 bg-parchment/90 text-ink font-serif text-base px-4 py-2.5 rounded-lg border-2 border-gold focus:outline-none focus:border-gold-light focus:ring-2 focus:ring-gold/30 placeholder:text-ink-light/50"
              />
              <button
                onClick={handleStart}
                disabled={!name.trim()}
                className="shrink-0 bg-gradient-to-b from-gold to-gold/80 text-ink font-serif font-bold text-base px-5 py-2.5 rounded-lg border-2 border-gold-light hover:from-gold-light hover:to-gold active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/30"
              >
                開始尋秘
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
