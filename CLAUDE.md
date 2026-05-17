# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build (outputs to dist/)
npm run preview    # Preview production build locally
npx tsc --noEmit   # Type-check without emitting
npm run lint       # ESLint
```

## Architecture

**Tech stack:** React 19 + TypeScript, Vite 8, Tailwind CSS v4 (via `@tailwindcss/vite` plugin), Framer Motion.

Tailwind is configured as a Vite plugin in `vite.config.ts` — there is no `tailwind.config.js`. The `@tailwind` directives live in `src/index.css`.

### Game engine (`src/engine/`)

Pure TypeScript, zero React dependencies. All state is immutable (functions return new objects).

| File | Responsibility |
|---|---|
| `types.ts` | All shared types: `PuyoColor`, `Cell`, `Board`, `PuyoPair`, `GameState`, board dimension constants |
| `board.ts` | Board mutations: `createBoard`, `placePuyo`, `applyGravity`, `findGroups` (flood-fill for chains), `markPopping`, `clearPopping` |
| `piece.ts` | Pair movement/rotation with wall kicks, `getSubPosition` (derives sub-puyo coord from rotation enum), `getGhostPosition` |
| `scoring.ts` | Official Puyo Puyo chain scoring formula (chain power × color bonus × group bonus tables) |

**Rotation model:** `PuyoPair.rotation` is `0|1|2|3` meaning up/right/down/left. The sub-puyo position is derived from the main position + rotation offset by `getSubPosition()`.

**Phase state machine** (in `useGame.ts`):
`idle → falling → locking → dropping → popping → dropping → … → idle | gameover`

Chain resolution cycles between `dropping` (gravity) and `popping` (mark + clear), re-entering via `checkChains` until no groups of 4+ remain.

### Hooks (`src/hooks/`)

- **`useGame.ts`** — `useReducer`-based game loop. Dispatches `TICK` on interval for gravity, `POP_TICK` after pop animation delay (500 ms), `GRAVITY_TICK` on interval during `dropping` phase. Exports action callbacks.
- **`useInput.ts`** — Keyboard handler with DAS (delayed auto-shift): 150 ms initial delay, 50 ms repeat. Handles `ArrowLeft/Right/Down`, `Space`/`ArrowUp` (hard drop), `Z`/`X`/`C` (rotate), `Escape` (reset).

### Components (`src/components/`)

- **`PuyoCell.tsx`** — Single puyo rendered as animated `framer-motion` circle. Ghost pieces use opacity + dashed border. Popping triggers a scale-out animation.
- **`Board.tsx`** — Renders `VISIBLE_HEIGHT` rows (skips row 0, the hidden spawn row). Overlays the active piece and ghost on top of board state.
- **`NextPanel.tsx`** — Preview widget for next/next-next pairs.
- **`ScorePanel.tsx`** — Score, level, chain count with animated chain flash.
- **`Overlay.tsx`** — Start screen and game-over screen rendered over the board via `AnimatePresence`.

---

## 要件定義 — ぷよぷよ

### 1. ゲーム概要

ブラウザ上で動作するシングルプレイヤーのぷよぷよ（落ちものパズル）ゲーム。  
モダンなUI/UXを重視し、アニメーションと視覚フィードバックで爽快感を演出する。

### 2. フィールド仕様

| 項目 | 値 |
|---|---|
| フィールド幅 | 6列 |
| フィールド高さ | 13行（うち1行は非表示の生成バッファ） |
| 表示高さ | 12行 |
| ぷよの色 | 赤・緑・青・黄・紫（5色） |
| おじゃまぷよ | あり（チェーン消去に隣接した場合のみ消える） |

### 3. ぷよペア（操作ピース）

- 常に2個1組のペアが上から降ってくる
- **軸ぷよ**（main）と**副ぷよ**（sub）の2つで構成
- 生成位置: 列2（0-indexed）、行1（バッファ行の直下）
- 回転方向: 0=上/1=右/2=下/3=左（`PuyoPair.rotation`）
- 副ぷよの位置は `getSubPosition()` で回転から一意に決定

### 4. 操作仕様

| 操作 | キー |
|---|---|
| 左移動 | `←` |
| 右移動 | `→` |
| ソフトドロップ | `↓` |
| ハードドロップ | `Space` / `↑` |
| 右回転 | `X` / `C` |
| 左回転 | `Z` |
| リセット | `Escape` |
| ゲーム開始 / 再スタート | `Enter` / `Space`（タイトル・ゲームオーバー画面） |

- **DAS（Delayed Auto Shift）**: 押しっぱなし時、150 ms 後に 50 ms 間隔で自動連続移動
- **壁蹴り**: 回転時にフィールド端や他のぷよに衝突する場合、左右±1〜±2列のキック補正を試みる

### 5. 落下・設置ロジック

- 重力インターバル: `max(100, 800 - (level - 1) × 60)` ms
- ペアが着地できない場合、即座にロック（`locking`フェーズへ遷移）
- ハードドロップは瞬時に最下点まで落下してロック

### 6. 消去・連鎖ロジック

1. ペア設置後、重力（`applyGravity`）を適用して宙に浮いたぷよを落下
2. 同色の4個以上が上下左右に連結しているグループを洪水充填法（flood-fill）で検出
3. 消去対象グループに**隣接するおじゃまぷよ**も同時に消去
4. ポップアニメーション（500 ms）→ セル削除 → 重力 → 再チェック のサイクルを連鎖が続く限り繰り返す
5. 連鎖が終了したら次のペアをスポーン

### 7. スコアリング

公式ぷよぷよスコア式を採用:

```
得点 = 消去ぷよ数 × 10 × max(1, 連鎖ボーナス + 色ボーナス + グループボーナス)
```

| ボーナス種別 | 内容 |
|---|---|
| 連鎖ボーナス | 1連鎖=0, 2=8, 3=16, 4=32 … （テーブル参照） |
| 色ボーナス | 消去に関与した色数 1=0, 2=3, 3=6, 4=12, 5=24 |
| グループボーナス | グループサイズ 4=0, 5=2, 6=3 … （テーブル参照） |

### 8. ゲームオーバー条件

- 新しいペアのスポーン時、軸ぷよまたは副ぷよの位置にすでにぷよが存在する場合

### 9. フェーズ状態機械

```
idle ──[start]──► falling ──[lock]──► dropping
                                         │
              ◄──[no groups]──┐     ◄──[gravity settled]──► check chains
              │               │                                   │
           spawn           gameover                     [groups found]
                                                               │
                                                           popping (500ms)
                                                               │
                                                           dropping
```

### 10. UI/UX要件

- **テーマ**: 深宇宙ダーク（`#060614` ベース）＋インディゴ系グロー
- **ぷよ外観**: グラジエント塗りの円形、ハイライト（光沢）＋カートゥーン風の目
- **ゴーストピース**: 半透明 + 破線ボーダーで着地予測位置を表示
- **ポップ演出**: スケールアウトアニメーション（Framer Motion）
- **チェーンフラッシュ**: 2連鎖以上で左パネルにチェーン数をアニメーション表示
- **スコア更新**: スコア変化時に数値がシアン色でスケールインするマイクロアニメーション
- **オーバーレイ**: スタート画面・ゲームオーバー画面をボード上にブラーオーバーレイで表示
- **レスポンシブ**: デスクトップ優先（現時点ではモバイルタッチ操作は対象外）

### 11. 非機能要件

- TypeScript strict モード準拠
- ゲームエンジン（`src/engine/`）はReact非依存の純粋関数で構成し、テスト容易性を確保
- すべてのボード操作は不変（新オブジェクトを返す）
- フレームレート低下を避けるため、アニメーションはCSSトランジション / Framer Motionに委譲し、`setInterval`内で直接DOMを操作しない
