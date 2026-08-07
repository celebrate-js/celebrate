# ガイド

## クイックスタート

```tsx
import { CelebrateProvider, useCelebrate } from "@celebrate-js/celebrate/react";

function App() {
  return (
    <CelebrateProvider>
      <SubmitButton />
    </CelebrateProvider>
  );
}

function SubmitButton() {
  const celebrate = useCelebrate();
  return <button onClick={() => celebrate("confetti")}>送信</button>;
}
```

## 設計の考え方（3層）

このライブラリは3つの層でできています。下に降りるほど自由度が上がり、書く量も増えます。

| 層                           | 何をするか                       | 例                                                   |
| ---------------------------- | -------------------------------- | ---------------------------------------------------- |
| **Tier 1：カタログ**         | 登録済みの名前を選ぶだけ         | `celebrate("confetti")`                              |
| **Tier 2：合成**             | 名前や自作コンポーネントを重ねる | `celebrate("stamp", { with: ["confetti"] })`         |
| **Tier 3：構造テンプレート** | 生のパラメータで組み立てる       | `<RadialBurst><RadialBurstLayer .../></RadialBurst>` |

`stamp`・`pop`・`ripple`・`ring`・`flash`のような名前（Tier 1）は、実装としては`RadialBurst`や個別コンポーネント（Tier 3）にパラメータを渡しているだけの「プリセット」です。カタログにない見た目が欲しい場合は、名前を探すのではなくTier 3のプリミティブを直接使ってください。

## `<CelebrateProvider>` / `useCelebrate()`

アプリのルートに1回置く。`useCelebrate()`が返す`celebrate(content, options)`はコンポーネント内（フック）でのみ呼べる。

```tsx
const celebrate = useCelebrate();
celebrate("stamp", { text: "合格" }); // 画面中央
celebrate("confetti", { anchor: buttonRef }); // 指定した要素の位置
celebrate(<MyBadge />); // 登録名の代わりに生のReactNodeも渡せる
celebrate("stamp", { with: ["confetti", <MyBadge />] }); // 重ね合わせ（名前とReactNodeを混在可）
```

props・optionsの全フィールドは[API リファレンス](./api-reference.md)を参照。

## 登録済みの名前（Tier 1カタログ）

カタログに入る基準は「構造的な新しさ」ではなく、**UXの意味（どの瞬間に使うか）で1語の名前を持つ価値があるか**。
`pop`/`ripple`/`ring`/`flash`は構造的には全部`RadialBurst`の同じプリセット違いだが、UX上は別の意味
（軽いタップ確認／報酬）を持つので別名で残している。並び順もこの意味カテゴリでグルーピングしてある
（`RECIPES`オブジェクトの定義順＝実装順・思いつき順ではない）。

| カテゴリ                             | 名前                                                     |
| ------------------------------------ | -------------------------------------------------------- |
| 入力フィードバック（軽いタップ確認） | `pop` `ripple` `checkmark`                               |
| 達成（正解・完了・順位）             | `stamp` `medal` `bounce`                                 |
| 報酬（ご褒美・大当たり）             | `confetti` `sparkle` `record` `flash` `ring` `firework`  |
| リアクション（絵文字で気持ちを表す） | `heart` `star` `emoji`                                   |
| キャラクター・ナラティブ             | `cracker` `float`                                        |
| 環境演出（画面全体）                 | `sakura` `shake` `hitstop` `vignette` `rain` `lightning` |
| 段階エフェクト                       | `shatter`                                                |
| テキストチャネル                     | `popup`                                                  |

一覧は`CELEBRATE_VARIANT_NAMES`としてもexportされている（この表と同じ順）。

## `<Celebrate variant={...} />`

命令的にではなく、その場に居座らせたい場合（結果パネルに印影が残る、等）に使う宣言的コンポーネント。propsは`celebrate()`と同じ。

## `<RadialBurst>` — 中心から広がる構造テンプレート

`pop` / `ripple` / `ring` / `flash`は全部これのプリセット違い。

```tsx
<RadialBurst>
  <RadialBurstLayer
    shape="outline"
    scaleFrom={0.3}
    scaleTo={2.4}
    size={2.4}
    color="#4aa8ff"
    durationMs={500}
    delayMs={0}
  />
  <RadialBurstLayer
    shape="outline"
    scaleFrom={0.3}
    scaleTo={2.7}
    size={2.0}
    color="#4aa8ff"
    durationMs={500}
    delayMs={140}
  />
</RadialBurst>
```

`layers`propで配列として渡すことも可（`<RadialBurstLayer/>`と等価、プリセットのようにデータとして持ち回りたい場合はこちら）。

## `<ParticleField>` — 任意の動き・任意の見た目を持つ粒の集合

`confetti` / `sparkle` / `cracker` / `rain` / `sakura`は全部これのプリセット。`motion`はプリセット（`fallMotion` / `radialMotion` / `ballisticMotion` / `staticScaleMotion` / `orbitTwinkleMotion`）か、同じ型を満たす自作関数を渡せる。`render`は文字列専用ではなく任意のReactNode（画像・SVG・自作コンポーネント）を渡せる。

```tsx
<ParticleField
  particles={Array.from({ length: 24 }, (_, i) => ({
    motion: fallMotion,
    params: { fallSpeed: 8, startX: (i / 23 - 0.5) * 24, swayAmplitude: 1.5, durationSeconds: 1.5 },
    durationSeconds: 1.5,
    delaySeconds: (i / 24) * 0.4,
    render: <MySnowflake />,
  }))}
/>
```

## `<StrokePath>` — 経路を描き下ろす構造テンプレート

`lightning`の稲光・`shatter`のヒビはこれのプリセット。

## `useCelebrateBorder()` — 既存コンポーネントの境界線を装飾する

celebrate()のオーバーレイと違い、ref で渡した既存要素自身に直接作用する。DOM操作はフックの中に閉じ込められている（呼び出し側が生のDOM要素を掴んで操作する必要はない）。

```tsx
const { ref, celebrateBorder } = useCelebrateBorder<HTMLDivElement>();
<div ref={ref} onClick={() => celebrateBorder("neon")}>
  ...
</div>;

// Tier3：カタログの名前の代わりに生のプリセットを直接渡すこともできる
// （プリセット自身が mechanism を持っているので、celebrate(<ReactNode/>) と同じ感覚で渡せる）
celebrateBorder(neonPreset("#ff0000"));
celebrateBorder(spinPreset("#fff, #000"));
```

`BORDER_EFFECT_KINDS`（10種）は実質2機構＋単純なCSSクラス3種に集約されている。詳細は[API リファレンス](./api-reference.md#usecelebrateborder)参照。

## `useContainerModifier()` — 画面全体を揺らす/止める

`shake` / `hitstop` / `vignette`が使っているのと同じ、`<html>`へのクラス付け外し機構（ref カウント式）を直接使う。

```tsx
const trigger = useContainerModifier();
trigger({ className: "celebrate-shake-active", durationMs: 400 });
```

## `rollRewardTier()` — 可変比率の抽選ユーティリティ

celebrate()の内部には仕込まれていない、純粋関数の組み立て部品。

```ts
const tier = rollRewardTier([
  { chance: 0.7 },
  { chance: 0.25, with: ["confetti"] },
  { chance: 0.05, with: ["confetti", "sparkle", "ring"] },
]);
celebrate("stamp", { with: tier.with });
```
