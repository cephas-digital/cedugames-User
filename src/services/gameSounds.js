import backgroundMusicUrl from "../assets/audio/background-music.mp3";
import cashbackUrl from "../assets/audio/cashback-earning.mp3";
import clickUrl from "../assets/audio/click.mp3";
import correctUrl from "../assets/audio/correct-answer.mp3";
import nextLevelUrl from "../assets/audio/next-level.mp3";
import wrongUrl from "../assets/audio/wrong-answer.mp3";

const effects = new Map();
let backgroundMusic;

function sound(url, volume = .7) {
  if (!effects.has(url)) {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.volume = volume;
    effects.set(url, audio);
  }
  const audio = effects.get(url);
  audio.currentTime = 0;
  return audio.play().catch(() => undefined);
}

export function unlockGameAudio() {
  if (backgroundMusic?.paused) backgroundMusic.play().catch(() => undefined);
}

export function startBackgroundMusic() {
  if (!backgroundMusic) {
    backgroundMusic = new Audio(backgroundMusicUrl);
    backgroundMusic.loop = true;
    backgroundMusic.preload = "auto";
    backgroundMusic.volume = .18;
  }
  backgroundMusic.play().catch(() => undefined);
}

export function stopBackgroundMusic() {
  if (!backgroundMusic) return;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}

export function playCorrectSound() { sound(correctUrl); }
export function playWrongSound() { sound(wrongUrl); }
export function playClickSound() { sound(clickUrl, .45); }
export function playCashbackSound() { sound(cashbackUrl); }
export function playGameEndSound(passed) { sound(passed ? nextLevelUrl : wrongUrl); }
