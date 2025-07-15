# デプロイメント手順書

## 概要

Shiftize アプリケーションを Vercel と Firebase を使用して本番環境にデプロイするための包括的な手順書です。

## 1. 事前準備

### 1.1 必要なアカウントとツール

- **Node.js**: v18.0.0 以上
- **npm/yarn**: 最新版

### 1.2 開発環境の確認

```bash
# Node.js バージョン確認
node --version

# npm バージョン確認
npm --version

# プロジェクトの依存関係インストール
npm install

# ビルドテスト
npm run build

# テスト実行
npm test
```

## 2. Firebase 設定

### 2.1 Firebase プロジェクト作成

1. Firebase Console にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名を入力 (例: `shiftize-production`)
4. Google Analytics の設定（必要に応じて）
5. プロジェクトの作成完了

### 2.2 Firebase アプリケーション設定

```bash
# Firebase CLI のインストール
npm install -g firebase-tools

# Firebase にログイン
firebase login

# Firebase プロジェクトの初期化
firebase init

# 以下のオプションを選択：
# ✓ Firestore: Configure security rules and indexes files
# ✓ Storage: Configure a security rules file for Cloud Storage
# ✓ Hosting: Configure files for Firebase Hosting
# ✓ Functions: Configure a Cloud Functions directory
```

### 2.3 Firebase 設定ファイル

#### firebase.json

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "functions": {
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  }
}
```

### 2.4 Firestore セキュリティルール

#### firestore.rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 共通関数
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function hasStoreAccess(storeId) {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/userStoreAccess/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/userStoreAccess/$(request.auth.uid)).data.storesAccess[storeId] != null;
    }

    function isMaster(storeId) {
      return hasStoreAccess(storeId) &&
             get(/databases/$(database)/documents/userStoreAccess/$(request.auth.uid)).data.storesAccess[storeId].role == 'master';
    }

    function isValidTaskData() {
      return request.resource.data.keys().hasAll(['title', 'status', 'storeId', 'createdBy', 'createdAt']) &&
             request.resource.data.title is string &&
             request.resource.data.title.size() > 0 &&
             request.resource.data.title.size() <= 100 &&
             request.resource.data.status in ['pending', 'in_progress', 'completed', 'cancelled'] &&
             request.resource.data.storeId is string &&
             request.resource.data.createdBy == request.auth.uid;
    }

    // ユーザー関連
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isValidUserData();

      function isValidUserData() {
        return request.resource.data.keys().hasAll(['uid', 'email', 'displayName']) &&
               request.resource.data.uid == request.auth.uid &&
               request.resource.data.email == request.auth.token.email;
      }
    }

    // 店舗アクセス管理
    match /userStoreAccess/{userId} {
      allow read: if isOwner(userId);
      allow write: if false; // 管理者が Functions 経由で管理
    }

    // 店舗設定
    match /stores/{storeId} {
      allow read: if hasStoreAccess(storeId);
      allow write: if isMaster(storeId) && isValidStoreData();

      function isValidStoreData() {
        return request.resource.data.keys().hasAll(['name', 'timezone']) &&
               request.resource.data.name is string &&
               request.resource.data.name.size() > 0 &&
               request.resource.data.name.size() <= 100;
      }
    }

    // タスク管理
    match /NormalTasks/{taskId} {
      allow read: if hasStoreAccess(resource.data.storeId);
      allow create: if hasStoreAccess(request.resource.data.storeId) && isValidTaskData();
      allow update: if hasStoreAccess(resource.data.storeId) &&
                      (isOwner(resource.data.createdBy) ||
                       request.auth.uid in resource.data.assignedTo ||
                       isMaster(resource.data.storeId)) &&
                      isValidTaskUpdate();
      allow delete: if hasStoreAccess(resource.data.storeId) &&
                      (isOwner(resource.data.createdBy) || isMaster(resource.data.storeId));

      function isValidTaskUpdate() {
        return request.resource.data.diff(resource.data).affectedKeys().hasOnly(['title', 'description', 'status', 'priority', 'assignedTo', 'tags', 'lastActionAt', 'lastActionBy', 'version']) &&
               request.resource.data.storeId == resource.data.storeId &&
               request.resource.data.createdBy == resource.data.createdBy &&
               request.resource.data.createdAt == resource.data.createdAt;
      }
    }

    // タスクメモ
    match /TaskMemos/{memoId} {
      allow read: if hasStoreAccess(
        get(/databases/$(database)/documents/NormalTasks/$(resource.data.taskId)).data.storeId
      );
      allow create: if hasStoreAccess(
        get(/databases/$(database)/documents/NormalTasks/$(request.resource.data.taskId)).data.storeId
      ) && isValidMemoData();
      allow update: if hasStoreAccess(
        get(/databases/$(database)/documents/NormalTasks/$(resource.data.taskId)).data.storeId
      ) && isOwner(resource.data.createdBy) && isValidMemoUpdate();
      allow delete: if hasStoreAccess(
        get(/databases/$(database)/documents/NormalTasks/$(resource.data.taskId)).data.storeId
      ) && (isOwner(resource.data.createdBy) || isMaster(
        get(/databases/$(database)/documents/NormalTasks/$(resource.data.taskId)).data.storeId
      ));

      function isValidMemoData() {
        return request.resource.data.keys().hasAll(['taskId', 'content', 'createdBy', 'createdAt']) &&
               request.resource.data.taskId is string &&
               request.resource.data.content is string &&
               request.resource.data.content.size() > 0 &&
               request.resource.data.content.size() <= 1000 &&
               request.resource.data.createdBy == request.auth.uid;
      }

      function isValidMemoUpdate() {
        return request.resource.data.diff(resource.data).affectedKeys().hasOnly(['content', 'updatedAt']) &&
               request.resource.data.taskId == resource.data.taskId &&
               request.resource.data.createdBy == resource.data.createdBy &&
               request.resource.data.createdAt == resource.data.createdAt;
      }
    }

    // シフト管理
    match /shifts/{shiftId} {
      allow read: if hasStoreAccess(resource.data.storeId);
      allow create: if hasStoreAccess(request.resource.data.storeId) && isValidShiftData();
      allow update: if hasStoreAccess(resource.data.storeId) &&
                      (isOwner(resource.data.userId) || isMaster(resource.data.storeId)) &&
                      isValidShiftUpdate();
      allow delete: if hasStoreAccess(resource.data.storeId) &&
                      (isOwner(resource.data.userId) || isMaster(resource.data.storeId));

      function isValidShiftData() {
        return request.resource.data.keys().hasAll(['storeId', 'userId', 'startTime', 'endTime', 'date']) &&
               request.resource.data.storeId is string &&
               request.resource.data.userId is string &&
               request.resource.data.startTime is timestamp &&
               request.resource.data.endTime is timestamp &&
               request.resource.data.date is timestamp &&
               request.resource.data.startTime < request.resource.data.endTime;
      }

      function isValidShiftUpdate() {
        return request.resource.data.diff(resource.data).affectedKeys().hasOnly(['startTime', 'endTime', 'position', 'notes', 'updatedAt']) &&
               request.resource.data.storeId == resource.data.storeId &&
               request.resource.data.userId == resource.data.userId &&
               request.resource.data.date == resource.data.date;
      }
    }

    // 監査ログ（読み取り専用）
    match /auditLogs/{logId} {
      allow read: if isMaster(resource.data.storeId);
      allow create: if false; // Functions 経由でのみ作成
      allow update, delete: if false;
    }

    // 通知
    match /notifications/{notificationId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if false; // Functions 経由でのみ作成
      allow update: if isOwner(resource.data.userId) &&
                      request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read', 'readAt']);
      allow delete: if isOwner(resource.data.userId);
    }
  }
}
```

