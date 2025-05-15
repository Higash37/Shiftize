# shift-scheduler-app

## firebase の rules

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

今後の機能追加予定(mvp 版)
・シフト PDF 出力機能
・申請機能及びガントチャート上での変更の firebase との即同期（最重要）／通知機能
・アクセスログ／変更履歴の記録と管理（最後かな）
・管理画面でのスタッフ追加・削除（2 番目に重要）
