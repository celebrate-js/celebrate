import type { ReactElement, ReactNode } from "react";
import { Stamp, type CelebrateSize } from "./Stamp";
import { ConfettiBurst } from "./ConfettiBurst";
import { RecordBanner } from "./RecordBanner";
import { SparkleBurst } from "./SparkleBurst";
import { RadialBurst } from "./RadialBurst";
import { RADIAL_BURST_PRESETS } from "./radialLayers";
import { SakuraBurst } from "./SakuraBurst";
import { BounceText } from "./BounceText";
import { GlyphBurst } from "./GlyphBurst";
import { MedalBadge } from "./MedalBadge";
import { CheckmarkBurst } from "./CheckmarkBurst";
import { FireworkBurst } from "./FireworkBurst";
import type { FireworkStyle } from "./firework";
import { CrackerBurst } from "./CrackerBurst";
import { FloatDrift } from "./FloatDrift";
import { LightningStrike } from "./LightningStrike";
import { ShatterScreen } from "./ShatterScreen";
import { ConfettiRain } from "./ConfettiRain";
import { PopupText } from "./PopupText";
import type { CelebrateTheme } from "./theme";
import { CELEBRATE_DURATION_MS } from "./pieces";
import { SPARKLE_DURATION_MS } from "./sparkle";
import { POP_DURATION_MS } from "./pop";
import { SAKURA_DURATION_MS } from "./sakura";
import { GLYPH_BURST_DURATION_MS } from "./glyphParticles";
import { CRACKER_DURATION_MS } from "./cracker";
import { RAIN_DURATION_MS } from "./rain";
import { SHATTER_DURATION_MS } from "./shatter";
import { FIREWORK_DURATION_MS } from "./firework";
import {
  BOUNCE_DURATION_MS,
  CHECKMARK_DURATION_MS,
  FLASH_DURATION_MS,
  FLOAT_DURATION_MS,
  HITSTOP_DURATION_MS,
  LIGHTNING_DURATION_MS,
  MEDAL_DURATION_MS,
  POPUP_DURATION_MS,
  RING_DURATION_MS,
  RIPPLE_DURATION_MS,
  SHAKE_DURATION_MS,
  VIGNETTE_DURATION_MS,
} from "./durations";
import { playChime, playSparkleSound, SPARKLE_SOUND_PRESETS } from "./sparkleSound";
import { intensityToDurationMultiplier, intensityToGainMultiplier, intensityToHapticMultiplier } from "./intensity";

// 「名前→見た目・音・振動・duration」をここ1箇所に集約した表（旧 variants.ts / renderers.tsx /
// variantSound.ts / variantHaptic.ts / variantScreenEffect.ts の5箇所に分散していたものを統合）。
// 同じ名前（例: flash）についての情報が5ファイルを跨いで散らばっていたのが、
// 「実装はRadialBurstに統合したのに、名前としては独立した重い存在であり続ける」原因だった。
// ここでは1エントリ＝1つのオブジェクトなので、flashは「RadialBurstにpresetを渡しただけ」の
// 1行として存在する（専用のReactコンポーネントも専用のレンダリング関数も持たない）。
//
// celebrate() の第一引数・`with` はどちらも `CelebrateVariant`（この表のキー）と
// 生の ReactNode の両方を受け取れる。文字列だけで完結する既存の使い方には一切影響しない
// （ReactNode を渡す方はあくまで追加の逃げ道）。ReactNode を渡した場合、その duration・音・
// 振動はこの表からは引けないため、`options.durationMs` で明示的に上書きできるようにしてある。

const DEFAULT_HEART_GLYPHS = ["♥"] as const;
const DEFAULT_STAR_GLYPHS = ["★", "✦", "✧"] as const;
const DEFAULT_EMOJI_GLYPHS = ["🎉", "✨", "🎊", "👍"] as const;

