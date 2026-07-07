// Procedural UI sounds synthesised with the Web Audio API — 100% original,
// no audio files, no game assets. Simple retro beeps.

let ctx: AudioContext | null = null;
let muted = localStorage.getItem("muted") === "true";

function context(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  localStorage.setItem("muted", String(value));
}

/** Play a short tone. `startAt` offsets it (in seconds) to chain notes. */
function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  gain = 0.04,
  startAt = 0,
): void {
  if (muted) return;
  const audio = context();
  if (audio.state === "suspended") void audio.resume();

  const osc = audio.createOscillator();
  const env = audio.createGain();
  const t0 = audio.currentTime + startAt;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  env.gain.setValueAtTime(gain, t0);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(env).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
}

export function playClick(): void {
  tone(420, 0.05);
}

export function playConfirm(): void {
  tone(660, 0.07);
  tone(880, 0.1, "square", 0.04, 0.07);
}

export function playError(): void {
  tone(150, 0.25, "sawtooth", 0.05);
}

export function playBoot(): void {
  tone(220, 0.1);
  tone(330, 0.1, "square", 0.04, 0.09);
  tone(440, 0.16, "square", 0.04, 0.18);
}
