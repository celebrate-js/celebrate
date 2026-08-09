# エフェクト構造の分解（設計メモ・未実装）

ここでは実装の**構造**（どういう仕組みで動くか）だけを扱う。25 variantが**なぜカタログに
入っているか**（UX上の意味・理論的根拠）は[カタログ妥当性根拠](./catalog-rationale.md)を参照。

「①単品／②ボーダー／③画面全体／④ナラティブ」という区分は**利用方法（どこに描画されるか）**の話であって、
描画の仕組み（構造）そのものではなかった。「何が独立したパラメータで、何がその値に過ぎないか」を
分解し直したもの。Unity（Shuriken）/ Unreal（Niagara）のパーティクルシステムが
emission/shape/velocity-over-lifetime のようにモジュール化されているのを参考にした。

**重要な訂正**：これは厳密な意味でのMECEではない（軸同士は完全独立ではなく、Aの値によって
使える軸が変わる階層構造）。目的は分類の厳密さではなく、**組み合わせで複雑なエフェクトパターンを
表現できるか**（合成可能性）。既存25 variant + 新規提案5つ（レーザー・スポットライト・ミラーボール・
剣の切り裂きリビール）を検証し、その過程で軸を2回訂正している（下記参照）。

## 8つの軸

### A. 配信方式（どこに描画されるか）

訂正版・3値。**「画面全体か1点か」は軸Aではなく軸Bの原点位置＋サイズのパラメータに過ぎない**
（vignette/hitstop = RadialBurstの巨大版、rain = ParticleBurstの原点が線になっただけ、
lightning = StrokeDrawのviewBoxが画面サイズなだけ）。

- `self-rendered-overlay` — 自分でDOM/描画を作る。位置・サイズはパラメータ（旧`anchor`と`fullscreen`はここに統合）
- `external-decorate` — 呼び出し側の既存要素を直接装飾（ボーダー系。`useCelebrateBorder`）
- `container-modifier` — 描画コンテンツを持たず、既存表示を揺らす等の外乱のみ（`shake`）

### B. 発生源の形状（Unity Shapeモジュール相当）

- `point` / `line-edge`（画面端など） / `area-scatter`（散布・画面全体含む） / `cone`（扇形） / `ring`（円周） / `path`（あらかじめ決めた経路。剣の軌跡など）
- サブフラグ：**原点固定 or 原点が経路上を移動**（スポットライト掃引）

### C. 要素数

- `single` / `multi-layer`（少数・個別パラメータ、ring/ripple/firework-shellsなど） / `particle-field`（多数・統計的生成）

### D. 要素ごとの動き

- `static-scale`（その場でscale+opacity） / `radial-velocity`（等速直進、重力なし） /
  `ballistic`（初速+重力の放物線） / `drift-sway`（横揺れしながら移動） /
  `orbit-twinkle`（その場で明滅・微小回転、移動なし） / `fall-only`（重力のみ） /
  `stroke-reveal`（形ではなく輪郭線がdashoffsetで描かれる） / `path-follow`（原点が経路上を移動）

### E. 塗り方（新しく描き足す場合）

- `fill` / `outline` / `glow-gradient` / `glyph-text` / `icon-svg-shape` / `decorative-frame`（conic-gradient等） /
  `custom-component`（呼び出し側が用意した任意のReactNode。画像・自作スプライト・既存コンポーネント丸ごと）
  ※「落下コンポーネントの衝撃エフェクト」検証で発覚した抜け。ライブラリ側の決め打ちshapeでは
  「呼び出し側が持っているコンポーネントをそのまま飛ばす」を表現できなかった。
  **実装済み**：`ParticleField`の`render`（`ReactNode | (state) => ReactNode`）がこれに当たる。

### F. 時間的な扱い

- `one-shot-fade`（現れて消える。現状の大半） / `enter-and-persist`（居座る。stamp/medal/record。
  **実装済み**：`enterSettle.ts`の`enterSettleStyle()`。checkmarkは見た目が似ているため
  当初ここに分類していたが、実装を調べ直した結果`stroke-reveal`（軸D、StrokePath）だと判明し訂正した） /
  `bounded-repeat`（指定durationの中で周期運動を繰り返す。ミラーボール、spinの延長） /
  `staged-sequence`（局面が順番に変わる。shatter、剣の切り裂き）

