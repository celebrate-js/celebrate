# Changelog

このプロジェクトは[Semantic Versioning](https://semver.org/lang/ja/)に従います。

## [0.1.0] - Unreleased

初回リリース。break_even_toolsからの分離・独立パッケージ化。

### 追加

- Tier 1カタログ：25種類の演出（`stamp`/`confetti`/`sparkle`/`pop`/`ripple`/`ring`/`flash`/`sakura`/`bounce`/`heart`/`star`/`medal`/`checkmark`/`emoji`/`firework`/`cracker`/`float`/`lightning`/`shatter`/`shake`/`hitstop`/`vignette`/`rain`/`record`/`popup`）
- Tier 3構造テンプレート：`RadialBurst`（中心から広がる）、`ParticleField`（任意の動き・見た目の粒子エンジン）、`StrokePath`（経路の描き下ろし）
- ボーダーエフェクト（`useCelebrateBorder`）：既存コンポーネントの境界線を装飾する10種類
- `useContainerModifier`：画面全体への一時的なクラス付け外し
- `CelebrateProvider`の`container`propによるローカルスコープ対応
- `celebrate()`/`with`がReactNode（自作コンポーネント）を直接受け付ける合成機構
- `rollRewardTier()`：可変比率の抽選ユーティリティ
- `intensity`による見た目・音量・振動の連続的なスケーリング
- `fireworkStyle`：`peony`/`willow`/`ring`に加え`kiku`（菊）/`star`（型物・星形）/`senrin`（千輪）/`hachi`（蜂）を追加