### 2.5 Firestore インデックス

#### firestore.indexes.json

```json
{
  "indexes": [
    {
      "collectionGroup": "NormalTasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "storeId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "lastActionAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "NormalTasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "storeId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "assignedTo",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "lastActionAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "NormalTasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "storeId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdBy",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "TaskMemos",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "taskId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isDeleted",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "shifts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "storeId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "startTime",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "shifts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "storeId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "auditLogs",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "storeId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "read",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## 3. 環境変数設定

### 3.1 本番環境用の環境変数

#### .env.production

```env
# Firebase 設定
NEXT_PUBLIC_FIREBASE_API_KEY=your-production-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# アプリケーション設定
NEXT_PUBLIC_APP_NAME=Shiftize
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENVIRONMENT=production

# API設定
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# 分析・監視
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# 機能フラグ
NEXT_PUBLIC_FEATURE_REAL_TIME_UPDATES=true
NEXT_PUBLIC_FEATURE_NOTIFICATIONS=true
NEXT_PUBLIC_FEATURE_ANALYTICS=true
```

### 3.2 Vercel 環境変数設定

Vercel Dashboard で以下の環境変数を設定：

```bash
# Vercel CLI での設定例
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
```

## 4. ビルド設定

### 4.1 package.json スクリプト

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "build:analyze": "ANALYZE=true next build",
    "deploy:firebase": "firebase deploy --only firestore:rules,storage:rules",
    "deploy:vercel": "vercel --prod",
    "deploy:full": "npm run build && npm run deploy:firebase && npm run deploy:vercel"
  }
}
```

### 4.2 Next.js 設定

#### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Expo Web との互換性
  experimental: {
    forceSwcTransforms: true,
  },

  // 静的最適化
  trailingSlash: true,

  // 画像最適化
  images: {
    domains: ["firebasestorage.googleapis.com"],
    formats: ["image/webp", "image/avif"],
  },

  // PWA 設定
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com;",
          },
        ],
      },
    ];
  },

  // リダイレクト設定
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
        has: [
          {
            type: "cookie",
            key: "authenticated",
            value: "false",
          },
        ],
      },
    ];
  },

  // Bundle Analyzer
  ...(process.env.ANALYZE === "true" && {
    webpack: (config) => {
      config.plugins.push(
        new (require("@next/bundle-analyzer")({
          enabled: true,
        }))()
      );
      return config;
    },
  }),
};

