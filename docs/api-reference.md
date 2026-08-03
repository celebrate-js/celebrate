# API リファレンス

使い方の説明・コード例は[ガイド](./guide.md)を参照。ここでは各propsの型・既定値・説明だけを一覧する。

## `CelebrateProviderProps`

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `theme` | `CelebrateTheme` | 組み込みの既定テーマ | 意匠（色・角丸・書体）。個々の`celebrate()`呼び出しで上書き可能。 |
| `container` | `RefObject<HTMLElement \| null>` | - | 指定すると、rain/lightning/shatterのような画面全体エフェクトをviewport全体ではなくこの要素の内側に閉じ込める（`position: relative`をこの要素に設定しておくこと）。省略時は`document.body`。 |

## `CelebrateOptions`（`celebrate(content, options)`の第二引数）

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `anchor` | `RefObject<HTMLElement \| null>` | - | 演出の基準にする要素。省略＝画面中央（グローバル）。渡す＝その要素の中心（ローカル）。 |
| `text` | `string` | `""` | `stamp` / `record` / `bounce` / `medal` / `popup`で大きく出す文字。 |
| `note` | `string` | - | `record`で大きい文字の下に添える一言（例：「れんぞく 7問」）。 |
| `size` | `"md" \| "lg"` | `"md"` | `stamp`の印影の大きさ。 |
| `with` | `CelebrateVariant \| ReactNode \| (CelebrateVariant \| ReactNode)[]` | - | 重ねて同時に出すもの。登録済みの名前・生のReactNode・その配列（混在可）。 |
| `theme` | `CelebrateTheme` | Providerのtheme | この呼び出しだけ意匠を上書き。 |
| `sound` | `boolean` | `true` | 効果音を鳴らすか。登録済みの名前にだけ効果を持つ。 |
| `haptic` | `boolean` | `true` | 端末を振動させるか。登録済みの名前にだけ効果を持つ。 |
| `seed` | `number` | ランダム | `sparkle`/`sakura`/`heart`/`star`/`emoji`/`cracker`：再現可能なテスト・デモ用。 |
| `glyphs` | `readonly string[]` | variantごとの定番セット | `heart`/`star`/`emoji`：撒く文字・絵文字を上書き。 |
| `glyph` | `string` | CSSで描いた雲形 | `float`：漂わせる文字を指定（絵文字ではなく雲がデフォルト）。 |
| `color` | `string` | 淡いピンク（`sakura`）／theme（RadialBurst系） | `sakura`：花びらの色。`pop`/`ripple`/`ring`/`flash`：色の既定値を上書き。 |
| `scale` | `number` | `1` | 見た目の大きさ倍率。`firework`/`pop`/`ripple`/`ring`/`flash`が対応。 |
| `colors` | `readonly string[]` | `theme.confettiColors` | `firework`：色パレットの上書き。 |
| `fireworkStyle` | `"peony" \| "willow" \| "ring"` | `"peony"` | `firework`：花火の種類。 |
| `intensity` | `number` | `1` | 演出の強度。拡大率・duration・音量・振動に対数カーブで反映。 |
| `soundPreset` | `number` | 各variantの既定音（`sparkle`は毎回ランダム） | 効果音のpreset番号（`SPARKLE_SOUND_PRESETS`の添字。範囲外は循環する）を上書きする。どの音を鳴らすかは色やscaleと同じく呼び出し側が目的・用途に応じて決めるものなので、ライブラリ側で決め打ちにしていない。 |
| `durationMs` | `number` | 自動計算 | 表示し続ける時間の明示的な上書き。`with`に生のReactNodeを渡した場合、そのdurationはカタログから引けないためここで指定する。 |

## `RadialBurstLayer` props

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `shape` | `"fill" \| "outline" \| "glow"` | - | 塗り方。 |
| `scaleFrom` | `number` | - | 開始時のscale。 |
| `scaleTo` | `number` | - | 終了時のscale。 |
| `size` | `number` | - | 要素の基準直径（rem）。 |
| `color` | `string` | 呼び出し側の色（`theme.stampColor`等） | このlayerだけ色を上書き。 |
| `durationMs` | `number` | `500` | このlayer自体のアニメーション長。 |
| `delayMs` | `number` | `0` | 発火からの遅延。複数layerを時間差で重ねる場合に使う。 |