### G. 合成のされ方

- `standalone` / `layerable-via-with`（`options.with`で重ねられる） /
  `nested-multi-instance`（自分の内部で同じ構造を時間差で複数回使う。firework = ParticleBurstを3回）
- ※詳細は下記「合成層（sequence/parallel）」参照。`with`は`parallel`の一部でしかなく、
  今の`with`は登録済みvariant名しか並べられない（アドホックなパラメータ違いを並列実行できない）制約がある

### H. 計算方式（軸Dの動きを"どう実現するか"。軸Dとは直交）

- `css-keyframe`（静的な近似。baked values。安っぽさの原因になりやすい）
- `js-raf-closed-form`（rAFで閉じた式＝解析解を毎フレーム評価。誤差が蓄積しない。`ballistic.ts`で実装済み）
- `js-raf-integration`（rAFで毎フレーム積分。誤差蓄積の可能性、通常は closed-form を優先）
- `canvas` / `wasm`（粒子数が膨大・衝突判定ありの場合のみ検討。現時点では不要と判断。
  品質の低い自前物理演算もどきをCSSで無理やりやるくらいならwasmを挟んだ方がいいが、
  今回は解析解（closed-form）で十分な精度が出るためwasmは不要と判断した）

### I. マスク・リビール（既存表示の変形・除去）※新規追加

軸Eは「新しく何かを描く」前提だったが、**既存の描画（アプリ本体 or 他のleafが描いた覆い）を
変形・除去する**系の効果はここに属せなかった。「画面が暗くなった後、剣の軌跡に沿って覆いが
剥がれて元の画面が見えるようになる」のような効果がこれに当たる（軸Eでは表現不可能だった）。

- `clip-reveal`（`clip-path`で覆いを軌跡に沿って剥がす。剣の切り裂き、緞帳ワイプ、アイリスワイプ）
- `clip-conceal`（`clip-path`で軌跡に沿って覆っていく。緞帳が閉じる、逆再生）
- `color-filter`（色調のみ変える。色収差、色被り、グレースケール/反転フラッシュ）
- `distortion`（既存ピクセルを歪ませる。陽炎、水面の屈折。`backdrop-filter`や`feDisplacementMap`）
- `pixelate-glitch`（既存ピクセルを劣化・量子化する。モザイク遷移、砂嵐ノイズ）

軸Eと軸Iは**同じleafで両立しない**（新しく描くか、既存を変形するかのどちらか）。
ただし軸Dの`stroke-reveal`と軸Iの`clip-reveal`は、**同じ経路（path）パラメータを共有できる**
（剣の軌跡＝光る刃の描画パス＝覆いを剥がすマスクパスは同一データ）。実装時はpathを1つ生成して
両方のleafに渡す設計にすべき。

## 合成層（軸だけでは表現できない、複数leafの組み立て）

7〜8軸は「1つの葉ノード（1エフェクト）」のパラメータでしかない。実際に複雑な効果
（例：クラッカーが右下から登場→静止と同時に画像が切り替わり、3種の粒子が物理演算で飛び散る）
を作るには、複数leafを時間軸上に組み立てる**合成演算子**が要る。

```
leaf = { visual?: 軸A〜I, sound?: { presetIndex, gainScale } | none, haptic?: { pattern } | none }

sequence(leaf1, leaf2, ...)   // 前段の終了（or 指定トリガー）で次段が始まる
parallel(leaf1, leaf2, ...)   // 同時実行。各leafが独立した視覚/音/振動を持てる
```

- **`parallel`は`options.with`として実装済み**。`celebrate()`の第一引数・`with`はどちらも
  「登録済みの名前」と「生のReactNode」の両方を受け付ける（`celebrate(<MyBadge/>)`、
  `with: ["confetti", <MyBadge/>]`のように混在も可）。当初の「登録済み名前しか並べられない」制約は解消済み。
- **`sequence`は未実装**（「①の終了をトリガーに②が始まる」「①の終了と同時に中身が切り替わる」）
- **音・振動も今はトップレベルで1回きり**（`playSoundsForCelebration`）。leafごとに持たせる必要がある

