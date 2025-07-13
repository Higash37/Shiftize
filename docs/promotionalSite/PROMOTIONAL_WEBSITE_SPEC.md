# Shiftize 宣伝サイト仕様書

## プロジェクト概要

**目的**: シフトスケジューラーアプリ「Shiftize」の宣伝・ポートフォリオサイト  
**ターゲット**: 企業の採用担当者、潜在的ユーザー、開発者コミュニティ  
**開発者**: 大学生個人開発  
**制作期間**: 2-3 週間程度

## サイト構成

### 1. ランディングページ構成

```text
┌─ Header Navigation
├─ Hero Section
├─ Product Demo
├─ Features Showcase
├─ Technology Stack
├─ Development Story
├─ Live Demo/Download
├─ Developer Profile
└─ Footer/Contact
```

## 各セクション詳細仕様

### 🎯 Header Navigation

```text
Logo | Features | Technology | Demo | Developer | Contact;
```

- **スティッキーナビゲーション**
- **スムーススクロール**
- **モバイル対応ハンバーガーメニュー**

### 🚀 Hero Section

#### コピー例

```text
「大学生が作った本格SaaSアプリ」
Shiftize - エンタープライズ級シフト管理システム

React Native × Firebase で実現する
次世代のワークフォース管理
```

#### 要素

- アプリのメインスクリーンショット（モックアップ）
- キャッチコピー
- CTA ボタン（「デモを見る」「詳細を見る」）
- 技術スタックアイコン（React Native, Firebase, TypeScript 等）

### 📱 Product Demo Section

#### 動的コンテンツ

- **ガントチャートの動作 GIF/動画**
- **権限管理フローの説明**
- **リアルタイム同期のデモ**
- **PWA 機能のデモ**

#### レイアウト

```text
[スクリーンショット] | [機能説明テキスト]
[機能説明テキスト] | [スクリーンショット]
```

### ⭐ Features Showcase

#### 主要機能一覧

1. **シフト管理機能**

   - ガントチャート表示
   - ドラッグ&ドロップ操作
   - 月次・週次ビュー

2. **権限管理システム**

   - マスター/ユーザー権限分離
   - 承認フロー機能
   - セキュアな認証

3. **給与計算機能**

   - 自動計算システム
   - 税込み/税抜き切り替え
   - CSV 出力機能

4. **リアルタイム同期**

   - Firebase 連携
   - 即時データ反映
   - オフライン対応

5. **多店舗対応設計**
   - スケーラブルアーキテクチャ
   - 将来的な拡張性
   - 8 桁 ID 管理システム

### 🛠️ Technology Stack Section

#### 技術スタック詳細

##### Frontend

```typescript
React Native 0.73 + Expo 50
TypeScript (型安全性)
Material-UI (モダンデザイン)
Expo Router (ナビゲーション)
```

##### Backend

```typescript
Firebase Authentication
Cloud Firestore (NoSQL)
Firebase Admin SDK
Firestore Security Rules
```

##### Development & Deployment

```typescript
Vercel (Web Deploy)
PWA対応 (オフライン機能)
Android/iOS対応
Responsive Design
```

##### Tools & Libraries

```typescript
React Native Calendars
Draggable FlatList
Date-fns
bcrypt (暗号化)
```

### 📖 Development Story Section

#### ストーリーテリング

```markdown
## 大学生が挑んだ実務レベル開発

### 開発のきっかけ

「アルバイト先のシフト管理が非効率」という課題から始まった個人プロジェクト

### 技術選定の理由

- React Native: クロスプラットフォーム対応
- Firebase: スケーラブルなバックエンド
- TypeScript: 大規模開発での型安全性

### 開発期間と規模

- 開発期間: 6 ヶ月
- コード行数: 推定 20,000 行以上
- 実装機能数: 30 以上

### 学んだ技術

エンタープライズレベルの設計思想、
セキュリティ実装、UX 設計、
アーキテクチャ設計、プロジェクト管理
```

### 🎮 Live Demo Section

#### デモ提供方法

1. **Web デモ**: Vercel デプロイ版へのリンク
2. **動画デモ**: 主要機能の操作動画
3. **スクリーンショット集**: 各画面のキャプチャ
4. **APK ダウンロード**: Android 版（オプション）

### 👨‍💻 Developer Profile Section

#### プロフィール構成