module.exports = nextConfig;
```

## 5. Vercel デプロイ設定

### 5.1 vercel.json

```json
{
  "version": 2,
  "name": "shiftize-app",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_ENVIRONMENT": "production"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_ENVIRONMENT": "production"
    }
  },
  "functions": {
    "pages/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 5.2 GitHub Actions による自動デプロイ

#### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: |
            .next/
            public/

  deploy-firebase:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Deploy Firebase Rules
        run: |
          npm install -g firebase-tools
          firebase deploy --only firestore:rules,storage:rules --token ${{ secrets.FIREBASE_TOKEN }}

  deploy-vercel:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files

      - name: Deploy to Vercel
        uses: vercel/deploy-action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-args: "--prod"
```

## 6. デプロイ手順

### 6.1 手動デプロイ

```bash
# 1. 依存関係の確認
npm install

# 2. テストの実行
npm run test

# 3. 型チェック
npm run type-check

# 4. リンターの実行
npm run lint

# 5. ビルド
npm run build

# 6. Firebase ルールのデプロイ
firebase deploy --only firestore:rules,storage:rules

# 7. Vercel へのデプロイ
vercel --prod
```

### 6.2 自動デプロイ

```bash
# main ブランチにプッシュするだけで自動デプロイ
git add .
git commit -m "feat: ready for production deployment"
git push origin main
```

## 7. デプロイ後の確認

### 7.1 基本動作確認

```bash
# アプリケーションの応答確認
curl -I https://your-domain.com

# SSL証明書の確認
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# パフォーマンス測定
lighthouse https://your-domain.com --output=json
```

### 7.2 機能テスト

1. **認証機能**

   - ユーザー登録・ログイン
   - パスワードリセット
   - セッション管理

2. **タスク管理**

   - タスクの作成・更新・削除
   - リアルタイム同期
   - メモ機能

3. **シフト管理**

   - シフトの作成・編集
   - 月別表示
   - 権限管理

4. **レスポンシブデザイン**
   - モバイル表示
   - タブレット表示
   - デスクトップ表示

### 7.3 監視設定

#### Firebase Performance Monitoring

```typescript
// performance.ts
import { getPerformance } from "firebase/performance";
import { app } from "./firebase";

export const perf = getPerformance(app);

// カスタム トレース
export const startTrace = (name: string) => {
  return perf.trace(name);
};
```

#### Sentry エラー監視

```typescript
// sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## 8. 運用・保守

### 8.1 ログ監視

```bash
# Firebase Functions ログ
firebase functions:log --only yourFunction

# Vercel デプロイログ
vercel logs your-deployment-url

# リアルタイム監視
firebase functions:log --only yourFunction --follow
```

### 8.2 バックアップ

```bash
# Firestore データのエクスポート
gcloud firestore export gs://your-backup-bucket/$(date +%Y%m%d) --project=your-project-id

# 定期バックアップの設定（Cloud Scheduler）
gcloud scheduler jobs create http firestore-backup \
  --schedule="0 2 * * *" \
  --uri="https://your-backup-function-url" \
  --http-method=POST
```

### 8.3 セキュリティ監視

```bash
# Firebase Security Rules の監視
firebase firestore:rules:validate

# SSL証明書の期限確認
openssl s_client -connect your-domain.com:443 -servername your-domain.com 2>/dev/null | openssl x509 -noout -dates
```

## 9. トラブルシューティング

### 9.1 よくある問題

#### ビルドエラー

```bash
# 依存関係の問題
rm -rf node_modules package-lock.json
npm install

# TypeScript エラー
npx tsc --noEmit

# Next.js キャッシュクリア
rm -rf .next
npm run build
```

#### Firebase 接続エラー

```bash
# Firebase 設定確認
firebase projects:list

# 認証確認
firebase auth:export users.json --project your-project-id
```

#### Vercel デプロイエラー

```bash
# Vercel ログ確認
vercel logs

# 環境変数確認
vercel env ls

# 再デプロイ
vercel --prod --force
```

### 9.2 パフォーマンス最適化

```javascript
// Next.js Bundle Analyzer
npm run build:analyze

// 画像最適化
import Image from 'next/image';

// 動的インポート
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

## 10. 緊急時対応

### 10.1 ロールバック手順

```bash
# Vercel でのロールバック
vercel rollback https://your-deployment-url

# Firebase Rules のロールバック
firebase deploy --only firestore:rules --project your-project-id
```

### 10.2 緊急メンテナンス

```bash
# メンテナンスページの表示
vercel --prod --build-env MAINTENANCE_MODE=true

# サービス停止
firebase firestore:rules:disable --project your-project-id
```

このデプロイメント手順書により、安全で効率的な本番環境へのデプロイが可能になります。継続的インテグレーション・デプロイメント（CI/CD）により、開発チームの生産性向上と品質管理を両立できます。
