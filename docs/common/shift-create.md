# シフト追加機能仕様書

## 1. 基本機能

### 1.1 シフト作成
- シフトの新規作成
- シフトの編集
- シフトの削除

### 1.2 シフトデータ構造
```typescript
interface Shift {
  id: string;          // シフトID
  userId: string;      // ユーザーID
  nickname: string;    // ニックネーム
  date: string;        // 日付（YYYY-MM-DD）
  startTime: string;   // 開始時間（HH:mm）
  endTime: string;     // 終了時間（HH:mm）
  type?: string;       // シフトタイプ
  subject?: string;    // 科目
  isCompleted?: boolean; // 完了フラグ
  status: ShiftStatus; // ステータス
  duration?: number;   // 時間（分）
  createdAt?: Date;    // 作成日時
  updatedAt?: Date;    // 更新日時
  requestedChanges?: Array<{
    startTime: string;
    endTime: string;
    status: ShiftStatus;
    requestedAt: Date;
  }>; // 変更履歴
}
```

### 1.3 シフトステータス
```typescript
type ShiftStatus =
  | "pending"          // 申請中
  | "approved"        // 承認済み
  | "rejected"        // 却下
  | "deletion_requested" // 削除申請
  | "deleted"         // 削除済み
  | "draft"           // 下書き
```

## 2. シフト作成フロー

### 2.1 シフト情報の入力
1. 日付の選択
2. 開始時間の選択
3. 終了時間の選択
4. 科目の選択（オプション）
5. シフトタイプの選択（オプション）

### 2.2 シフトの保存
- データのバリデーション
- Firebaseへの保存
- ステータスの設定（デフォルト：pending）
- タイムスタンプの記録

## 3. シフト編集

### 3.1 編集可能な項目
- 開始時間
- 終了時間
- 科目
- シフトタイプ

### 3.2 編集制限
- ステータスによる制限
  - pending: 編集可能
  - approved: 編集不可
  - rejected: 編集可能

## 4. シフト削除

### 4.1 削除フロー
1. 削除確認ダイアログの表示
2. ステータスの更新（deletion_requested）
3. マスターによる承認待ち

### 4.2 削除制限
- ステータスによる制限
  - pending: 直接削除可能
  - approved: 削除申請のみ
  - rejected: 直接削除可能

## 5. シフト申請

### 5.1 申請フロー
1. シフト作成
2. ステータス：pendingに設定
3. マスターへの通知
4. 承認待ち状態

### 5.2 申請状態の管理
- 申請中：pending
- 承認済み：approved
- 却下：rejected

## 6. シフト変更履歴

### 6.1 履歴データ
```typescript
interface ShiftChangeHistory {
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  requestedAt: Date;
}
```

### 6.2 履歴の記録
- シフト作成時
- シフト編集時
- シフト削除時
- ステータス変更時

## 7. エラーハンドリング

### 7.1 入力エラー
- 日付の範囲チェック
- 時間の重複チェック
- 必須項目の確認

### 7.2 システムエラー
- Firebase接続エラー
- データ保存エラー
- 権限エラー

## 8. 今後の拡張性

### 8.1 新機能
- シフトの自動調整
- 予定の重複チェック
- カレンダー連携

### 8.2 UI改善
- モバイル最適化
- タッチ操作の最適化
- パフォーマンス改善