```text
写真 | 自己紹介
     | スキルセット
     | 学習歴
     | 今後の目標
```

#### アピールポイント

- 大学生でありながら実務レベルの開発力
- 自主学習による技術習得
- 問題解決能力とやり抜く力
- フルスタック開発経験

## デザイン方針

### 🎨 デザインテーマ

- **モダン**: 最新の Web デザイントレンド
- **プロフェッショナル**: 企業向けの信頼感
- **クリーン**: 情報の見やすさ重視
- **技術的**: 開発者としての専門性アピール

### 🎯 カラーパレット

```css
Primary: #2196F3 (Blue - 技術系)
Secondary: #4CAF50 (Green - 成功・成長)
Accent: #FF9800 (Orange - 情熱・エネルギー)
Text: #333333 (Dark Gray)
Background: #FFFFFF, #F5F5F5
```

### 📱 レスポンシブ対応

- **Desktop**: 1200px 以上
- **Tablet**: 768px - 1199px
- **Mobile**: 767px 以下

## 技術実装方針

### 🛠️ 推奨技術スタック

#### Option A: React + Next.js

```typescript
Next.js 14 (App Router)
TypeScript
Tailwind CSS
Framer Motion (アニメーション)
```

#### Option B: 静的サイト

```typescript
HTML5 + CSS3 + JavaScript
AOS (Animate On Scroll)
Bootstrap 5
```

### 📊 パフォーマンス目標

- **Lighthouse Score**: 90 点以上
- **First Contentful Paint**: 1.5 秒以下
- **Largest Contentful Paint**: 2.5 秒以下

## コンテンツ制作

### 📝 必要な素材

#### テキストコンテンツ

- [ ] キャッチコピー
- [ ] 機能説明文
- [ ] 開発ストーリー
- [ ] 技術解説

#### ビジュアルコンテンツ

- [ ] アプリスクリーンショット（10-15 枚）
- [ ] 操作動画（2-3 分）
- [ ] 技術スタックアイコン
- [ ] 開発者写真
- [ ] モックアップ画像

#### インタラクティブコンテンツ

- [ ] ライブデモリンク
- [ ] GitHub リポジトリ（public 化）
- [ ] 操作説明 GIF

## SEO・マーケティング戦略

### 🔍 SEO 対策

#### ターゲットキーワード

- "大学生 個人開発"
- "React Native シフト管理"
- "Firebase アプリ開発"
- "TypeScript 個人プロジェクト"

#### メタデータ

```html
<title>Shiftize - 大学生が作った本格シフト管理SaaSアプリ</title>
<description
  >React
  Native×Firebaseで開発したエンタープライズ級シフト管理システム。個人開発でありながら実務レベルの機能を実装。</description
>
```

### 📢 拡散戦略

1. **GitHub**: README にサイトリンク
2. **LinkedIn**: 開発ストーリー投稿
3. **Qiita/Zenn**: 技術記事執筆
4. **Twitter**: 開発過程のシェア

## スケジュール

### 📅 制作スケジュール（3 週間）

#### Week 1: 設計・準備

- [ ] ワイヤーフレーム作成
- [ ] デザインモックアップ
- [ ] コンテンツライティング
- [ ] 素材収集・編集

#### Week 2: 開発

- [ ] 基本レイアウト実装
- [ ] 各セクション実装
- [ ] レスポンシブ対応
- [ ] アニメーション実装

#### Week 3: 最適化・公開

- [ ] パフォーマンス最適化
- [ ] SEO 対策実装
- [ ] テスト・デバッグ
- [ ] デプロイ・公開

## 成功指標

### 📈 KPI 設定

- **アクセス数**: 月間 500PV 以上
- **滞在時間**: 平均 2 分以上
- **GitHub Star**: 50 以上
- **採用面接**: 5 社以上からの反応

### 🎯 長期目標

- ポートフォリオとしての差別化
- 技術力の対外的アピール
- 就職活動での優位性確保
- 開発者コミュニティでの認知度向上

---

## 備考

このサイトは単なる宣伝サイトではなく、「大学生の技術力を証明するポートフォリオサイト」として位置づけ、採用担当者や技術者に強いインパクトを与えることを最優先とする。

### 制作条件

- **制作予算**: 0 円（全て無料ツール・サービス活用）
- **メンテナンス**: 月 1 回の更新・改善
- **効果測定**: Google Analytics 導入
