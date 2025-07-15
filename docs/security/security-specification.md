# セキュリティ対策仕様書

## 概要

Shiftize アプリケーションのセキュリティ対策について包括的に説明します。Firebase Firestore を使用した Web アプリケーションとして、認証・認可・データ保護・脆弱性対策を実装しています。

## 1. 認証システム

### 1.1 Firebase Authentication

```typescript
// 認証設定
const auth = getAuth(app);
const user = auth.currentUser;
```

### 1.2 認証フロー

#### レガシーユーザー（講師名 + ニックネーム）

```typescript
interface LegacyUser {
  teacherName: string;
  nickname: string;
  storeId: string;
  role: "master" | "teacher";
}
```

#### 新規ユーザー（将来実装予定）

```typescript
interface EmailUser {
  email: string;
  password: string;
  uid: string;
  storesAccess: {
    [storeId: string]: {
      teacherName: string;
      nickname: string;
      role: "master" | "teacher";
    };
  };
}
```

### 1.3 セッション管理

- Firebase Auth の自動セッション管理
- トークンの自動更新
- 適切なログアウト処理

## 2. 認可システム

### 2.1 ロールベースアクセス制御（RBAC）

#### 権限レベル

```typescript
enum Role {
  MASTER = "master", // 店舗管理者
  TEACHER = "teacher", // 講師
}

interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
}
```

#### 権限マトリックス

| リソース     | Master | Teacher |
| ------------ | ------ | ------- |
| 自分のシフト | CRUD   | CRUD    |
| 他人のシフト | CRUD   | R       |
| タスク       | CRUD   | CRUD    |
| ユーザー管理 | CRUD   | R       |
| 店舗設定     | CRUD   | -       |

### 2.2 多店舗対応認可

```typescript
interface StoreAccess {
  userId: string;
  currentStoreId: string;
  storesAccess: {
    [storeId: string]: {
      teacherName: string;
      nickname: string;
      role: Role;
      isActive: boolean;
    };
  };
}
```

## 3. Firebase Security Rules

### 3.1 基本ルール構造

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 共通関数
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.role;
    }

    function hasStoreAccess(userId, storeId) {
      let user = get(/databases/$(database)/documents/users/$(userId)).data;
      return user.storeId == storeId ||
             (user.connectedStores != null &&
              storeId in user.connectedStores);
    }
  }
}
```

### 3.2 ユーザーコレクション

```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && request.auth.uid == userId;
  allow update: if isAuthenticated() &&
                  (request.auth.uid == userId ||
                   getUserRole(request.auth.uid) == 'master');
  allow delete: if isAuthenticated() &&
                  getUserRole(request.auth.uid) == 'master';
}
```

### 3.3 シフトコレクション

```javascript
match /shifts/{shiftId} {
  allow read: if isAuthenticated() &&
                hasStoreAccess(request.auth.uid, resource.data.storeId);
  allow create: if isAuthenticated() &&
                  hasStoreAccess(request.auth.uid, request.resource.data.storeId);
  allow update: if isAuthenticated() &&
                  (request.auth.uid == resource.data.userId ||
                   getUserRole(request.auth.uid) == 'master') &&
                  hasStoreAccess(request.auth.uid, resource.data.storeId);
  allow delete: if isAuthenticated() &&
                  getUserRole(request.auth.uid) == 'master' &&
                  hasStoreAccess(request.auth.uid, resource.data.storeId);
}
```

### 3.4 タスクコレクション

```javascript
match /NormalTasks/{taskId} {
  allow read: if isAuthenticated() &&
                hasStoreAccess(request.auth.uid, resource.data.storeId);
  allow write: if isAuthenticated() &&
                 hasStoreAccess(request.auth.uid, resource.data.storeId);
}

match /TaskMemos/{memoId} {
  allow read: if isAuthenticated() &&
                hasStoreAccess(request.auth.uid,
                  get(/databases/$(database)/documents/NormalTasks/$(resource.data.taskId)).data.storeId);
  allow write: if isAuthenticated() &&
                 hasStoreAccess(request.auth.uid,
                   get(/databases/$(database)/documents/NormalTasks/$(resource.data.taskId)).data.storeId);
}
```

## 4. データ保護

### 4.1 データ暗号化

#### 転送時の暗号化

- HTTPS/TLS 1.3 通信
- Firebase SDK による自動暗号化
- WebSocket Secure (WSS)

#### 保存時の暗号化

- Firebase Firestore の自動暗号化
- 機密データの追加暗号化（必要に応じて）

```typescript
// 機密データの暗号化例（将来実装予定）
import CryptoJS from "crypto-js";

const encryptSensitiveData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, process.env.ENCRYPTION_KEY).toString();
};

const decryptSensitiveData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### 4.2 データサニタイズ

```typescript
// 入力値のサニタイズ
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // HTML タグの除去
    .replace(/javascript:/gi, "") // JavaScript URL の除去
    .replace(/on\w+=/gi, "") // イベントハンドラーの除去
    .trim()
    .substring(0, 1000); // 最大文字数制限
};

// タスク作成時のサニタイズ
const createTask = async (taskData: TaskFormData) => {
  const sanitizedData = {
    ...taskData,
    title: sanitizeInput(taskData.title),
    description: sanitizeInput(taskData.description),
  };

  return await normalTaskService.createTask(
    sanitizedData,
    storeId,
    userId,
    userName
  );
};
```

## 5. 脆弱性対策

### 5.1 XSS（Cross-Site Scripting）対策