## 追加の検証例（軸を再訂正した2件）

### 落下コンポーネント＋着地衝撃（画面が揺れて、コンポーネントは画面外へ）

「あるコンポーネントが落ちてきて画面下端に当たり、水面に落ちるような衝撃エフェクトが出て、
画面が揺れて、コンポーネントは画面外に落ちていく」という例で2つの抜けが見つかった。

1. **軸E「custom-component」の欠落**（上記で解消済み）。落下する本体は呼び出し側のコンポーネントで、
   ライブラリの決め打ちshapeでは描けない。
2. **合成層の「ハンドオフ」の欠落**：着地エフェクト（衝撃の飛沫）は、落下leafが**どこで止まったか**
   （着地座標・着地時刻）を知らないと正しい位置に出せない。`sequence(leaf1, leaf2)`は
   「leaf1が終わったらleaf2を始める」というタイミングの合成でしかなく、**leaf1の実行結果（座標などの
   ランタイムデータ）をleaf2のパラメータに渡す**手段がまだ設計にない。
   → `sequence`を`(prevResult) => leaf`を受け取れる形にする必要がある（Promiseチェーンに近い形）。
   画面が揺れる部分は軸A=`container-modifier`（`shake`と同じ機構）、コンポーネントが画面外に落ちる部分は
   ライブラリの管轄外（次項のスコープ境界を参照）。

### トーストの❌ボタンで風船のように破裂する

軸だけで表現できる（`self-rendered-overlay` + `point` + `particle-field` + `radial-velocity` の
破片バーストを、閉じるボタンの位置に`anchor`で出すだけ）。新しい軸は不要だった＝
既存の合成可能性の裏付けになった例。

### スコープ境界の原則（上記2例から確定）

**ライブラリが提供するのはバースト／オーバーレイ演出そのものだけ**であり、
「既存コンポーネント自身の退場・入場アニメーション（画面外へ落ちる、フェードで消える等）」は
**呼び出し側の責務**であって`celebrate`のスコープではない。トーストの例で言えば、
風船が割れる演出（`with`で重ねるパーティクル）はライブラリが担うが、トースト本体を
その後どう消すか（即座に非表示にするかフェードさせるか）は呼び出し側のトースト実装が決める。

## 実装済み：拡張可能なエンジンの核

「見えていない軸は今後も出続ける」という前提のもと、**コア（`motionProfile.ts`/`ParticleField.tsx`）を
改変せずに新しい動き・新しい見た目を追加できる**ことを優先して実装した（軸D・軸Eの将来の拡張に対応）。

- **`ballistic.ts`**：`ballisticPositionAt(params, elapsedSeconds)` — 初速+重力の閉じた式（解析解）。
  毎フレーム積分するのではなく`x = vx*t`, `y = vy*t + 0.5*g*t²`を直接評価するため誤差が蓄積しない
  （軸H = `js-raf-closed-form`の実装）。
- **`motionProfile.ts`**：`MotionProfile<P> = (elapsedSeconds, params: P) => ParticleState`という
  **関数型**として定義（登録済み名前の閉じたUnion型ではない）。呼び出し側は`MOTION_PROFILES`に
  登録されていない自作の動き（例：渦を巻きながら落ちる`spiralMotion`）をそのまま渡せる。
- **`ParticleField.tsx`**：`ParticleSpec<P>[]`（`motion`・`params`・`durationSeconds`・`delaySeconds?`・
  `render?`）を受け取り、1つの`requestAnimationFrame`ループで毎フレーム`motion()`を評価し、
  DOM要素の`style.transform`/`style.opacity`に直接書き込む（Reactの再レンダーを経由しないため
  粒子数が増えても軽い）。`render`は軸Eの`custom-component`拡張そのもの。
- **`StrokePath.tsx`**：経路を`stroke-dasharray`/`dashoffset`で描き下ろす構造テンプレート
  （軸D=`stroke-reveal`）。`lightning`の稲光・`checkmark`は実装としては
  これのパラメータ違い（`lines: StrokeLine[]`に太さ・色・duration・グロー強度を渡すだけ。
  `points`＝直線の折れ線、`d`＝円弧などの曲線）。
