/**
 * Command-center audio dispatch.
 * Synthesised with the Web Audio API, so there are no audio files to host or load.
 * Sounds only play in response to user actions (browser autoplay policy) and
 * can be muted from the header toggle. The preference persists in localStorage.
 */

const STORAGE_KEY = 'gmx_sound_enabled';
let audioCtx = null;

export const isSoundEnabled = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch (e) {
    return true;
  }
};

export const setSoundEnabled = (enabled) => {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    // storage unavailable, preference is just not persisted
  }
};

const getContext = () => {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioCtx) audioCtx = new AudioCtor();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const tone = (ctx, { freq, start = 0, duration = 0.12, type = 'sine', volume = 0.06, endFreq }) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t0 = ctx.currentTime + start;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.linearRampToValueAtTime(endFreq, t0 + duration);

  // Short attack/release envelope to avoid audible clicks
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
};

const SOUNDS = {
  // Subtle electronic chirp when switching tabs
  tab: (ctx) => tone(ctx, { freq: 880, endFreq: 1240, duration: 0.07, type: 'triangle', volume: 0.04 }),

  // Confirmation: two rising notes
  success: (ctx) => {
    tone(ctx, { freq: 660, duration: 0.1, type: 'sine', volume: 0.06 });
    tone(ctx, { freq: 990, start: 0.11, duration: 0.16, type: 'sine', volume: 0.06 });
  },

  // Caution: two short flat beeps
  warn: (ctx) => {
    tone(ctx, { freq: 520, duration: 0.13, type: 'square', volume: 0.035 });
    tone(ctx, { freq: 520, start: 0.2, duration: 0.13, type: 'square', volume: 0.035 });
  },

  // Emergency broadcast: alternating two-tone siren
  alarm: (ctx) => {
    for (let i = 0; i < 3; i++) {
      tone(ctx, { freq: 880, endFreq: 660, start: i * 0.5, duration: 0.24, type: 'sawtooth', volume: 0.05 });
      tone(ctx, { freq: 660, endFreq: 880, start: i * 0.5 + 0.25, duration: 0.24, type: 'sawtooth', volume: 0.05 });
    }
  },
};

export const playSound = (name) => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getContext();
    if (ctx && SOUNDS[name]) SOUNDS[name](ctx);
  } catch (e) {
    // Audio is a progressive enhancement; never let it break the UI
  }
};