/** 演出の種類ごとのパラメータ（使わない演出では無視される）。 */
export interface CelebrateVariantOptions {
  /** `stamp` / `record` / `bounce` / `medal` / `popup`: 大きく出す文字。 */
  text?: string;
  /** `record`: 大きい文字の下に添える一言（例：「れんぞく 7問」）。 */
  note?: string;
  /** `stamp`: 印影の大きさ。 */
  size?: CelebrateSize;
  /**
   * 重ねて同時に出すもの。登録済みの名前（`CelebrateVariant`）、生の ReactNode、
   * またはその配列。「ただ2つ名前を重ねたいだけ」の一番多いケースは名前のままで完結し、
   * 自作コンポーネントを重ねたい場合だけ ReactNode を渡せる。
   */
  with?: CelebrateVariant | ReactNode | readonly (CelebrateVariant | ReactNode)[];
  /** 意匠（色・角丸・書体）。省略時は Provider の theme → 既定 theme の順で解決される。 */
  theme?: CelebrateTheme;
  /** 効果音を鳴らすかどうか。命令的APIでは既定true。登録済みの名前にだけ効果を持つ。 */
  sound?: boolean;
  /** 端末を振動させるかどうか。命令的APIでは既定true。登録済みの名前にだけ効果を持つ。 */
  haptic?: boolean;
  /** `sparkle` / `sakura` / `heart` / `star` / `emoji` / `cracker`: 再現可能なテスト・デモ用。 */
  seed?: number;
  /** `heart` / `star` / `emoji`: 撒く文字・絵文字を上書きする（既定は variant ごとの定番セット）。 */
  glyphs?: readonly string[];
  /** `float`: 漂わせる文字を指定する（既定はCSSで描いた雲形。絵文字ではない）。 */
  glyph?: string;
  /** `sakura`: 花びらの色。`pop`/`ripple`/`ring`/`flash`: 色の既定値を上書き（省略時はtheme）。 */
  color?: string;
  /** 見た目の大きさ倍率。既定1。`firework`/`pop`/`ripple`/`ring`/`flash`が対応。 */
  scale?: number;
  /**
   * 見た目の大きさの絶対値（rem）。`scale`（相対倍率）と違い、基準サイズを意識せず
   * 直接remで指定できる。`firework`/`pop`/`ripple`/`ring`/`flash`が対応。両方指定した場合は
   * `sizeRem`が優先される。基準サイズ（`scale`が1のときのremとの対応）は
   * `SCALE_REFERENCE_SIZE_REM`参照。親要素のサイズに合わせたい場合など、絶対値の方が
   * 呼び出し側で扱いやすいケース向け。`stamp`の`size`（"md"/"lg"）とは別物。
   */
  sizeRem?: number;
  /** `firework`: 色パレットを上書きする（省略時は theme.confettiColors）。 */
  colors?: readonly string[];
  /** `firework`: 花火の種類。既定 "peony"。 */
  fireworkStyle?: FireworkStyle;
  /** 演出の強度。見た目の拡大率・durationの伸び・音量・振動に連続的に反映される。 */
  intensity?: number;
  /**
   * 効果音のpreset番号（`SPARKLE_SOUND_PRESETS`の添字。0〜9、範囲外は循環する）を上書きする。
   * 省略時は各variantの既定音（`sparkle`は毎回ランダム）。色やscaleと同じく、
   * どの音を鳴らすかは呼び出し側が目的・用途に応じて決めるものであり、
   * ライブラリ側で決め打ちにする理由はないため上書きを許可している。
   */
  soundPreset?: number;
  /**
   * 表示し続ける時間（ms）の明示的な上書き。`with` に登録名ではない ReactNode を
   * 渡した場合、そのdurationはこの表から引けないため、必要なら明示的に指定する。
   * 省略時は「本体（＋登録済みの名前のwith）の中でいちばん長いもの」から自動計算する。
   */
  durationMs?: number;
}

type HapticPattern = number | readonly number[];

interface Recipe {
  render: (options: CelebrateVariantOptions) => ReactElement;
  durationMs: number;
  /**
   * gainScale は intensity 由来の音量倍率（既定1）。未指定＝この演出に音はない。
   * presetOverride は `options.soundPreset`（呼び出し側が明示的に指定した場合のみ）。
   */
  sound?: (gainScale: number, presetOverride?: number) => void;
  haptic?: HapticPattern;
  /** <html> に付け外しするクラス名（shake/hitstop/vignette）。見た目は自前で描かない。 */
  containerModifierClassName?: string;
  /** rain/lightning/shatter のように、画面全体の入れ物へ直接描画する実体コンテンツか。 */
  fullscreen?: boolean;
}

const fixedChime =
  (presetIndex: number) =>
  (gainScale: number, presetOverride?: number): void =>
    playChime((presetOverride ?? presetIndex) % SPARKLE_SOUND_PRESETS.length, gainScale);