- **`ClipReveal.tsx`**：覆いを`clip-path`で動かして中身を出し入れする構造テンプレート
  （軸I=`clip-reveal`。緞帳ワイプ等）。RadialBurst/ParticleField/StrokePathとは別の描画軸
  （「粒・線を描き足す」のではなく「覆いを動かして中身を出し入れする」）。
  `edge`（left/right/top/bottom/center）×`direction`（in/out）は1つのCSS keyframeの
  順再生・逆再生（`animation-direction: reverse`）だけで表現する。まだどのTier1カタログ名にも
  紐付いていない（Tier3の生プリミティブとして先に実装した）。
- **`RadialBurst`が子要素（`<RadialBurstLayer/>`）の並びも受け付けるようになった**：
  `layers`propに配列を渡す方式（データとして持ち回りたい場合）と、
  `<RadialBurst><RadialBurstLayer .../>...</RadialBurst>`（JSXとして並べたい場合）の
  両方が等価に使える。後者はReactの子要素マーカーパターン（`<select><option/></select>`と同じ）。
- **`useContainerModifier()`**：`<html>`への一時的なclass付け外し（軸A=`container-modifier`）を
  celebrate()を経由せず直接使うためのフック。内部実装（`containerModifier.ts`のref カウント）は
  `shake`/`hitstop`/`vignette`とTier3利用の両方で共有している。
- **`CelebrateProvider`の`container`prop**：rain/lightningのような画面全体エフェクトが
  常に`document.body`（viewport全体）に固定されていた問題を解消。`container`を渡すと、
  そのローカル要素の内側だけにスコープできる。
- **`enterSettle.ts`**：「入って、そのまま残る」構造テンプレート（軸F=`enter-and-persist`）。
  stamp/medal/recordは実装としては全部「scale・縦位置・回転がease-outで収まりopacityが0→1になり、
  そのまま留まる」という同じ形で、違いは開始値とイージング（recordだけ行き過ぎてから戻る
  バネ的な動き）だけだった。他の3primitiveと違い「呼び出し側が既に持つ要素へ合成する」形の
  primitiveなので、専用コンポーネントではなく`enterSettleStyle(options)`という薄いヘルパー関数
  として実装した。バネ的な動き（record）はkeyframeを分岐させず、`cubic-bezier(0.34,1.56,0.64,1)`
  （back-ease-out）1本のイージング関数で表現している。

confetti/sparkle/cracker/rain/firework/sakuraなど既存の粒子系variantは
`ParticleField`/`motionProfile`エンジンに統合済み（実装は見た目の忠実な再現より
構造の共通化を優先したため、cracker等は元のCSSキーフレーム版と厳密には一致しない）。
checkmarkは`StrokePath`（軸D=`stroke-reveal`）に統合済み（円弧・チェックとも
`stroke-dasharray`/`dashoffset`という同じ仕組みで、lightningの稲光と同じ描画機構）。

## ボーダーエフェクトの重複（列挙）

`RadialBurst`（pop/ripple/ring/flash）と同じ構造の重複が、`useCelebrateBorder`側の10種類にもある。
CSS実装（`celebrate.css`内の`.celebrate-border-*`）を見ると、**機構は実質4種類**しかない。

| 機構                              | 該当kind                                      | 実体                                                                                            | パラメータ差でしかないもの                                                                                                                                                                                                                                     |
| --------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **box-shadowのパルス/フリッカー** | `glow` / `neon` / `fire` / `ice` / `electric` | `box-shadow`を0〜複数ステップでアニメーションさせるだけ                                         | 色（`--celebrate-border-color`）とキーフレームのステップ数・タイミングカーブが違うだけ。`glow`=1段パルス、`neon`/`fire`/`ice`=3段フリッカー、`electric`=`steps(1,end)`の荒いジッター。**同じ「グロー」primitiveに`flickerSteps`＋`color`を渡す形に統合できる** |
| **conic-gradientの回転**          | `spin` / `rainbow`                            | `border-image`に`conic-gradient`を敷いて`--celebrate-border-angle`を0→360degさせる              | `spin`は単色→透明のグラデ、`rainbow`は虹色グラデ。**色相配列を渡すパラメータ違いに統合できる**                                                                                                                                                                 |
| **ダッシュ境界線の行進**          | `ants`                                        | `border: dashed`を`background-position`風にずらしながらフェード                                 | 現状1種類のみ（重複なし）                                                                                                                                                                                                                                      |
| **二重リングの拡張**              | `ring`                                        | `::before`/`::after`の2つの疑似要素を異なる遅延で拡大フェード（`RadialBurst`のoutline層と同型） | 現状1種類のみだが、**構造的には軸Bのring形状＋軸D static-scaleそのもの**＝将来的に`RadialBurst`と共通化できる可能性がある                                                                                                                                      |
| **一過性のスイープ**              | `shine`                                       | `::after`の光の帯を左から右へスライド                                                           | 現状1種類のみ（重複なし）                                                                                                                                                                                                                                      |

