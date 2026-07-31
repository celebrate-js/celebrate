export interface SparkleSoundPreset {
  frequencies: readonly [number, number];
  waveform: OscillatorType;
  durationSeconds: number;
}

export const SPARKLE_SOUND_PRESETS: readonly SparkleSoundPreset[] = [
  { frequencies: [880, 1320], waveform: "sine", durationSeconds: 0.08 },
  { frequencies: [988, 1480], waveform: "sine", durationSeconds: 0.07 },
  { frequencies: [784, 1175], waveform: "triangle", durationSeconds: 0.09 },
  { frequencies: [1047, 1568], waveform: "sine", durationSeconds: 0.07 },
  { frequencies: [659, 1319], waveform: "triangle", durationSeconds: 0.1 },
  { frequencies: [1175, 1760], waveform: "sine", durationSeconds: 0.06 },
  { frequencies: [740, 1109], waveform: "triangle", durationSeconds: 0.09 },
  { frequencies: [932, 1397], waveform: "sine", durationSeconds: 0.08 },
  { frequencies: [831, 1661], waveform: "triangle", durationSeconds: 0.07 },
  { frequencies: [1109, 1661], waveform: "sine", durationSeconds: 0.06 },
];

export function sparkleSoundIndex(randomValue: number): number {
  const normalized = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON)
    : 0;
  return Math.floor(normalized * SPARKLE_SOUND_PRESETS.length);
}

export function chooseSparkleSound(
  random: () => number = Math.random
): SparkleSoundPreset {
  return SPARKLE_SOUND_PRESETS[sparkleSoundIndex(random())]!;
}

/**
 * ユーザー操作に同期して呼ぶ短い合成音。利用不可・ブロック時は何もせず終了する。
 */
export function playSparkleSound(random: () => number = Math.random): void {
  try {
    if (navigator.userActivation && !navigator.userActivation.isActive) return;
    const AudioContextCtor = window.AudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const preset = chooseSparkleSound(random);
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.durationSeconds);
    gain.connect(context.destination);

    preset.frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = preset.waveform;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.connect(gain);
      oscillator.start(now + index * 0.012);
      oscillator.stop(now + preset.durationSeconds);
    });

    void context.resume().catch(() => undefined);
    window.setTimeout(() => {
      void context.close().catch(() => undefined);
    }, Math.ceil((preset.durationSeconds + 0.08) * 1000));
  } catch {
    // 音は演出の付加価値。ブラウザ制約で失敗してもUI操作へ例外を伝播させない。
  }
}
