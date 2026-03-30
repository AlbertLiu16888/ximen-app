// Lightweight sound system using Web Audio API (no external files needed)
const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null;

function playTone(freq, duration = 0.15, type = 'sine', vol = 0.3) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export const sfx = {
  click: () => playTone(800, 0.08, 'square', 0.15),
  success: () => {
    playTone(523, 0.15, 'sine', 0.25);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 120);
    setTimeout(() => playTone(784, 0.3, 'sine', 0.3), 240);
  },
  fail: () => {
    playTone(300, 0.2, 'sawtooth', 0.2);
    setTimeout(() => playTone(250, 0.3, 'sawtooth', 0.2), 200);
  },
  correct: () => playTone(880, 0.12, 'sine', 0.2),
  wrong: () => playTone(200, 0.2, 'square', 0.15),
  star: (n) => {
    setTimeout(() => playTone(523 * n, 0.2, 'sine', 0.2), 0);
  },
  countdown: () => playTone(440, 0.08, 'square', 0.1),
  transition: () => {
    playTone(400, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(600, 0.15, 'sine', 0.15), 80);
  },
};

// Haptic feedback (vibration API for mobile)
export function haptic(pattern = 'light') {
  if (!navigator.vibrate) return;
  switch (pattern) {
    case 'light': navigator.vibrate(10); break;
    case 'medium': navigator.vibrate(30); break;
    case 'heavy': navigator.vibrate([50, 30, 50]); break;
    case 'success': navigator.vibrate([30, 50, 30, 50, 80]); break;
    case 'fail': navigator.vibrate([100, 50, 100]); break;
  }
}