**実装済み**：`glow`/`neon`/`fire`/`ice`/`electric`は`borderGlow.ts`の`BorderGlowPreset`
（`{stops: {offset, boxShadow}[], durationMs, easing?}`）に統合した。CSSの`@keyframes`は
ステップ数・タイミングを実行時パラメータ化できないため、これだけは静的CSSではなく
Web Animations API（`Element.animate`）で駆動する（`playBorderGlow(el, preset)`）。
`spin`/`rainbow`は`borderConicRing.ts`の`BorderConicRingPreset`
（`{stops: string, mode: "sweep" | "flash", durationMs}`）に統合した
（`stops`はconic-gradientの色並びをCSSカスタムプロパティとして渡す）。
`ring`/`ants`/`shine`は元々1種類ずつなので統合せず、単純なCSSクラス切り替えのまま。

呼び出し側が生のDOM要素を掴んで`playBorderGlow()`等を直接呼ぶ必要はない。
`useCelebrateBorder()`の`celebrateBorder()`が、カタログの名前（Tier1）と
`glowPreset()`等が返す生のプリセット（Tier3。`mechanism`をプリセット自身が持つため
ラッパーオブジェクト不要＝`celebrate(<ReactNode/>)`と同じ「名前か生の値を直接渡す」形）
のどちらも受け付け、DOM操作はフックの中に閉じ込めている。

## 開発者体験（3層のAPI）

エンジン化しても、利用者が毎回8軸+合成層を手で組み立てるのは非現実的。3層で層別化する。

```tsx
// Tier 1: カタログ（既存25 variant。最も簡単、これまでのAPIを一切壊さない）
celebrate("confetti");
<Celebrate variant="stamp" text="合格" />

// Tier 2: レシピ（複数局面を順番に切り替える。前段の結果を次段へ渡せる）
const myImpact = (
  <Sequence steps={[
    { render: () => <FallingCoin />, durationMs: 400, computeResult: () => ({ landedAtRem: 3.2 }) },
    { render: (result) => <ImpactBurst xRem={result.landedAtRem} />, onEnter: () => playChime(2) },
  ]} />
);
celebrate(myImpact);
<Celebrate>{myImpact}</Celebrate>

// Tier 3: 生コンポーネント（Provider不要、自分のJSXに直接置く。最大の自由度）
<ParticleField particles={[{ motion: ballisticMotion, params: {...}, durationSeconds: 0.6 }]} />
```

Tier1はTier2のプリセット、Tier2はTier3の組み合わせ、Tier3が8軸の生パラメータ。
下の層に降りるほど自由度が上がる（Framer Motionのanimate prop→variants→useAnimation、
GSAPのtimelineと同じ層構造）。

**訂正**：Tier2は当初`sequence`/`parallel`/`leaf`という純粋関数＋`particleBurst`/`settleIn`/`chime`
といった専用DSLを構想していたが（このセクションの旧サンプル）、これは実装せずに終わった
（呼び出し側が実際に必要とする場面が無いまま、DSL自体の設計だけが肥大化するリスクがあった）。
実際に実装した`sequence`（`Sequence`コンポーネント、詳細は上記「実装済み」節）は、
既存のTier3コンポーネント（`ParticleField`/`RadialBurst`等）をそのまま`render`に差し込める
形にしてあるため、専用DSLを別途作らなくても既存のTier3資産をそのままステップとして使い回せる。
`parallel`相当は元々`options.with`が担っており、これは変更していない。

