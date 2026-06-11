# ドリンク売上トラッカー（デモ）/ Drink Sales Tracker (Demo)

> 飲食店向けに開発したドリンク売上の記録・分析ツールの **公開用デモ版** です。
> 実店舗のデータ・連携先は含まれておらず、サンプルデータで動作します。

🔗 **デモを開く / Live demo:** https://t-fujiya-sd.github.io/portfolio/drink-tracker/

---

## 日本語

### これは何？
飲食店スタッフが、テーブル会計のレシートを撮影するだけでドリンク売上を記録・分析できるシングルファイルWebアプリです。営業中はスマホで、分析はPCで——という現場運用を想定して作りました。

### 主な機能
- **今日タブ**: テーブルごとの会計を記録。AI（Claude Vision）でレシート画像からドリンク内訳・人数・コースを自動抽出。1人あたりドリンク売上の目標達成率をリアルタイム表示。
- **具体施策カード**: 「ディナードリンク杯数」「おすすめドリンク出数」などの目標と実績を入力し、達成率を色分け表示。
- **レポートタブ**: 週次／月次／曜日別／期間指定で集計。1人あたりドリンク売上の推移をグラフ化。DR比率（ドリンク売上比率）・客単価・日別一覧を確認。
- **クロスデバイス同期**（任意）: Google Apps Script 経由で複数端末のデータを同期。

### 技術スタック
- フロントエンド: React 18（UMD版・ビルド不要）
- グラフ: 自前のSVGバーチャート（外部ライブラリ非依存）
- AI: Anthropic Claude API（Vision機能でレシート解析）
- データ保存: ブラウザの localStorage
- 構成: `index.html` 1ファイル完結

### このデモについて
- 起動時にサンプルデータ（直近35日分の売上＋本日のテーブル）を自動投入します。
- 画面上部の「データをリセット」でいつでも初期状態に戻せます（保存先は閲覧者のブラウザ内のみ）。
- 実店舗のGoogleシート連携URLは削除済みです。AIレシート解析を試すにはご自身のAnthropic APIキーが必要です（デモ閲覧自体には不要）。

---

## English

### What is this?
A single-file web app that lets restaurant staff log and analyze drink sales just by photographing receipts. Designed for real-world use: log on a phone during service, analyze on a PC afterward.

### Features
- **Today tab**: Log each table's bill. AI (Claude Vision) extracts drink line items, covers, and course from a receipt photo. Shows real-time progress toward the per-customer drink-sales goal.
- **Action cards**: Set targets and actuals for measures like "dinner drink count" or "recommended drink orders," with color-coded achievement rates.
- **Reports tab**: Aggregate by week / month / day-of-week / custom range. Charts the per-customer drink-sales trend; shows drink-ratio, average spend, and a daily breakdown table.
- **Cross-device sync** (optional): Sync data across devices via Google Apps Script.

### Tech stack
- Frontend: React 18 (UMD build, no build step)
- Charts: hand-rolled SVG bar charts (no charting library)
- AI: Anthropic Claude API (Vision for receipt parsing)
- Storage: browser localStorage
- Single `index.html` file

### About this demo
- Loads sample data on startup (last ~35 days of sales plus today's tables).
- Use "データをリセット" (Reset data) at the top to restore the initial state anytime. Data is stored only in the viewer's browser.
- The production Google Sheets sync URL has been removed. Trying the AI receipt parser requires your own Anthropic API key (not needed just to browse the demo).
