# Shiftize

## Firebase のルール

rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
// ユーザーコレクションのルール
match /users/{userId} {
allow read: if request.auth != null; // 認証済みユーザーは読み取り可能
allow create: if request.auth != null; // 新規ユーザー作成は認証済みユーザーのみ
allow update: if request.auth != null &&
(request.auth.uid == userId || // 自分自身の情報
get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master"); // またはマスター権限
allow delete: if request.auth != null &&
get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master";
}

    // シフトコレクションのルール
    match /shifts/{shiftId} {
      allow read: if request.auth != null;  // 認証済みユーザーは読み取り可能
      allow create: if request.auth != null;  // 認証済みユーザーは作成可能
      allow update, delete: if request.auth != null &&
                          (resource.data.userId == request.auth.uid ||  // 自分のシフト
                           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master");  // またはマスター権限
    }

}
}

## 今後の追加要件

### 基本機能の改善

1. レスポンシブ対応の調整
2. 動作速度の向上
3. セキュリティ対策

### 新機能の追加

1. タスク管理機能
   - タスクの作成・編集・削除
   - タスクの完了状態管理
   - タスクの優先度設定
2. 金額計算機能
   - シフト時間による計算
   - タスクによる計算
   - 税金計算
3. ホーム画面の改善
   - キャッシュバージョンの表示
   - 通知一覧の表示
   - クイックアクションの追加
4. 通知機能の強化
   - シフト申請の通知
   - シフト変更の通知
   - タスク完了の通知

### 実装済み機能

- シフトのガントチャート表示機能
- ユーザー用のシフト追加機能
- ユーザー認証と権限管理
- マスターユーザー用のシフト追加機能
- シフト申請の承認フロー
- シフト変更の即時同期
- 通知機能の基本実装
- アクセスログと変更履歴の記録・管理
- PDF 出力機能の基本実装

## 多店舗対応の段階的実装方針

### 基本戦略

既存のアプリを壊すことなく、段階的に多店舗対応機能を追加する。

### 第 1 段階（現在）

- 従来通り「講師名 + ニックネーム」でのログイン
- 単一店舗での運用に集中
- 基本機能の完成度向上

### 第 2 段階（将来実装）

- **選択制ログイン方式の導入**
  - 従来方式：講師名 + ニックネーム（既存ユーザー継続利用可能）
  - 新方式：メールアドレス + パスワード（新規ユーザー向け）
- **データ構造の拡張**

  // 既存ユーザーデータはそのまま維持
  interface LegacyUser {
  teacherName: string;
  nickname: string;
  storeId: string;
  }

  // 新しいグローバルユーザー（段階的に追加）
  interface GlobalUser {
  email: string;
  uid: string;
  storesAccess: {
  [storeId: string]: {
  teacherName: string;
  nickname: string;
  role: "master" | "teacher";
  };
  };
  }

### 第 3 段階（多店舗対応完成）

- **メールユーザーの多店舗アクセス**
  - 1 つのメールアドレスで複数店舗に参加可能
  - 各店舗で異なる「講師名 + ニックネーム」設定
  - 店舗切り替え機能
- **UI/UX 改善**
  - ヘッダーに店舗切り替えボタン
  - 複数店舗のシフト並行表示オプション

### メリット

- 既存ユーザーへの影響なし
- データ移行不要
- 段階的な機能追加
- 後から多店舗対応を選択可能

### ネイティブアプリ化時の考慮事項

- 本格的な多店舗対応はネイティブ版で実装予定
- より高度なユーザー管理システム
- 店舗間データ連携機能の強化