## 既存variantの軸マッピング（検証・抜粋）

| variant            | A                     | B                        | C                 | D                       | E/I              | F                 |
| ------------------ | --------------------- | ------------------------ | ----------------- | ----------------------- | ---------------- | ----------------- |
| pop                | self-rendered-overlay | point                    | single            | static-scale            | fill             | one-shot-fade     |
| ripple             | self-rendered-overlay | point                    | multi-layer(3)    | static-scale            | outline          | one-shot-fade     |
| confetti           | self-rendered-overlay | point                    | particle-field    | radial-velocity         | fill             | one-shot-fade     |
| cracker            | self-rendered-overlay | cone                     | particle-field    | ballistic               | fill(streamer)   | one-shot-fade     |
| sakura             | self-rendered-overlay | point                    | particle-field    | drift-sway              | fill(petal)      | one-shot-fade     |
| rain               | self-rendered-overlay | line-edge（画面幅）      | particle-field    | fall-only               | fill             | one-shot-fade     |
| lightning          | self-rendered-overlay | point→path（画面サイズ） | single            | stroke-reveal           | icon-svg-shape   | one-shot-fade     |
| shatter            | self-rendered-overlay | viewport                 | snapshot-mesh(96) | gravity + rotation      | captured-pixels  | staged-sequence   |
| checkmark          | self-rendered-overlay | point                    | multi-layer(2)    | stroke-reveal           | icon-svg-shape   | enter-and-persist |
| stamp/medal/record | self-rendered-overlay | point                    | single            | static-scale            | fill+glyph       | enter-and-persist |
| hitstop            | self-rendered-overlay | area-scatter（画面全体） | single            | static-scale(scale固定) | fill             | one-shot-fade     |
| vignette           | self-rendered-overlay | area-scatter（画面全体） | single            | static-scale(inset反転) | glow-gradient    | one-shot-fade     |
| border: spin/ants  | external-decorate     | ring                     | single            | stroke-reveal相当       | decorative-frame | bounded-repeat可  |
| shake              | container-modifier    | —                        | —                 | —                       | —                | one-shot          |

## 新規提案の軸マッピング

| 案                   | A                     | B                        | C              | D                           | E/I                                        | F                  |
| -------------------- | --------------------- | ------------------------ | -------------- | --------------------------- | ------------------------------------------ | ------------------ |
| レーザー             | self-rendered-overlay | cone                     | particle-field | radial-velocity             | glow(beam)                                 | one-shot-fade      |
| スポットライト       | self-rendered-overlay | point（**原点移動**）    | single         | path-follow                 | glow-gradient                              | one-shot-fade      |
| ミラーボール         | self-rendered-overlay | area-scatter（画面全体） | particle-field | orbit-twinkle               | fill                                       | **bounded-repeat** |
| 剣の切り裂きリビール | self-rendered-overlay | path（剣の軌跡）         | multi-layer(2) | stroke-reveal + path-follow | glow（刃）＋ **clip-reveal（覆いの除去）** | staged-sequence    |

## 次にやること（未着手）

1. ~~合成層（`sequence`/`parallel`/`leaf`）を純粋関数として実装する。~~
   **`sequence`は実装済み**（`Sequence.tsx`）。`parallel`相当（`options.with`）は既存の
   `options.with`のまま（登録名・ReactNode混在可）。
   `sequence`は当初純粋関数`(...leaves) => leaf[]`として構想していたが、
   「前段の実行結果（着地座標など）を次段のパラメータとして受け取れる」ためには
   ステップ間の状態（前段の結果を覚えて次段に渡す）が要るため、**状態を持つReactコンポーネント**
   （`<Sequence steps={[...]} />`。各`step`は`render(prevResult)`・`durationMs`・`computeResult`・
   `onEnter`を持つ）として実装した。`leaf`という独立した合成プリミティブは作らず、
   `SequenceStep`自体がその役割を兼ねる（`sequence`の外で単体の`leaf`を使う場面が
   まだ無いため、使われない抽象を先に作らない判断）。
