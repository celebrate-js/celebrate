// Web Audio APIで合成する短い効果音（10プリセット）。音声ファイルを同梱しない
// （npm単体配布でアセットを増やさないため）。`playChime`が実際の再生を担い、
// `recipes.tsx`の各variantは固定のpreset番号を、`sparkle`だけ`chooseSparkleSound`で
// ランダムなpresetを選ぶ。

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
 * 指定した preset 番号（`SPARKLE_SOUND_PRESETS` の添字）で鳴らす。
 * ユーザー操作に同期して呼ぶ短い合成音。利用不可・ブロック時は何もせず終了する。
 * `playSparkleSound` が「ランダムに選ぶ」薄いラッパーとしてこれを使う。
 *
 * @param gainScale 音量倍率（既定1）。intensity（コンボ数など）を反映する用途。
 *   0.35 を超えると耳に痛くなりやすいので上限でクランプする。
 */
export function playChime(presetIndex: number, gainScale = 1): void {
  try {
    if (navigator.userActivation && !navigator.userActivation.isActive) return;
    const AudioContextCtor = window.AudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const preset = SPARKLE_SOUND_PRESETS[presetIndex % SPARKLE_SOUND_PRESETS.length]!;
    const now = context.currentTime;
    const peakGain = Math.min(0.35, 0.12 * gainScale);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.008);
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

/** sparkle 用：毎回ランダムな preset で鳴らす（`playChime` の薄いラッパー）。 */
export function playSparkleSound(random: () => number = Math.random, gainScale = 1): void {
  playChime(sparkleSoundIndex(random()), gainScale);
}
