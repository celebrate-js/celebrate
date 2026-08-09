# カタログ（Tier1・25 variant）の妥当性根拠

このドキュメントは「なぜこの25個が入っていて、なぜこの並び順（[recipes.tsx](https://github.com/celebrate-js/celebrate/blob/main/src/recipes.tsx)の
8カテゴリ）なのか」に、実証（実際に使われていた）と理論（学術・実務のフレームワーク）の
両方から根拠を与える。カタログに追加・削除の判断をする際はここを更新すること。

## 実証されている4つ

`git log`で遡ると、`stamp` / `confetti` / `record` / `sparkle`の4つだけが
break_even_toolsからの実際の抽出元（[初回コミット](https://github.com/celebrate-js/celebrate/blob/main/CHANGELOG.md)）を持つ。
残り21 variantは本ライブラリの開発過程で追加された、理論に基づく先取り実装である。
「実証されている＝優れている」わけではなく、「実証されていない＝根拠がない」わけでもない
（後述の通り理論的根拠は別途ある）が、この違い自体は事実として記録しておく。

## 理論的根拠

### ゲーミフィケーション・行動理論

- **Octalysis（Yu-kai Chou）**：8つのコア動因（達成・所有・社会的影響・希少性など）でゲーム的要素を
  分類するフレームワーク。カタログの②達成／③報酬／④リアクションの区分はOctalysisの
  「達成」「報酬」動因にそれぞれ対応する。
- **可変比率強化（Skinner, variable-ratio reinforcement）**：予測不能な間隔の報酬が最も行動を
  強化するという古典的知見。`rewardTier.ts`の`rollRewardTier()`（可変報酬ヘルパー）はこれの直接実装。
- **自己決定理論／Self-Determination Theory（Deci & Ryan）**：有能感（competence）・自律性
  （autonomy）・関係性（relatedness）の3つが内発的動機付けを支える。「達成」を示す視覚的フィードバック
  （stamp/medal/bounce）は有能感を強化する具体策として位置づけられる。
- **Bartle's player types**：achiever/explorer/socializer/killerのプレイヤー類型論。
  リアクション系（heart/star/emoji）はsocializer向け、報酬系（confetti/firework）はachiever向け、
  という形でカタログの多様性を説明できる（単一のプレイヤー類型に最適化していない）。

### UI・マイクロインタラクション理論

- **Steve Swink『Game Feel』（"juice"理論）**：入力に対する即時的・過剰気味なフィードバックが
  操作の手応え（feel）を生む。①入力フィードバック（pop/ripple/checkmark）はjuiceの典型実装。
- **Dan Saffer『Microinteractions』**：Trigger/Rules/Feedback/Loops&Modesの4要素でマイクロ
  インタラクションを設計するフレームワーク。`celebrate()`の呼び出し（Trigger）→カタログの
  duration/haptic/sound（Rules）→視覚演出（Feedback）という対応がそのまま当てはまる。
- **Material Design motion guidelines**：モーションに正当性を持たせる4つの目的（階層の表現・
  フィードバック・状態変化・キャラクター性）。⑤キャラクター・ナラティブ（cracker/float）は
  4つ目の「キャラクター性」に対応し、単なる装飾ではなく指針上の正当な用途として扱える。
- **Don Norman『Emotional Design』**：visceral（本能的）・behavioral（行動）・reflective（内省）の
  3レベルで感情的デザインを評価する。カタログ全体は主にvisceral/behavioralレベルへの訴求であり、
  reflectiveレベル（長期的な自己イメージへの訴求）は本ライブラリのスコープ外と整理できる。
- **Venturi & Scott Brown「duck vs. decorated shed」**：形態が機能を語らない装飾＝"duck"（自己目的化した
  意匠）という建築批評の概念。カタログ選定時の判定基準として使った：「ある瞬間に何を伝えるか」という
  UX上の意味を持たない演出は"duck"であり除外すべき、という基準（実際には25個全てが後述の理論いずれかで
  意味を持つと判定され、除外された案はなかった）。

## 子ども向け研究（追加調査分）

ゲーミフィケーションは子ども向け文脈を持つことが多く、子どもは刺激への反応も顕著なため、
成人向け一般理論だけでなく子ども固有の研究も確認した。

- **注意：ADHD/思春期特有の神経科学的知見（腹側線条体の報酬感受性など）は幼児には直接一般化できない**。
  これはエビデンスの欠落として明示しておく（捏造ではなく、単に幼児対象の直接的な研究が少ない領域）。
- **Piagetの前操作期（preoperational stage）のアニミズム・象徴遊び**：幼児がキャラクター・擬人化に
  強く反応するという発達心理学の知見。⑤キャラクター・ナラティブ（cracker等の「粒ではなく1つの主体が
  動く」演出）を幼児向け文脈で支持する。
- **トークンエコノミー／ABA（応用行動分析）**と**Amaefule et al., BJET 2023**（子どもは絵文字
  フィードバックに19.4%速く反応する、という実証研究）：④リアクション（heart/star/emoji）を
  子ども向け文脈で特に支持する。
- **CCI（Child-Computer Interaction）ガイドライン**は、純粋に装飾的・テーマ的なアニメーションや
  感覚過多（sensory overload）を明確に警告している。この観点だけでは⑥環境演出
  （sakura/shake/hitstop/vignette/rain/lightning）は支持されない（教育アプリ文脈では過剰演出とみなされうる）。

## ゲームデザイン文脈（環境演出の最終的な根拠）

CCI（教育アプリ文脈）だけでは⑥環境演出を支持しきれなかったため、ゲームデザインの文脈を
追加で検討した。screen shake・vignette・weather effectsはゲーム開発における標準的な
"juice"/game-feel パターンであり、Swinkの理論の延長として正当化できる：

- `vignette`：低体力・危険状態を示す定番のUI表現（多くのアクションゲームで標準）。
- `lightning`：攻撃・スキル発動のVFXとして定番。
- `rain`：環境演出（atmosphere）。天候表現はゲームの没入感を支える一般的手法。
- `sakura`：季節演出。特に日本のゲームでは定番の季節表現。

この文脈により、CCIガイドラインが警告する「教育アプリでの過剰な装飾アニメーション」とは
異なる評価軸（ゲーム文脈での機能的な演出）で⑥環境演出の全variantを妥当と判定した。

## カテゴリと理論の対応表

| カテゴリ                  | variant                                      | 主な理論的根拠                                        |
| ------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| ①入力フィードバック       | pop/ripple/checkmark                         | Game Feel（juice）、Microinteractions（Feedback）     |
| ②達成                     | stamp/medal/bounce                           | Octalysis（達成動因）、SDT（有能感）                  |
| ③報酬                     | confetti/sparkle/record/flash/ring/firework  | Octalysis（報酬動因）、可変比率強化                   |
| ④リアクション             | heart/star/emoji                             | Bartle（socializer）、BJET 2023（絵文字への反応速度） |
| ⑤キャラクター・ナラティブ | cracker/float                                | Material Design（キャラクター性）、Piaget（象徴遊び） |
| ⑥環境演出                 | sakura/shake/hitstop/vignette/rain/lightning | Game Feel（juice）、ゲームデザインの定番パターン      |
| ⑦段階エフェクト           | shatter                                      | staged-sequence（構造分解メモ参照）                   |
| ⑧テキストチャネル         | popup                                        | Microinteractions（Feedback）                         |

関連：[構造分解メモ](./effect-structure-taxonomy.md)（実装の構造的な分類）、
[recipes.tsx](https://github.com/celebrate-js/celebrate/blob/main/src/recipes.tsx)（このカテゴリ分けの実装本体）。