// options.sizeRem（絶対値・rem）→scale（相対倍率）への変換基準。
// 「scale=1のとき何remか」は元々、各variantの実装時に個別に決め打ちされていた値
// （RADIAL_BURST_PRESETSの一番外側のlayerのsize、fireworkは破裂半径の可変範囲の中央値）
// でしかなく、variantを跨いだ一貫性は無い（呼び出し側から指摘された点）。sizeRemオプションは
// この「決め打ちの基準」を呼び出し側から隠し、常に絶対remで指定できるようにするためのもの。
const SCALE_REFERENCE_SIZE_REM: Partial<Record<CelebrateVariant, number>> = {
  pop: 2.6,
  ripple: 2.4,
  ring: 2,
  flash: 4,
  // 破裂半径は粒ごとに2.2〜4.2remでランダムに散らばる（1つのサイズに決まらない）ため、
  // その中央値を基準として近似している。
  firework: 3.2,
};

/** `options.scale`と`options.sizeRem`のどちらが指定されていても、実際に使うscaleを1つに解決する。 */
function resolveScale(
  variant: CelebrateVariant,
  options: Pick<CelebrateVariantOptions, "scale" | "sizeRem">
): number {
  if (options.sizeRem !== undefined) {
    const reference = SCALE_REFERENCE_SIZE_REM[variant] ?? 1;
    return options.sizeRem / reference;
  }
  return options.scale ?? 1;
}

