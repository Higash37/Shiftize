# タスク管理機能 仕様書

## 概要

Shiftize のタスク管理機能は、店舗運営における日常業務を効率化するために設計されています。カンバン形式でのタスク管理とチャット形式のメモ機能を提供します。

## 機能構成

### 1. タスク管理システム

#### 1.1 タスクの基本情報

```typescript
interface NormalTask {
  id: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  createdBy: string;
  createdByName: string;
  storeId: string;
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  completedBy?: string;
  completedByName?: string;
  currentAssignedTo?: string;
  currentAssignedToName?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActionAt: Date;
  tags: string[];
  isPublic: boolean;
}
```

#### 1.2 タスクステータス

- **未実施 (not_started)**: 作成されたが開始されていないタスク
- **実施中 (in_progress)**: 現在進行中のタスク
- **完了 (completed)**: 完了したタスク

#### 1.3 優先度

- **低 (low)**: 緊急性の低いタスク
- **中 (medium)**: 通常の優先度のタスク
- **高 (high)**: 緊急性の高いタスク

### 2. カンバンボード

#### 2.1 表示構成

- 3 列のカンバン形式
- 各列にタスクカードを表示
- ドラッグ&ドロップでステータス変更（将来実装予定）

#### 2.2 タスクカード

```typescript
// タスクカードの表示項目
- タイトル
- 説明（3行まで）
- 作成者名
- 優先度（色分け）
- 作成日時
```

### 3. メモ機能

#### 3.1 メモの基本情報

```typescript
interface TaskMemo {
  id: string;
  text: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}
```

#### 3.2 チャット風 UI

- LINE 風のメッセージ表示
- アバター表示（名前の頭文字）
- 時間表示（相対時間）
- 文字数制限（200 文字）

## データベース設計

### 1. Firestore コレクション構造

#### NormalTasks コレクション

```javascript
// Document ID: 自動生成
{
  title: string,
  description: string,
  status: string,
  priority: string,
  createdBy: string,
  createdByName: string,
  storeId: string,
  dueDate: Timestamp | null,
  startDate: Timestamp | null,
  completedDate: Timestamp | null,
  completedBy: string | null,
  completedByName: string | null,
  currentAssignedTo: string | null,
  currentAssignedToName: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActionAt: Timestamp,
  tags: string[],
  isPublic: boolean
}
```

#### TaskMemos コレクション

```javascript
// Document ID: 自動生成
{
  taskId: string,
  content: string,
  authorId: string,
  authorName: string,
  createdAt: Timestamp
}
```

### 2. インデックス設定

#### NormalTasks

- `storeId` (ASC)
- `storeId` (ASC), `lastActionAt` (DESC)
- `storeId` (ASC), `status` (ASC)

#### TaskMemos

- `taskId` (ASC), `createdAt` (DESC)

## API 仕様

### 1. NormalTaskService

#### getTasks(storeId: string): Promise<NormalTask[]>

店舗のタスク一覧を取得

#### `createTask(taskData: TaskFormData, storeId: string, createdBy: string, createdByName: string): Promise<string>`

新しいタスクを作成

#### updateTaskStatus(taskId: string, status: TaskStatus, userId?: string, userName?: string): Promise\<void\>

タスクのステータスを更新

#### updateTask(taskId: string, updates: Partial\<NormalTask\>): Promise\<void\>

タスクを更新

#### deleteTask(taskId: string): Promise\<void\>

タスクを削除

#### watchTaskMemos(taskId: string, callback: (memos: TaskMemo[]) => void): () => void

タスクのメモをリアルタイム監視

#### createTaskMemo(taskId: string, content: string, authorId: string, authorName: string): Promise&lt;void&gt;

タスクメモを作成

#### watchTasks(storeId: string, callback: (tasks: NormalTask[]) => void): () => void

タスクリストをリアルタイム監視

## UI/UX 仕様

### 1. レスポンシブデザイン

- モバイル優先設計
- タブレット・デスクトップ対応
- タッチ操作最適化

### 2. カラーシステム

```typescript
const taskColors = {
  notStarted: "#6B7280", // グレー
  inProgress: "#F59E0B", // 黄色
  completed: "#10B981", // 緑
  priorityLow: "#6B7280", // グレー
  priorityMedium: "#F59E0B", // 黄色
  priorityHigh: "#EF4444", // 赤
};
```

### 3. アニメーション

- タスクカードのホバー効果
- ステータス変更時のスムーズな移動
- メモ追加時のフェードイン効果

## セキュリティ対策

### 1. Firebase Security Rules

```javascript
// NormalTasks コレクション
match /NormalTasks/{taskId} {
  allow read, write: if request.auth != null &&
    request.auth.uid in getUserStoreAccess(request.auth.uid, resource.data.storeId);
}

// TaskMemos コレクション
match /TaskMemos/{memoId} {
  allow read, write: if request.auth != null &&
    request.auth.uid in getUserStoreAccess(request.auth.uid, get(/databases/$(database)/documents/NormalTasks/$(resource.data.taskId)).data.storeId);
}
```

### 2. データ検証

- 入力値のサニタイズ
- 文字数制限の強制
- 権限チェック

## パフォーマンス最適化

### 1. データ取得の最適化

- 必要なデータのみ取得
- ページネーション（将来実装予定）
- キャッシュ機能

### 2. リアルタイム同期

- onSnapshot を使用した効率的な監視
- 不要なリスナーの適切な削除
- メモリリークの防止

## 今後の拡張計画

### 1. 高度なタスク管理

- サブタスク機能
- タスクテンプレート
- 定期タスクの自動生成
- タスクの依存関係

### 2. 協働機能

- タスクの割り当て
- メンション機能
- 通知システム
- 承認フロー

### 3. 分析機能

- タスク完了率の分析
- 所要時間の統計
- 効率性レポート
- 改善提案

## 運用ガイドライン

### 1. タスクの命名規則

- 動詞で始める（例：「在庫を確認する」）
- 具体的で分かりやすい名前
- 50 文字以内

### 2. 優先度の基準

- **高**: 1 日以内に完了が必要
- **中**: 1 週間以内に完了が必要
- **低**: 期限に余裕がある

### 3. メモの活用方法

- 進捗報告
- 問題点の共有
- 改善提案
- 引き継ぎ事項

## トラブルシューティング

### 1. よくある問題

#### タスクが表示されない

- storeId の確認
- 権限の確認
- ネットワーク接続の確認

#### メモが送信できない

- 文字数制限の確認
- 認証状態の確認
- Firebase 接続の確認

### 2. デバッグ方法

- ブラウザの開発者ツール
- Firebase Console
- ネットワークタブの確認

## 更新履歴

### v1.0.0 (2025 年 7 月)

- 基本的なタスク管理機能
- カンバン形式の表示
- チャット形式のメモ機能
- リアルタイム同期

### 今後の予定

- v1.1.0: 通知機能
- v1.2.0: 高度な検索・フィルタ
- v1.3.0: レポート機能
