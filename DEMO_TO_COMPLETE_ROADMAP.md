# シフトスケジューラー開発ロードマップ

## DEMO 版（現在のプロジェクト）

### 完成済み機能

- ✅ 基本的なシフト管理（作成、編集、削除、承認）
- ✅ ガントチャート表示（月単位）
- ✅ ユーザー管理（master/user 権限）
- ✅ Firebase 認証・Firestore 連携
- ✅ 給与計算機能
- ✅ 管理者給与を含むかどうかの切り替え機能
- ✅ シフトステータス管理（承認待ち、承認済み、拒否、完了）
- ✅ バッチ操作（一括承認、一括削除）
- ✅ PWA 対応

### DEMO 版として完成させるための残作業

- [ ] UI/UX の最終調整
- [ ] バグ修正・安定化
- [ ] README.md の更新
- [ ] デプロイ最適化
- [ ] パフォーマンステスト

## 完成版（新規プロジェクト）

### アーキテクチャ変更

- 🚀 8 桁 ID を用いた個人アカウントシステム
- 🚀 多店舗対応（ログインし直さずに切り替え・同時表示）
- 🚀 バックエンド API 化（Node.js/Express + Firebase Admin SDK）
- 🚀 ネイティブアプリ化（React Native Expo）

### 新機能・改善機能

#### 1. 認証・アカウント管理

- **8 桁 ID 個人アカウント**
  - ユニークな 8 桁 ID での個人識別
  - メールアドレス + 8 桁 ID でのログイン
  - アカウント間の切り替え機能

#### 2. 多店舗管理

- **店舗間切り替え**
  - ログインし直さずに店舗切り替え
  - 複数店舗の同時表示・管理
  - 店舗別権限管理

#### 3. ガントチャート大幅改善

- **横スクロール対応**

  - Google カレンダー風の操作感
  - 時間軸の可変設定（開始・終了時刻、間隔）
  - スムーズな横スクロール同期

- **行表示改善**
  - シフト行の 2 段分割（上：シフト、下：タスク）
  - 1 日ごとに全行まとめて表示
  - コンパクトなシフトカード表示

#### 4. 経営ダッシュボード強化

- **InfoDashboard 改善**
  - より詳細な売上・コスト分析
  - グラフ・チャート表示
  - 期間別比較機能

#### 5. 通知システム

- **リアルタイム通知**

  - シフト申請・承認通知
  - スケジュール変更通知
  - リマインダー機能

- **プッシュ通知**
  - ネイティブアプリでのプッシュ通知
  - 重要度別通知設定
  - 通知履歴管理

#### 6. ネイティブアプリ化

- **React Native Expo**
  - iOS/Android 対応
  - ネイティブ UI コンポーネント
  - オフライン対応

#### 7. バックエンド API 化

- **サーバーサイド処理**

  - Node.js/Express API
  - Firebase Admin SDK
  - セキュリティ強化

- **データベース最適化**
  - Firestore 設計見直し
  - インデックス最適化
  - バックアップ・復旧機能

#### 8. セキュリティ強化

- **権限管理**
  - より細かい権限設定
  - API 認証・認可
  - データ暗号化

#### 9. パフォーマンス最適化

- **フロントエンド**

  - 遅延読み込み
  - メモ化・最適化
  - バンドルサイズ削減

- **バックエンド**
  - キャッシュ機能
  - データベースクエリ最適化
  - CDN 活用

#### 10. 運用・保守機能

- **管理者機能**

  - システム設定管理
  - ユーザー管理
  - ログ・監査機能

- **バックアップ・復旧**
  - 自動バックアップ
  - データ移行機能
  - 災害復旧対応

## 開発フェーズ

### Phase 1: 基盤構築

1. プロジェクト構造設計
2. バックエンド API 設計・実装
3. 認証システム構築
4. データベース設計

### Phase 2: コア機能移植

1. DEMO 版機能の移植・改善
2. 多店舗対応実装
3. 新しいガントチャート実装
4. 通知システム構築

### Phase 3: ネイティブアプリ化

1. React Native Expo セットアップ
2. UI/UX ネイティブ対応
3. プッシュ通知実装
4. オフライン対応

### Phase 4: 最適化・リリース

1. パフォーマンス最適化
2. セキュリティ監査
3. テスト自動化
4. デプロイ・リリース

## 技術スタック（完成版）

### フロントエンド

- React Native Expo
- TypeScript
- React Navigation
- React Query/SWR
- Zustand/Redux Toolkit

### バックエンド

- Node.js + Express
- Firebase Admin SDK
- Firestore
- Firebase Cloud Functions
- Firebase Cloud Messaging

### インフラ

- Google Cloud Platform
- Firebase Hosting
- CDN (Cloudflare)
- GitHub Actions (CI/CD)

### 開発・運用

- ESLint + Prettier
- Jest + Testing Library
- GitHub + GitHub Projects
- Sentry (エラー監視)
- Analytics (Firebase Analytics)

## マイルストーン

### DEMO 版完成: 2025 年 7 月末

- 現在の機能を安定化
- ドキュメント整備
- デプロイ完了

### 完成版 Phase 1: 2025 年 9 月末

- バックエンド基盤完成
- 認証システム完成

### 完成版 Phase 2: 2025 年 11 月末

- コア機能移植完了
- 多店舗対応完成

### 完成版 Phase 3: 2026 年 1 月末

- ネイティブアプリ完成
- プッシュ通知完成

### 完成版リリース: 2026 年 3 月末

- 全機能完成
- 本格運用開始

---

## 注意事項

### DEMO 版 → 完成版移行時

1. **ディレクトリ全体をコピー**して新規プロジェクトとして開始
2. **段階的な移行**でリスクを最小化
3. **DEMO 版は並行保守**して安定運用を継続
4. **ユーザーフィードバック**を完成版に反映

### 開発優先度

1. **安定性** > 新機能
2. **ユーザビリティ** > 技術的複雑さ
3. **セキュリティ** > パフォーマンス
4. **保守性** > 開発速度