// カタログ（Tier1）に入れる基準：構造的な新しさ（RadialBurstかParticleFieldか等）ではなく、
// UXの意味（どの瞬間に使うか）で1語の名前を持つ価値があるかどうか。pop/ripple/ring/flashは
// 構造的には全部RadialBurstの同じプリセット違いだが、UX上は別の意味（軽いタップ確認／報酬）を
// 持つので別名で残す。並び順もこの意味カテゴリでグルーピングする（実装順・思いつき順ではない）。
// 各カテゴリの理論的根拠（ゲーミフィケーション理論・子ども向け研究・ゲームデザイン文脈）は
// docs/catalog-rationale.md を参照。
export const RECIPES = {
  // ①入力フィードバック：ボタン等を押した「軽いタップ確認」。
  pop: {
    render: ({ theme, scale, sizeRem, color }) => (
      <RadialBurst layers={RADIAL_BURST_PRESETS.pop.layers} theme={theme} scale={resolveScale("pop", { scale, sizeRem })} color={color} />
    ),
    durationMs: POP_DURATION_MS,
    sound: fixedChime(3),
    haptic: 12,
  },
  ripple: {
    render: ({ theme, scale, sizeRem, color }) => (
      <RadialBurst layers={RADIAL_BURST_PRESETS.ripple.layers} theme={theme} scale={resolveScale("ripple", { scale, sizeRem })} color={color} />
    ),
    durationMs: RIPPLE_DURATION_MS,
    sound: fixedChime(5),
    haptic: 10,
  },
  checkmark: {
    render: ({ theme }) => (
      <span className="celebrate-anchor">
        <CheckmarkBurst theme={theme} />
      </span>
    ),
    durationMs: CHECKMARK_DURATION_MS,
    sound: fixedChime(12),
    haptic: [12, 40, 12],
  },

  // ②達成：正解・完了・順位など「できた」を示す。
  stamp: {
    render: ({ text = "", size, theme }) => <Stamp text={text} size={size} theme={theme} />,
    durationMs: CELEBRATE_DURATION_MS,
    sound: fixedChime(0),
    haptic: 18,
  },
  medal: {
    render: ({ text, theme }) => <MedalBadge text={text} theme={theme} />,
    durationMs: MEDAL_DURATION_MS,
    sound: fixedChime(10),
    haptic: [10, 30, 10, 30, 20],
  },
  bounce: {
    render: ({ text = "", theme }) => <BounceText text={text} theme={theme} />,
    durationMs: BOUNCE_DURATION_MS,
    sound: fixedChime(7),
    haptic: 16,
  },

  // ③報酬：ご褒美・大当たり。達成よりも一段上の「やった！」感。
  confetti: {
    render: ({ theme }) => (
      <span className="celebrate-anchor">
        <ConfettiBurst theme={theme} />
      </span>
    ),
    durationMs: CELEBRATE_DURATION_MS,
    sound: fixedChime(1),
    haptic: [10, 20, 10, 20, 30],
  },
  sparkle: {
    render: ({ theme, seed }) => <SparkleBurst theme={theme} seed={seed} />,
    durationMs: SPARKLE_DURATION_MS,
    sound: (gainScale, presetOverride) =>
      presetOverride === undefined ? playSparkleSound(Math.random, gainScale) : playChime(presetOverride, gainScale),
    haptic: [8, 15, 8, 15, 8],
  },
  record: {
    render: ({ text = "", note, theme }) => <RecordBanner text={text} note={note} theme={theme} />,
    durationMs: CELEBRATE_DURATION_MS,
    sound: fixedChime(2),
    haptic: [15, 30, 15, 30, 40],
  },
  flash: {
    render: ({ theme, scale, sizeRem, color }) => (
      <RadialBurst layers={RADIAL_BURST_PRESETS.flash.layers} theme={theme} scale={resolveScale("flash", { scale, sizeRem })} color={color} />
    ),
    durationMs: FLASH_DURATION_MS,
    sound: fixedChime(11),
  },
  ring: {
    render: ({ theme, scale, sizeRem, color }) => (
      <RadialBurst layers={RADIAL_BURST_PRESETS.ring.layers} theme={theme} scale={resolveScale("ring", { scale, sizeRem })} color={color} />
    ),
    durationMs: RING_DURATION_MS,
    sound: fixedChime(6),
  },
  firework: {
    render: ({ theme, seed, scale, sizeRem, colors, fireworkStyle }) => (
      <span className="celebrate-anchor">
        <FireworkBurst theme={theme} seed={seed} scale={resolveScale("firework", { scale, sizeRem })} colors={colors} style={fireworkStyle} />
      </span>
    ),
    durationMs: FIREWORK_DURATION_MS,
    sound: fixedChime(15),
  },

  // ④リアクション：絵文字で気持ちを表す。
  heart: {
    render: ({ glyphs, seed }) => (
      <span className="celebrate-anchor">
        <GlyphBurst glyphs={glyphs ?? DEFAULT_HEART_GLYPHS} color="#e85c7b" seed={seed} />
      </span>
    ),
    durationMs: GLYPH_BURST_DURATION_MS,
    sound: fixedChime(8),
  },
  star: {
    render: ({ glyphs, theme, seed }) => (
      <span className="celebrate-anchor">
        <GlyphBurst glyphs={glyphs ?? DEFAULT_STAR_GLYPHS} color={theme?.stampColor} seed={seed} />
      </span>
    ),
    durationMs: GLYPH_BURST_DURATION_MS,
    sound: fixedChime(9),
  },
  emoji: {
    render: ({ glyphs, seed }) => (
      <span className="celebrate-anchor">
        <GlyphBurst glyphs={glyphs ?? DEFAULT_EMOJI_GLYPHS} seed={seed} />
      </span>
    ),
    durationMs: GLYPH_BURST_DURATION_MS,
    sound: fixedChime(13),
  },

  // ⑤キャラクター・ナラティブ：粒や記号ではなく1つの主体が動く。
  cracker: {
    render: ({ theme, seed }) => (
      <span className="celebrate-anchor">
        <CrackerBurst theme={theme} seed={seed} />
      </span>
    ),
    durationMs: CRACKER_DURATION_MS,
    haptic: [10, 10, 10, 10, 30],
  },
  float: {
    render: ({ glyph }) => <FloatDrift glyph={glyph} />,
    durationMs: FLOAT_DURATION_MS,
  },

  // ⑥環境演出：画面全体への効果。
  sakura: {
    render: ({ color, seed }) => (
      <span className="celebrate-anchor">
        <SakuraBurst color={color} seed={seed} />
      </span>
    ),
    durationMs: SAKURA_DURATION_MS,
    sound: fixedChime(4),
  },
  shake: {
    render: () => <span aria-hidden="true" data-shake="" />,
    durationMs: SHAKE_DURATION_MS,
    haptic: [30, 20, 30],
    containerModifierClassName: "celebrate-shake-active",
  },
  hitstop: {
    render: () => <span aria-hidden="true" data-hitstop="" />,
    durationMs: HITSTOP_DURATION_MS,
    haptic: 25,
    containerModifierClassName: "celebrate-hitstop-active",
  },
  vignette: {
    render: () => <span aria-hidden="true" data-vignette="" />,
    durationMs: VIGNETTE_DURATION_MS,
    containerModifierClassName: "celebrate-vignette-active",
  },
  rain: {
    render: ({ theme, seed }) => <ConfettiRain theme={theme} seed={seed} />,
    durationMs: RAIN_DURATION_MS,
    fullscreen: true,
  },
  lightning: {
    render: ({ theme, seed }) => <LightningStrike theme={theme} seed={seed} />,
    durationMs: LIGHTNING_DURATION_MS,
    sound: fixedChime(14),
    haptic: [5, 15, 40],
    fullscreen: true,
  },

  // ⑦段階エフェクト：複数局面が連続する時間軸型。
  shatter: {
    render: ({ seed }) => <ShatterScreen seed={seed} />,
    durationMs: SHATTER_DURATION_MS,
    fullscreen: true,
  },

  // ⑧テキストチャネル：浮遊する数値・文字。
  popup: {
    render: ({ text = "", theme }) => <PopupText text={text} theme={theme} />,
    durationMs: POPUP_DURATION_MS,
  },
} satisfies Record<string, Recipe>;