`RadialBurst`自体のprops（`layers`/`children`/`theme`/`className`に加えて）：

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `scale` | `number` | `1` | 見た目の大きさ倍率。各layerの`size`にだけ掛かる。 |
| `color` | `string` | `theme.stampColor` | 色の既定値。layer自身の`color`が優先される。 |
| `origin` | `readonly RadialOriginKeyframe[]` | - | 原点（全layer共通の中心点）が経路上を移動する場合の経由点（2点以上）。省略時は原点固定。スポットライトの掃引などに使う。`{offset: 0〜1, xRem, yRem}`の配列で、`Element.animate`（Web Animations API）で駆動する。 |
| `originDurationMs` | `number` | `800` | 原点移動アニメーションの長さ。 |

## `ParticleSpec<P>` props

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `motion` | `MotionProfile<P>` | - | `(elapsedSeconds, params) => ParticleState`を満たす関数。プリセット（`fallMotion`等）か自作関数。 |
| `params` | `P` | - | `motion`に渡すパラメータ。 |
| `durationSeconds` | `number` | - | この粒の表示時間。 |
| `delaySeconds` | `number` | `0` | 発火からの遅延。 |
| `render` | `ReactNode \| ((state: ParticleState) => ReactNode)` | `defaultRender` | 見た目。状態に応じて変えたい場合は関数で渡す。 |

## `StrokeLine` props

`points`と`d`はどちらか一方を指定する（直線区間のみなら`points`、円弧など曲線を含むなら`d`）。

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `points` | `string` | - | SVG polylineの`points`属性にそのまま渡せる文字列（0〜100の相対座標。直線区間のみ）。 |
| `d` | `string` | - | SVG pathの`d`属性にそのまま渡せる文字列（円弧などの曲線も表現できる。例：checkmarkの丸）。 |
| `strokeWidth` | `number` | - | 線の太さ。 |
| `dashLength` | `number` | - | `stroke-dasharray`/`dashoffset`に使う値（経路のおおよその長さ）。 |
| `color` | `string` | `"#fff"` | 線の色。 |
| `opacity` | `number` | `1` | 不透明度。 |
| `glow` | `"soft" \| "electric"` | - | グローの強さ。`electric`＝稲光相当の多重グロー、`soft`＝ヒビ相当の淡いグロー。省略でグローなし。 |
| `durationMs` | `number` | - | 描き下ろしのアニメーション長。 |
| `delayMs` | `number` | `0` | 発火からの遅延。 |

## `ClipReveal` props

覆いを`clip-path`で動かして中身を出し入れするプリミティブ（軸I=clip-reveal）。まだどの
Tier1カタログ名にも紐付いていない、Tier3の生プリミティブ。詳細は
[構造分解メモ](./effect-structure-taxonomy.md)参照。

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `edge` | `"left" \| "right" \| "top" \| "bottom" \| "center"` | `"left"` | どの方向へワイプするか。`"center"`は円形（circle）のワイプ。 |
| `direction` | `"reveal" \| "cover"` | `"reveal"` | `"reveal"`＝覆いが晴れて中身が見える。`"cover"`＝覆いが閉じて中身を隠す（同じ経路の逆再生）。（`"in"`/`"out"`は主語が曖昧＝覆いのin/outか中身のin/outか誤読しやすいため、動詞に変更した） |
| `durationMs` | `number` | `500` | アニメーション長。 |
| `delayMs` | `number` | `0` | 発火からの遅延。 |
| `color` | `string` | `"#000"` | カーテン自体の色。 |
| `children` | `ReactNode` | - | カーテンの下に見える内容。省略時は単色のカーテンだけを描く。 |

## `Sequence` props

合成層「sequence」（複数局面が順番に切り替わる。前段の実行結果を次段へ渡せる）。
`with`（`parallel`相当・同時に重ねる）とは別軸で、「前段が終わってから次段が始まる」場合に使う。
詳細は[構造分解メモ](./effect-structure-taxonomy.md)参照。

```tsx
<Sequence steps={[
  { render: () => <FallingCoin />, durationMs: 400, computeResult: () => ({ landedAtRem: 3.2 }) },
  { render: (result) => <ImpactBurst xRem={result.landedAtRem} /> },
]} />
```

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `steps` | `readonly SequenceStep<TResult>[]` | - | ステップの一覧。順番に表示する。 |

`SequenceStep<TResult>`：

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `render` | `(prevResult: TResult \| undefined) => ReactNode` | - | このステップの内容。前ステップの結果（初段は`undefined`）を受け取れる。 |
| `durationMs` | `number` | - | このステップの表示時間。省略時はこのステップで止まる（最後のステップに使う）。 |
| `computeResult` | `(prevResult: TResult \| undefined) => TResult` | 前段の結果をそのまま引き継ぐ | 次のステップに渡す値を計算する。 |
| `onEnter` | `(prevResult: TResult \| undefined) => void` | - | このステップが始まった瞬間に1回だけ呼ばれる（効果音・振動などをステップ単位に持たせる）。 |

