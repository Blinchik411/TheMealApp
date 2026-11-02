'use client';

export const playTimerAlarm = () => {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Melodic chime sequence: A5 (880Hz), C#6 (1108Hz), E6 (1318Hz), A6 (1760Hz)
    const notes = [
      { freq: 880, start: 0, duration: 0.15 },
      { freq: 1108, start: 0.16, duration: 0.15 },
      { freq: 1318, start: 0.32, duration: 0.15 },
      { freq: 1760, start: 0.48, duration: 0.4 },
    ];

    for (const { freq, start, duration } of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    }

    // Mobile vibration pattern (if supported by device)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  } catch (err) {
    console.error('Failed to play timer alarm sound', err);
  }
};
