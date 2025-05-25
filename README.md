# shift-scheduler-app

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
4. タスク管理機能
   - タスクの作成・編集・削除
   - タスクの完了状態管理
   - タスクの優先度設定
5. 金額計算機能
   - シフト時間による計算
   - タスクによる計算
   - 税金計算
6. ホーム画面の改善
   - キャッシュバージョンの表示
   - 通知一覧の表示
   - クイックアクションの追加
7. 通知機能の強化
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
- PDF出力機能の基本実装
