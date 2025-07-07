# Shiftize アプリケーション セキュリティ分析レポート

## 分析実施日: 2025年1月7日

---

## 🔒 現在のセキュリティ状況: **⚠️ 重要な問題あり**

### 📋 概要

Shiftize（React Native Expo + Firebase/Firestore）のセキュリティ状況を詳細に分析した結果、**重大なセキュリティ脆弱性**が発見されました。DEMO版から本格運用に移行する前に、これらの問題を必ず修正する必要があります。

---

## 🚨 重大な脆弱性（即座に修正が必要）

### 1. **Firestore セキュリティルールが危険（最重要）**

**現在のルール:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**問題点:**
- 認証されたユーザーなら**誰でも全てのデータに読み書き可能**
- 他のユーザーのシフト、個人情報、給与データに無制限アクセス
- データ削除、改ざんが容易

**影響度:** ⚠️ **最重要** - 個人情報漏洩、データ破壊のリスク

### 2. **権限管理システムの脆弱性（重要）**

**現在の実装:**
```typescript
// AuthContext.tsx
const userRole = user.email?.includes("master") ? "master" : "user";
```

**問題点:**
- メールアドレスに "master" を含むだけで管理者権限取得
- 例: `normaluser+master@gmail.com` で管理者になれる
- クライアントサイドでの権限判定は簡単にバイパス可能

**影響度:** 🔴 **重要** - 権限昇格、不正操作のリスク

### 3. **パスワード平文保存（重大）**

**現在の実装:**
```typescript
// firebase-auth.ts
userData.currentPassword = password; // 平文で保存
```

**問題点:**
- Firestoreにパスワードが平文で保存
- データベース漏洩時に全パスワードが露出
- Firebase Authenticationが提供するハッシュ化を無効化

**影響度:** 🔴 **重大** - パスワード漏洩、アカウント乗っ取りのリスク

---

## ⚠️ 中程度の脆弱性

### 4. **APIキーのクライアント露出**

**問題点:**
- Firebase設定が環境変数使用でも、ビルド時にクライアントに埋め込まれる
- `dist/` ファイルにAPIキーが平文で含まれる
- 本来はFirebaseクライアントAPIキーは公開前提だが、適切な制限が必要

**影響度:** 🟡 **中程度** - API乱用、コスト増大のリスク

### 5. **サーバーサイドファイル管理**

**確認事項:**
- `serviceAccountKey.json` の存在・管理状況
- サーバーサイド認証の実装状況
- 秘密鍵の適切な管理

**影響度:** 🟡 **中程度** - 管理者権限の不正利用リスク

---

## ✅ 適切に設定されている点

### 1. **gitignore設定**
- `.env*` ファイルが適切に除外
- `serviceAccountKey.json` が除外設定済み
- 環境変数ファイルの管理は適切

### 2. **Firebase Authentication基盤**
- Firebase Authenticationを使用（基本的なセキュリティは確保）
- HTTPS通信で暗号化済み
- セッション管理はFirebaseが担当

---

## 🛠️ 推奨修正事項

### 即座に実施すべき修正（重要度: 🔴 最重要）

#### 1. **Firestoreセキュリティルールの厳格化**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーコレクション - 自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // マスターユーザーは全てのユーザー情報を読み取り可能
      allow read: if request.auth != null && 
                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master";
    }
    
    // シフトコレクション - 権限ベースアクセス制御
    match /shifts/{shiftId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
                           (resource.data.userId == request.auth.uid || 
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master");
      allow delete: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master";
    }
  }
}
```

#### 2. **権限管理システムの改善**

```typescript
// Firestoreにユーザー情報を保存し、そこから権限を取得
const getUserRole = async (uid: string): Promise<"master" | "user"> => {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data().role || "user";
  }
  return "user";
};

// または Firebase Custom Claims を使用
const setCustomClaim = async (uid: string, role: string) => {
  // Cloud Functions で実装
  await admin.auth().setCustomUserClaims(uid, { role });
};
```

#### 3. **パスワード管理の修正**

```typescript
// パスワードをFirestoreに保存しない
const userData = {
  nickname: displayName,
  role: email.startsWith("master@") ? "master" : "user",
  email: email,
  createdAt: new Date(),
  // currentPassword フィールドを削除
};

// パスワード変更も Firebase Authentication のみに依存
const changePassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("ユーザーが認証されていません");
  
  // 再認証
  const credential = EmailAuthProvider.credential(user.email!, currentPassword);
  await reauthenticateWithCredential(user, credential);
  
  // パスワード更新（Firestoreには保存しない）
  await updatePassword(user, newPassword);
};
```

### 段階的に実施すべき改善（重要度: 🟡 中程度）

#### 1. **Firebase App Check の導入**

```typescript
// App Check でアプリの真正性を検証
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY!),
  isTokenAutoRefreshEnabled: true
});
```

#### 2. **監査ログの実装**

```typescript
// 重要な操作を記録
const logActivity = async (action: string, userId: string, details: any) => {
  await addDoc(collection(db, "audit_logs"), {
    action,
    userId,
    details,
    timestamp: serverTimestamp(),
    userAgent: navigator.userAgent,
  });
};
```

#### 3. **レート制限の実装**

```javascript
// Cloud Functions でレート制限
exports.rateLimitedFunction = functions
  .runWith({ 
    enforceAppCheck: true // App Check 必須
  })
  .https.onCall(async (data, context) => {
    // レート制限ロジック
  });
```

---

## 🔐 ベストプラクティス推奨事項

### 1. **多層防御戦略**
- Firestore Security Rules（第1層）
- App Check（第2層）
- Cloud Functions での検証（第3層）
- クライアント側バリデーション（最終層）

### 2. **セキュリティ監視**
```typescript
// 異常なアクセスパターンの検出
const monitorSuspiciousActivity = async () => {
  // 短時間での大量読み取り
  // 権限外データへのアクセス試行
  // 異常なデータ変更パターン
};
```

### 3. **定期的なセキュリティ監査**
- 月次でのアクセスログ確認
- 権限設定の定期見直し
- セキュリティルールのテスト実行

---

## 📋 修正スケジュール提案

### 即座に実施（1-2日以内）
1. ✅ Firestoreセキュリティルールの修正
2. ✅ パスワード平文保存の停止
3. ✅ 権限管理ロジックの修正

### 1週間以内に実施
1. 🟡 Firebase App Check の導入
2. 🟡 監査ログ機能の実装
3. 🟡 セキュリティテストの実施

### 1ヶ月以内に実施
1. 🔵 レート制限の実装
2. 🔵 セキュリティ監視ダッシュボード構築
3. 🔵 災害復旧計画の策定

---

## 💰 セキュリティ強化に伴うコスト影響

### Firestore 読み取りコスト
- セキュリティルールでの `get()` 呼び出しは課金対象
- 代替案: Firebase Custom Claims 使用でコスト削減

### App Check コスト
- 月10万リクエストまで無料
- 超過分: $1/1万リクエスト

---

## 🎯 結論

現在の Shiftize アプリは**重大なセキュリティ脆弱性**を抱えており、本格運用前に必ず修正が必要です。特に Firestore セキュリティルールとパスワード管理の問題は即座に対応すべきです。

適切な修正を行うことで、安全で信頼性の高いシフト管理アプリケーションとして運用できるようになります。

---

**⚠️ 注意: この分析は開発用途であり、実際のセキュリティ監査は専門機関に依頼することを推奨します。**