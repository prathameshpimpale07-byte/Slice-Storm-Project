let audioContext = null;
let musicTimer = null;
let soundEffectsEnabled = true;
let musicEnabled = true;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

export async function resumeAudio() {
  const context = getAudioContext();
  if (context?.state === "suspended") await context.resume();
  return context;
}

export function setSoundEffectsEnabled(enabled) {
  soundEffectsEnabled = enabled;
}

export function setMusicEnabled(enabled) {
  musicEnabled = enabled;
  if (!enabled) stopMusic();
}

export function getAudioSettings() {
  return { soundEffectsEnabled, musicEnabled };
}

function playTone(frequency, duration, type = "sine", volume = 0.05, delay = 0) {
  if (!soundEffectsEnabled) return;
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startTime = context.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playSound(name) {
  if (!soundEffectsEnabled) return;

  const sounds = {
    button: () => playTone(420, 0.08, "square", 0.035),
    start: () => {
      playTone(330, 0.12, "triangle", 0.05);
      playTone(520, 0.18, "triangle", 0.05, 0.08);
    },
    slice: () => playTone(720, 0.07, "sine", 0.045),
    combo: () => {
      playTone(660, 0.12, "triangle", 0.05);
      playTone(880, 0.18, "triangle", 0.05, 0.1);
    },
    bomb: () => {
      playTone(130, 0.2, "sawtooth", 0.07);
      playTone(70, 0.28, "square", 0.05, 0.08);
    },
    gameOver: () => {
      playTone(360, 0.16, "sawtooth", 0.05);
      playTone(220, 0.3, "sawtooth", 0.05, 0.14);
    },
  };

  sounds[name]?.();
}

export async function startMusic() {
  const context = await resumeAudio();
  if (!context || !musicEnabled || musicTimer) return;

  const notes = [110, 138.59, 164.81, 138.59];
  let noteIndex = 0;
  musicTimer = window.setInterval(() => {
    if (musicEnabled) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[noteIndex % notes.length];
      gain.gain.setValueAtTime(0.012, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.35);
      noteIndex += 1;
    }
  }, 520);
}

export function stopMusic() {
  if (musicTimer !== null && typeof window !== "undefined") {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}