## `enterSettleStyle(options)`

「入って、そのまま残る」構造テンプレート（stamp/medal/recordが共有）。`.celebrate-enter-settle`
クラスと組み合わせ、戻り値を呼び出し側の要素の`style`にマージして使う（専用コンポーネントではなく
既存要素へ合成するヘルパー関数。詳細は[構造分解メモ](./effect-structure-taxonomy.md)参照）。

```tsx
<div
  className={clsx("my-badge", "celebrate-enter-settle")}
  style={enterSettleStyle({ scaleFrom: 1.7, rotateFromDeg: -14, rotateToDeg: -6 })}
/>
```

`EnterSettleOptions`（全て省略可）：

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `scaleFrom` | `number` | `1` | 開始時のscale。 |
| `scaleTo` | `number` | `1` | 終了時のscale。 |
| `translateYFromRem` | `number` | `0` | 開始時の縦方向オフセット（rem。負で上から）。 |
| `rotateFromDeg` | `number` | `0` | 開始時の回転（度）。 |
| `rotateToDeg` | `number` | `0` | 終了時の回転（度）。傾いたまま留めたい場合（stamp）はここも指定する。 |
| `easing` | `"settle" \| "overshoot"` | `"settle"` | `"settle"`＝素直に収まる（ease-out）。`"overshoot"`＝行き過ぎてから戻るバネ的な動き（record相当。1本のイージング関数`cubic-bezier(0.34,1.56,0.64,1)`で表現）。 |
| `durationMs` | `number` | `300` | アニメーション長。 |

## `useCelebrateBorder()`

```tsx
const { ref, celebrateBorder } = useCelebrateBorder<HTMLDivElement>();
```

| 戻り値 | type | 説明 |
|---|---|---|
| `ref` | `RefObject<T \| null>` | 装飾したい要素に渡す。 |
| `celebrateBorder` | `(trigger?: BorderTrigger, options?: CelebrateBorderOptions) => void` | 発火する。`BorderTrigger`はカタログの名前（`BorderEffectKind`）か、`glowPreset()`等が返す生のプリセット（`mechanism`を自身が持つのでラッパー不要）。 |

`CelebrateBorderOptions`：

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `intensity` | `number` | `1` | 演出の強度。durationに対数カーブで反映される（`celebrate()`の`intensity`と同じ設計。全機構＝glow/conicRing/class共通で効く）。 |

`BORDER_EFFECT_KINDS`（10種）は実質2機構＋単純なCSSクラス3種に集約されている。

| kind | 機構 | 既定duration | 説明 |
|---|---|---|---|
| `glow` | `glow` | 900ms | box-shadowを外へ広げながらフェードする1回パルス。 |
| `neon` | `glow` | 1000ms | ネオンサインのように明滅してから消える。 |
| `fire` | `glow` | 1100ms | 暖色2色のゆらめき。 |
| `ice` | `glow` | 1100ms | 寒色2色の静かなシマー。 |
| `electric` | `glow` | 700ms | 稲妻のような離散的なジッター（neonより速い）。 |
| `spin` | `conicRing` | 1200ms | 外周をconic-gradientのリングが回り続ける（`mode: "sweep"`）。 |
| `rainbow` | `conicRing` | 900ms | 虹色のリングが一度だけ現れて消える（`mode: "flash"`）。 |
| `ring` | `class` | 800ms | 輪郭のはっきりした二重リングが外へ広がって消える。 |
| `ants` | `class` | 1200ms | 破線の輪がゆっくり回転する（マーチングアンツ）。 |
| `shine` | `class` | 700ms | 斜めの光沢が一度だけ横切る。 |

`glow`機構のプリセット関数：`glowPreset(color)` / `neonPreset(color)` / `firePreset([c1, c2])` / `icePreset([c1, c2])` / `electricPreset([c1, c2])`。
`conicRing`機構のプリセット関数：`spinPreset(stops)` / `rainbowPreset(stops)`（`stops`はconic-gradientの色並び文字列）。

## `useContainerModifier()`

```tsx
const trigger = useContainerModifier();
```

| 引数 | type | 説明 |
|---|---|---|
| `className` | `string` | `<html>`に付け外しするクラス名。 |
| `durationMs` | `number` | このクラスを保持する時間。 |

## `RewardTier<W>`

| prop | type | 既定値 | 説明 |
|---|---|---|---|
| `chance` | `number` | - | この階級が選ばれる相対重み（合計が1である必要はない）。 |
| `with` | `W` | - | この階級で重ねるもの（`celebrate()`の`options.with`にそのまま渡せる）。 |