```typescript
// React の自動エスケープ + 追加対策
const SafeText: React.FC<{ text: string }> = ({ text }) => {
  const sanitizedText = useMemo(() => {
    return text.replace(/[<>]/g, "");
  }, [text]);

  return <span>{sanitizedText}</span>;
};

// HTML の挿入を避ける
const TaskDescription: React.FC<{ description: string }> = ({
  description,
}) => {
  return <Text>{description}</Text>; // innerHTML は使用しない
};
```

### 5.2 CSRF（Cross-Site Request Forgery）対策

```typescript
// Firebase の自動 CSRF 保護
// + カスタムトークン検証
const validateRequest = async (request: Request) => {
  const token = await getIdToken(auth.currentUser);
  const decodedToken = await verifyIdToken(token);

  if (!decodedToken.uid) {
    throw new Error("Invalid token");
  }

  return decodedToken;
};
```

### 5.3 インジェクション攻撃対策

```typescript
// Firestore クエリでの安全な値の使用
const getTasks = async (storeId: string) => {
  // パラメータ化クエリの使用
  const q = query(
    collection(db, "NormalTasks"),
    where("storeId", "==", storeId) // 直接文字列連結は行わない
  );

  return await getDocs(q);
};
```

## 6. 監査とログ

### 6.1 セキュリティログ

```typescript
interface SecurityLog {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  result: "success" | "failure";
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
}

const logSecurityEvent = async (event: SecurityLog) => {
  await addDoc(collection(db, "securityLogs"), {
    ...event,
    timestamp: Timestamp.now(),
  });
};
```

### 6.2 監査ログ

```typescript
// 重要な操作のログ記録
const auditLog = async (action: string, details: any) => {
  await addDoc(collection(db, "auditLogs"), {
    action,
    details,
    userId: auth.currentUser?.uid,
    timestamp: Timestamp.now(),
  });
};

// 使用例
await auditLog("task_created", { taskId: newTask.id, storeId });
await auditLog("user_role_changed", { targetUserId, newRole });
```

## 7. 環境変数とシークレット管理

### 7.1 環境変数の分離

```typescript
// .env.local（本番環境）
NEXT_PUBLIC_FIREBASE_API_KEY = 本番用APIキー;
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 本番用ドメイン;
FIREBASE_ADMIN_SDK_KEY = 本番用管理者キー;

// .env.development（開発環境）
NEXT_PUBLIC_FIREBASE_API_KEY = 開発用APIキー;
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 開発用ドメイン;
FIREBASE_ADMIN_SDK_KEY = 開発用管理者キー;
```

### 7.2 シークレット管理

```typescript
// 機密情報の管理
const getSecretValue = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// 使用例
const apiKey = getSecretValue("NEXT_PUBLIC_FIREBASE_API_KEY");
```

## 8. セキュリティテスト

### 8.1 自動テスト

```typescript
// セキュリティテストの例
describe("Security Tests", () => {
  it("should reject unauthorized access", async () => {
    const unauthorizedRequest = () => getTasks("unauthorized-store-id");
    await expect(unauthorizedRequest()).rejects.toThrow("Unauthorized");
  });

  it("should sanitize input data", () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain("<script>");
  });
});
```

### 8.2 手動テスト

#### チェックリスト

- [ ] 認証なしでのアクセス拒否
- [ ] 権限外のデータアクセス拒否
- [ ] XSS 攻撃の防止
- [ ] CSRF 攻撃の防止
- [ ] SQL インジェクションの防止
- [ ] ファイルアップロードの安全性

## 9. インシデント対応

### 9.1 セキュリティインシデント対応手順

1. **検知**

   - 異常なアクセスパターンの監視
   - エラーログの分析
   - ユーザーからの報告

2. **評価**

   - 影響範囲の特定
   - 重要度の評価
   - 対応優先度の決定

3. **対応**

   - 即座の脅威の無効化
   - 影響を受けたユーザーへの通知
   - システムの修復

4. **復旧**
   - システムの正常化
   - 追加の監視体制
   - 再発防止策の実装

### 9.2 緊急時の連絡体制

```typescript
interface EmergencyContact {
  role: string;
  name: string;
  email: string;
  phone: string;
  priority: number;
}

const emergencyContacts: EmergencyContact[] = [
  {
    role: "Security Lead",
    name: "セキュリティ責任者",
    email: "security@example.com",
    phone: "080-0000-0000",
    priority: 1,
  },
  // ... 他の連絡先
];
```

## 10. 継続的なセキュリティ改善

### 10.1 定期的なセキュリティレビュー

- 月次セキュリティレビュー
- 依存関係の脆弱性チェック
- セキュリティルールの見直し
- ログの分析と改善

### 10.2 セキュリティアップデート

```typescript
// 依存関係の定期更新
npm audit fix
npm update

// セキュリティパッチの適用
npm install package-name@latest
```

### 10.3 セキュリティ意識の向上

- 開発チームへのセキュリティ教育
- セキュリティベストプラクティスの共有
- 定期的なセキュリティトレーニング

## 11. コンプライアンス

### 11.1 個人情報保護法対応

- 個人情報の適切な取得・利用
- 第三者提供の制限
- 個人情報の安全管理

### 11.2 GDPR 対応（将来の国際展開時）

- データ主体の権利保護
- プライバシーバイデザイン
- データ処理の透明性

## 12. まとめ

このセキュリティ対策仕様書は、Shiftize アプリケーションの包括的なセキュリティ対策を定義しています。継続的な改善と定期的な見直しを行い、最新の脅威に対応できるセキュリティ体制を維持します。

## 更新履歴

### v1.0.0 (2025 年 7 月)

- 初版作成
- 基本的なセキュリティ対策の実装
- Firebase Security Rules の設定

### 今後の予定

- v1.1.0: 高度な脅威検知システム
- v1.2.0: 自動化されたセキュリティテスト
- v1.3.0: コンプライアンス対応の強化
