let audioContext;

function context() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audioContext || audioContext.state === "closed") audioContext = new AudioContext();
  return audioContext;
}

export function unlockGameAudio() {
  const audio = context();
  if (audio?.state === "suspended") audio.resume().catch(() => undefined);
}

function note(audio, destination, frequency, start, duration, options = {}) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = options.type || "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  if (options.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, start + duration);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(options.volume || .16, start + .015);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function play(sequence) {
  const audio = context();
  if (!audio) return;
  if (audio.state === "suspended") audio.resume().catch(() => undefined);
  const master = audio.createGain();
  master.gain.value = .7;
  master.connect(audio.destination);
  const start = audio.currentTime + .015;
  sequence.forEach((item) => note(audio, master, item.frequency, start + item.at, item.duration, item));
}

export function playCorrectSound() {
  play([
    { frequency: 523.25, at: 0, duration: .16, type: "sine", volume: .12 },
    { frequency: 659.25, at: .10, duration: .19, type: "sine", volume: .14 },
    { frequency: 783.99, at: .21, duration: .30, type: "triangle", volume: .16 },
    { frequency: 1046.5, at: .32, duration: .34, type: "sine", volume: .10 },
  ]);
}

export function playWrongSound() {
  play([
    { frequency: 246.94, endFrequency: 196, at: 0, duration: .22, type: "triangle", volume: .13 },
    { frequency: 185, endFrequency: 146.83, at: .18, duration: .34, type: "sine", volume: .12 },
  ]);
}

export function playGameEndSound(passed) {
  if (!passed) {
    play([
      { frequency: 392, at: 0, duration: .20, type: "triangle", volume: .10 },
      { frequency: 329.63, at: .18, duration: .22, type: "triangle", volume: .10 },
      { frequency: 261.63, at: .38, duration: .45, type: "sine", volume: .12 },
    ]);
    return;
  }
  play([
    { frequency: 523.25, at: 0, duration: .18, type: "triangle", volume: .11 },
    { frequency: 659.25, at: .12, duration: .18, type: "triangle", volume: .12 },
    { frequency: 783.99, at: .24, duration: .20, type: "triangle", volume: .13 },
    { frequency: 1046.5, at: .40, duration: .48, type: "sine", volume: .15 },
    { frequency: 783.99, at: .40, duration: .48, type: "sine", volume: .08 },
  ]);
}
