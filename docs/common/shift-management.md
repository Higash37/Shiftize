# シフト管理システム仕様書

## 1. システム概要

### 1.1 システム構成

- フロントエンド：React Native/Expo
- バックエンド：Firebase (Authentication, Firestore) → firebase.ts にあります。
- データベース：Firebase Firestore

### 1.2 ユーザー権限

- マスター（管理者）
- 講師（一般ユーザー）

## 2. データモデル

### 2.1 ユーザー（users）

```typescript
interface User {
  id: string; // ユーザーID
  nickname: string; // ニックネーム
  role: "master" | "teacher"; // ロール
  email: string; // メールアドレス
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
  settings?: {
    // 設定
    notification: boolean; // 通知設定
    defaultShiftTime: string; // デフォルトシフト時間
  };
}
```

### 2.2 シフト（shifts）

```typescript
interface Shift {
  id: string; // シフトID
  userId: string; // ユーザーID
  date: string; // 日付（YYYY-MM-DD）
  startTime: string; // 開始時間（HH:mm）
  endTime: string; // 終了時間（HH:mm）
  hasClass: boolean; // 授業有無
  classes?: Array<{
    // 授業時間帯
    startTime: string;
    endTime: string;
  }>;
  status: "pending" | "approved" | "rejected" | "cancelled"; // ステータス
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
  createdBy: string; // 作成者ID
  updatedBy: string; // 更新者ID
}
```

## 3. 機能仕様

### 3.1 ログイン機能

- 教師 ID とパスワードによる認証
- ロールベースのアクセス制御
- セッション管理
- ログイン履歴の記録

### 3.2 シフト管理機能

#### 3.2.1 講師用機能

- シフトの追加・編集・削除
- シフト申請機能
- シフト変更履歴の確認
- シフトの共有機能

#### 3.2.2 マスター用機能

- シフト申請の承認
- シフトの自動調整
- スタッフの稼働状況の確認
- アクセスログの管理

### 3.3 ガントチャート機能

- 月単位のシフト表示
- シフトの重なり表示
- シフトのドラッグ＆ドロップ
- シフトのグループ化表示

## 4. UI/UX 仕様

### 4.1 色彩設計

- プライマリカラー：#007AFF
- セカンダリカラー：#5856D6
- エラーカラー：#FF3B30
- 成功カラー：#34C759

### 4.2 レイアウト

- カレンダーとシフトリストの両方表示
- レスポンシブデザイン
- タッチ操作の最適化

## 5. セキュリティ仕様

### 5.1 認証・認可

- Firebase Authentication
- ロールベースのアクセス制御
- セッションタイムアウト

### 5.2 データ保護

- 暗号化通信
- データのバックアップ
- アクセスログの記録

## 6. パフォーマンス仕様

### 6.1 ロード時間

- シフトデータの読み込み：2 秒以内
- ガントチャートの表示：1 秒以内
- シフト申請の処理：1 秒以内

### 6.2 メモリ使用量

- アプリ起動時：最大 100MB
- シフト表示時：最大 200MB

## 7. 保守性仕様

### 7.1 コード構造

- TypeScript による型定義
- モジュール化されたコンポーネント
- クリアな命名規則

### 7.2 テスト

- コンポーネントテスト
- API テスト
- インテグレーションテスト

## 8. 今後の拡張性

### 8.1 新機能

- シフトの自動調整機能
- モバイルアプリの改善
- AI によるシフト最適化

### 8.2 技術的改善

- パフォーマンス最適化
- セキュリティ強化
- ユーザー体験の向上
