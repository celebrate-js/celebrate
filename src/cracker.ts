import { createSeededRandom, type RandomFn } from "./random";

// クラッカー（パーティーポッパー）の紙テープ。
//
// 真上を中心に ±65deg のコーン状へ飛び出すリボン。実体は ParticleField +
// radialMotion（Tier3の構造テンプレート）のプリセットで、各リボンの「中心」が
// 発射点から放射状に飛ぶ（見た目はリボン自身の回転＝angle+curlで表現する）。

export interface CrackerStreamer {
  id: number;
  /** ラジアン。飛ぶ方向（画面座標、0=右、正で下向き）。真上付近のコーン状。 */
  angleRad: number;
  /** rem/秒。 */
  speed: number;
  /** 度。リボン自体の見た目の向き（進行方向に合わせる）。 */
  rotateDeg: number;
  /** 飛びながら加わる追加の回転（紙テープらしいひねりを出す）。度。 */
  curlDeg: number;
  /** リボンの長さ（rem）。 */
  length: number;
  delaySeconds: number;
  tone: 0 | 1 | 2 | 3;
}

export const CRACKER_STREAMER_COUNT = 14;
export const CRACKER_DURATION_MS = 900;

const CRACKER_DURATION_SECONDS = CRACKER_DURATION_MS / 1000;

/** 真上を中心に ±65deg のコーン状へ飛び出すリボンを生成する。 */
export function createCrackerStreamers(random: RandomFn = Math.random): readonly CrackerStreamer[] {
  return Array.from({ length: CRACKER_STREAMER_COUNT }, (_, id) => {
    // 画面座標（0=右, 90deg=下）で「真上」は -90deg。そこを中心に±65degの扇。
    const spreadDeg = (random() - 0.5) * 130;
    const angleDeg = -90 + spreadDeg;
    const curlDeg = Math.round((random() - 0.5) * 60);
    const distance = 3.6 + random() * 2.8;
    return {
      id,
      angleRad: (angleDeg * Math.PI) / 180,
      speed: distance / CRACKER_DURATION_SECONDS,
      rotateDeg: angleDeg + 90, // リボン（縦長）の初期姿勢を進行方向に合わせる
      curlDeg,
      length: 0.75 + random() * 0.45,
      delaySeconds: random() * 0.05,
      tone: Math.floor(random() * 4) as 0 | 1 | 2 | 3,
    };
  });
}

export { createSeededRandom as createSeededCrackerRandom };