2. ~~音・振動を`leaf`単位に持たせる（現状のトップレベル1回きりから移行）~~
   **実装済み**：`SequenceStep.onEnter(prevResult)`がそのステップの開始時に1回だけ呼ばれる。
   `celebrate()`のトップレベル`sound`/`haptic`（`recipes.tsx`のカタログ機構）とは別経路で、
   `Sequence`を使う場合は呼び出し側が`onEnter`の中で任意の音・振動を鳴らせる。
3. ~~マスク・リビール（軸I）の最初の実装：`clip-reveal`を1つ（緞帳ワイプ等）試作する~~
   **実装済み**：`ClipReveal.tsx`。edge（left/right/top/bottom/center）×direction（in/out）を
   1つのCSS keyframeの順再生・逆再生（`animation-direction: reverse`）だけで表現し、
   keyframeを倍にしない設計にした。shatterはClipRevealではなく、画面のスナップショットを
   Canvasの三角形メッシュとして描画する。
4. ~~`RadialBurst`を軸B「原点移動」に対応させる（スポットライト用）~~ **実装済み**：
   `RadialBurst`の`origin: RadialOriginKeyframe[]`（`{offset, xRem, yRem}`の配列）。
   経由点は実行時に決まる任意個なのでCSS keyframesでは表現できず、`borderGlow.ts`と同じ理由で
   Web Animations API駆動にした。全layerを束ねる`.celebrate-radial-origin`という薄いラッパー
   要素に対してtranslateを掛け、各layer自身のscale/opacityアニメーション（`.celebrate-radial`）
   とは別要素・別`transform`にすることでCSS/WAAPIの競合を避けている。
5. ~~confetti/sparkle/cracker/rain/firework(粒部分)/sakuraを`motionProfile`/`ParticleField`エンジンに
   統合する~~ **実装済み**（詳細は上記「実装済み」節）。checkmarkの`StrokePath`統合も実装済み。
6. ~~`F=bounded-repeat`を全プリミティブ共通のduration機構に統合する~~ **実装済み**：
   `useCelebrateBorder()`の`celebrateBorder(trigger, { intensity })`が、glow/conicRing/class
   3機構すべてに同じ`intensityToDurationMultiplier`を適用する。CSS駆動の2機構（conicRing/class）は
   `--celebrate-border-duration-scale`という1つの共有カスタムプロパティ（`calc(Xs * var(...))`）で
   統一し、WAAPI駆動のglowだけは`durationMs`を直接スケールして渡す（celebrate()側の
   `durationForCelebration`と同じ「intensity→倍率」変換を再利用）。
7. ~~`scale`/`color`オプションを`firework`だけでなく`pop`/`ripple`/`ring`/`flash`（RadialBurst系全部）にも
   効かせる。~~ **実装済み**：`RadialBurst`が`scale`/`color`propを受け取り、
   4 variant全部の`recipes.tsx`でoptionsから配線した。

## demoアプリ

`demo/src/App.tsx`は、このセッションで追加した新プリミティブ（`ClipReveal`/`Sequence`/
`RadialBurst`の`origin`/`useCelebrateBorder`の`intensity`）を反映済み
（`ClipRevealDemo`/`SequenceDemo`セクション追加、`RadialBurstBuilder`にorigin切替、
`BorderEffectDemo`にintensityスライダー）。既存の8セクション構成
（RadialBurst/ParticleField/ボーダーの「空の構造から作る」ビルダー、Tier1 Playground、
ポップイットグリッド、コンボ、エンジン直利用、ReactNode合成、ローカルスコープ）は
実装として妥当だったため、ゼロから書き直さずこの構成の上に追加した。

### 完了した項目（旧リストより）

- ~~`options.with`を「登録済みvariant名」だけでなく「アドホックなleaf」も受け付けるよう拡張する~~
  → ReactNodeを受け付けるようになった（完了）
- ~~ドキュメント（README駆動）を先に書き、Tier1〜3の書き心地を実装前に検証する~~
  → README.md作成済み（実装後になったが完了）
- ~~neon/fire/iceボーダーエフェクトの重複整理~~ → `borderGlow.ts`/`borderConicRing.ts`に統合済み
- StrokePath（lightningの稲光・checkmarkの統合）、useContainerModifier（Tier3フック化）、
  CelebrateProviderの`container`prop（rain等のローカルスコープ化）も完了