/** 登録済みの演出の名前。celebrate() の第一引数・`with` はこれか ReactNode を受け取れる。 */
export type CelebrateVariant = keyof typeof RECIPES;

/** カタログ表示・デモ向けに、登録済みの名前を列挙したもの。 */
export const CELEBRATE_VARIANT_NAMES = Object.keys(RECIPES) as readonly CelebrateVariant[];

function isRecipeName(content: unknown): content is CelebrateVariant {
  return typeof content === "string" && content in RECIPES;
}

// `content`/`with`はReactNode（＝任意の文字列も含む）を受け付けるため、
// `celebrate("confeti")`のようなvariant名のtypoは型エラーにならず、
// 黙って「confeti」という文字列がそのまま画面に描画されてしまう
// （音・振動・durationのカタログ参照も静かに外れる）。実際の演出テキストは
// 普通スペースや記号・非ASCII文字を含む（"合格" "Nice!" 等）ため、
// 「小文字だけの1単語」に見える文字列だけを対象にヒューリスティックに警告する
// （意図的にそういう文字列を表示したい場合は無視してよい）。
const LOOKS_LIKE_VARIANT_NAME = /^[a-z]+$/;
const warnedUnknownNames = new Set<string>();

function warnIfLikelyTypo(content: unknown): void {
  if (typeof content !== "string") return;
  if (isRecipeName(content)) return;
  if (!LOOKS_LIKE_VARIANT_NAME.test(content)) return;
  if (warnedUnknownNames.has(content)) return;
  warnedUnknownNames.add(content);
  console.warn(
    `@celebrate-js/celebrate: "${content}" は登録済みのvariant名ではないため、そのまま文字列として表示されます` +
      `（音・振動・durationはカタログから解決されません）。variant名のtypoでなければ無視してください。` +
      `一覧は CELEBRATE_VARIANT_NAMES を参照。`
  );
}

function recipeFor(content: CelebrateVariant | ReactNode): Recipe | undefined {
  return isRecipeName(content) ? RECIPES[content] : undefined;
}

function withLayers(
  withOption: CelebrateVariantOptions["with"]
): readonly (CelebrateVariant | ReactNode)[] {
  if (withOption === undefined) return [];
  return Array.isArray(withOption) ? withOption : [withOption as CelebrateVariant | ReactNode];
}

/** この内容（登録済みの名前）に既定の効果音があるか。ReactNodeには常にfalse。 */
export function hasSoundForCelebration(content: CelebrateVariant | ReactNode): boolean {
  return recipeFor(content)?.sound !== undefined;
}

/** この内容（登録済みの名前）に既定の振動があるか。ReactNodeには常にfalse。 */
export function hasHapticForCelebration(content: CelebrateVariant | ReactNode): boolean {
  return recipeFor(content)?.haptic !== undefined;
}

/** 本体＋`with`の中の登録済みの名前だけを対象に、画面全体へ付け外しするクラス名を集める。 */
export function containerModifierClassNames(
  content: CelebrateVariant | ReactNode,
  options?: Pick<CelebrateVariantOptions, "with">
): readonly string[] {
  const items = [content, ...withLayers(options?.with)];
  return items
    .map((item) => recipeFor(item)?.containerModifierClassName)
    .filter((name): name is string => Boolean(name));
}

/** 本体が「画面全体を覆う実体コンテンツ」を持つ登録済みの名前か（アンカー位置に寄せない）。 */
export function isFullScreenContent(content: CelebrateVariant | ReactNode): boolean {
  return recipeFor(content)?.fullscreen === true;
}

/**
 * 命令的 celebrate() から呼ぶ、音再生のエントリポイント。
 * `options.sound === false` なら鳴らさない。`with` の中の登録済みの名前の音も対象
 * （ReactNodeを渡した層には音は紐付かない）。
 */
