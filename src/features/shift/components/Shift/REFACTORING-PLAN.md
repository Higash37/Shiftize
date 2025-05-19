# GanttChartMonthEdit.tsx ファイルのリファクタリング手順

## 問題点

- `GanttChartMonthEdit.tsx` が 1676 行と非常に長く、保守性が低下している
- 複数の関心事（モーダル、状態管理、イベントハンドラ、描画など）が 1 つのファイルに混在している

## リファクタリング計画

### 1. ユーティリティ関数の分離

- `utils/time-utils.ts` ファイルに以下の関数を移動：
  - `generateTimeOptions()` - 30 分ごとの時間選択リスト生成
  - `hourLabels` - 1 時間ごとのラベル
  - `halfHourLines` - 30 分ごとのライン
  - `timeToPosition()` - 時間文字列を位置に変換
  - `positionToTime()` - 位置を時間文字列に変換

### 2. モーダルコンポーネントの分離

- `modals/EditShiftModal.tsx` - シフト編集モーダル
- `modals/AddShiftModal.tsx` - シフト追加モーダル
- `modals/ClassTimeModal.tsx` - 授業時間設定モーダル
- `modals/ActionModal.tsx` - アクション選択モーダル

### 3. サブコンポーネントの分離

- `GanttChartGrid.tsx` - ガントチャートのグリッド部分
- `GanttChartHeader.tsx` - ガントチャートのヘッダー部分
- `MonthSelector.tsx` - 月選択部分

### 4. カスタムフックの作成

- `hooks/useShiftStatus.ts` - シフトステータス管理
- `hooks/useUsers.ts` - ユーザー情報取得
- `hooks/useShiftActions.ts` - シフト操作（追加、編集、削除）

### 5. 実装済みファイル

- `utils/time-utils.ts` - 時間関連ユーティリティ
- `modals/EditShiftModal.tsx` - シフト編集モーダル
- `modals/AddShiftModal.tsx` - シフト追加モーダル
- `modals/ClassTimeModal.tsx` - 授業時間設定モーダル
- `GanttChartGrid.tsx` - ガントチャートのグリッド部分

### 6. メインコンポーネントの修正

- 上記の分離したコンポーネントとフックを適切にインポートして使用する
- メインの GanttChartMonthEdit.tsx は、これらのコンポーネントを組み合わせる役割に特化する

### リファクタリング後の期待される効果

- 各ファイルの行数が大幅に減少し、可読性が向上
- 関心事の分離により、コードの保守性と再利用性が向上
- テストがしやすくなる
- バグの特定と修正が容易になる
- 機能追加が容易になる
