/**
 * Pure Web Audio API Synthesizer for study soundscapes and notification chimes.
 * No external MP3 files needed; runs 100% offline and low-latency.
 */

let audioCtx: AudioContext | null = null;
let currentSource: AudioNode | null = null;
let gainNode: GainNode | null = null;
let binauralOscLeft: OscillatorNode | null = null;
let binauralOscRight: OscillatorNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type AmbientSoundType = 'none' | 'brown-noise' | 'white-noise' | 'soft-rain' | 'alpha-waves' | 'gamma-focus';

export function stopAmbientSound() {
  if (currentSource) {
    try {
      (currentSource as AudioBufferSourceNode).stop();
    } catch {
      // ignore if already stopped
    }
    currentSource = null;
  }
  if (binauralOscLeft) {
    try { binauralOscLeft.stop(); } catch { /* ignore */ }
    binauralOscLeft = null;
  }
  if (binauralOscRight) {
    try { binauralOscRight.stop(); } catch { /* ignore */ }
    binauralOscRight = null;
  }
}

export function playAmbientSound(type: AmbientSoundType, volume = 0.4) {
  stopAmbientSound();
  if (type === 'none') return;

  const ctx = getAudioContext();
  
  if (!gainNode) {
    gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
  }
  gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);

  const sampleRate = ctx.sampleRate;
  const bufferDuration = 6.0; // 6 seconds loopable buffer
  const frameCount = sampleRate * bufferDuration;

  if (type === 'white-noise') {
    const buffer = ctx.createBuffer(2, frameCount, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter slightly to remove harsh extreme high treble
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    source.start();
    currentSource = source;
  } else if (type === 'brown-noise') {
    // Brown noise: integrates white noise with leaky integrator
    const buffer = ctx.createBuffer(2, frameCount, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < frameCount; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 1.5;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Gentle low-pass for a soothing warm hum
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    source.start();
    currentSource = source;
  } else if (type === 'soft-rain') {
    // Rain simulation: pink/brown noise with periodic droplet bursts
    const buffer = ctx.createBuffer(2, frameCount, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < frameCount; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        let pink = b0 + b1 + b2 + white * 0.05;
        // occasional micro drop impulse
        if (Math.random() < 0.0003) {
          pink += (Math.random() - 0.5) * 0.4;
        }
        data[i] = pink * 0.12;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    source.start();
    currentSource = source;
  } else if (type === 'alpha-waves' || type === 'gamma-focus') {
    // Binaural study tones
    const baseFreq = 210;
    const beatFreq = type === 'alpha-waves' ? 10 : 40; // 10Hz Alpha (relaxed focus) or 40Hz Gamma (intense memory recall)

    const merger = ctx.createChannelMerger(2);

    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);

    const gainL = ctx.createGain();
    const gainR = ctx.createGain();
    gainL.gain.setValueAtTime(0.08, ctx.currentTime);
    gainR.gain.setValueAtTime(0.08, ctx.currentTime);

    oscL.connect(gainL);
    oscR.connect(gainR);

    gainL.connect(merger, 0, 0); // Left channel
    gainR.connect(merger, 0, 1); // Right channel

    merger.connect(gainNode);

    oscL.start();
    oscR.start();

    binauralOscLeft = oscL;
    binauralOscRight = oscR;
  }
}

export function setAmbientVolume(volume: number) {
  if (gainNode && audioCtx) {
    const clamped = Math.max(0, Math.min(1, volume));
    gainNode.gain.setValueAtTime(clamped, audioCtx.currentTime);
  }
}

/**
 * Plays a resonant chime bell (singing bowl / marimba style) when a session finishes.
 */
export function playCompletionChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Fundamental + harmonics for rich pleasant chime
    const frequencies = [528, 792, 1056, 1584]; // 528Hz Solfeggio / resonant study frequency
    const weights = [0.25, 0.12, 0.06, 0.02];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(weights[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.5);
    });
  } catch (err) {
    console.error('Audio playback error:', err);
  }
}

/**
 * Soft subtle click for card flip / rating feedback
 */
export function playCardFlipSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // Ignore audio context errors
  }
}