export function playSoundsForCelebration(
  content: CelebrateVariant | ReactNode,
  options?: Pick<CelebrateVariantOptions, "sound" | "with" | "intensity" | "soundPreset">
): void {
  if (options?.sound === false) return;
  const gainScale = options?.intensity === undefined ? 1 : intensityToGainMultiplier(options.intensity);
  const items = [content, ...withLayers(options?.with)];
  for (const item of items) recipeFor(item)?.sound?.(gainScale, options?.soundPreset);
}

const MAX_VIBRATION_MS = 80;

function scalePattern(pattern: HapticPattern, scale: number): HapticPattern {
  if (scale === 1) return pattern;
  const scaleOne = (ms: number) => Math.round(Math.min(MAX_VIBRATION_MS, ms * scale));
  return typeof pattern === "number" ? scaleOne(pattern) : pattern.map(scaleOne);
}

function vibrate(pattern: HapticPattern): void {
  try {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    navigator.vibrate(pattern as VibratePattern);
  } catch {
    // 振動は演出の付加価値。対応状況やブラウザ制約で失敗してもUI操作へ例外を伝播させない。
  }
}

/**
 * 命令的 celebrate() から呼ぶ、振動再生のエントリポイント。
 * `options.haptic === false` なら振動させない。`with` の中の登録済みの名前の振動も対象。
 */
export function playHapticsForCelebration(
  content: CelebrateVariant | ReactNode,
  options?: Pick<CelebrateVariantOptions, "haptic" | "with" | "intensity">
): void {
  if (options?.haptic === false) return;
  const scale = options?.intensity === undefined ? 1 : intensityToHapticMultiplier(options.intensity);
  const items = [content, ...withLayers(options?.with)];
  for (const item of items) {
    const pattern = recipeFor(item)?.haptic;
    if (pattern !== undefined) vibrate(scalePattern(pattern, scale));
  }
}

/**
 * 片付けまでの時間。`options.durationMs` があれば最優先で使う（ReactNodeのdurationは
 * この表から引けないため）。無ければ本体＋`with`内の登録済みの名前の中でいちばん長いものに
 * 合わせ、登録済みでないもの（生のReactNode）は既定値（CELEBRATE_DURATION_MS）として扱う。
 */
export function durationForCelebration(
  content: CelebrateVariant | ReactNode,
  options?: Pick<CelebrateVariantOptions, "with" | "intensity" | "durationMs">
): number {
  if (options?.durationMs !== undefined) return options.durationMs;
  const items = [content, ...withLayers(options?.with)];
  const base = Math.max(...items.map((item) => recipeFor(item)?.durationMs ?? CELEBRATE_DURATION_MS));
  if (options?.intensity === undefined) return base;
  return Math.round(base * intensityToDurationMultiplier(options.intensity));
}

function renderContent(content: CelebrateVariant | ReactNode, options: CelebrateVariantOptions): ReactNode {
  if (isRecipeName(content)) return RECIPES[content].render(options);
  warnIfLikelyTypo(content);
  return content;
}

/** 本体を実際の要素に変換する。`options.with` があれば重ねて合成する。 */
export function renderCelebration(
  content: CelebrateVariant | ReactNode,
  options: CelebrateVariantOptions
): ReactElement {
  const primary = renderContent(content, options);
  const layers = withLayers(options.with);
  if (layers.length === 0) return <>{primary}</>;

  // with 自体は1段しか効かせない（無限にネストして重ねられると duration 計算・
  // 後片付けの見通しが立たなくなるため）。
  const { with: _ignored, ...layerOptions } = options;
  // primaryを最後（DOM順で後）に置く：position:absoluteのcelebrate-compose-layerは
  // z-index指定が無い限りDOM順で後の方が上に重なる。primaryを先に置くと、confetti/ring
  // のような疎な装飾では気づきにくいが、大きく不透明なwithコンテンツ（自作バッジ等）を
  // 重ねた瞬間にprimary本体が完全に隠れてしまう（実際に踏んだ不具合）。
  // 装飾は本体の周り・背後に添えるもの、という前提でprimaryを常に最前面にする。
  return (
    <span className="celebrate-compose">
      {layers.map((layer, index) => (
        <span key={index} className="celebrate-compose-layer">
          {renderContent(layer, layerOptions)}
        </span>
      ))}
      {primary}
    </span>
  );
}
