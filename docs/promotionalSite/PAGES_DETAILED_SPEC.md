# 宣伝サイト - ページ別詳細仕様書

## 目次

1. [Header Navigation](#1-header-navigation)
2. [Hero Section](#2-hero-section)
3. [Product Demo Section](#3-product-demo-section)
4. [Features Showcase](#4-features-showcase)
5. [Technology Stack](#5-technology-stack)
6. [Development Story](#6-development-story)
7. [Live Demo](#7-live-demo)
8. [Developer Profile](#8-developer-profile)
9. [Footer](#9-footer)

---

## 1. Header Navigation

### 1.1 現在のアプリ構造から抽出

**現在のアプリのナビゲーション:**

- Master 用: ホーム | インフォ | 今月のシフト | シフト追加 | 来月シフト作成 | ユーザー管理 | 設定
- User 用: ホーム | インフォ | シフト管理

### 1.2 宣伝サイト用ナビゲーション設計

```typescript
interface NavigationItem {
  label: string;
  href: string;
  description: string;
}

const navigation: NavigationItem[] = [
  { label: "Features", href: "#features", description: "機能紹介" },
  { label: "Technology", href: "#tech", description: "技術スタック" },
  { label: "Demo", href: "#demo", description: "ライブデモ" },
  { label: "Story", href: "#story", description: "開発ストーリー" },
  { label: "Developer", href: "#developer", description: "開発者紹介" },
  { label: "Contact", href: "#contact", description: "お問い合わせ" },
];
```

### 1.3 実装要件

**デスクトップ:**

- 固定ヘッダー（スクロール時も表示）
- ホバーエフェクト付きメニュー
- スムーススクロール実装

**モバイル:**

- ハンバーガーメニュー
- フルスクリーンオーバーレイ
- タッチフレンドリーなボタンサイズ

**追加機能:**

- 現在位置ハイライト（スクロール連動）
- Logo click で最上部に戻る
- GitHub・LinkedIn 等の外部リンク

---

## 2. Hero Section

### 2.1 現在のアプリの特徴を活用

**アプリの主要価値提案:**

- エンタープライズ級のシフト管理
- React Native + Firebase の技術力
- 大学生個人開発としての希少性
- リアルタイム同期・権限管理実装

### 2.2 Hero Section 構成

```typescript
interface HeroContent {
  mainHeading: string;
  subHeading: string;
  description: string;
  ctaButtons: CTAButton[];
  heroImage: string;
  techIcons: TechIcon[];
}

const heroContent: HeroContent = {
  mainHeading: "大学生が作った本格SaaSアプリ",
  subHeading: "Shiftize - エンタープライズ級シフト管理システム",
  description:
    "React Native × Firebase で実現する次世代のワークフォース管理。個人開発でありながら実務レベルの機能を実装。",
  ctaButtons: [
    { text: "ライブデモを見る", href: "#demo", style: "primary" },
    { text: "技術詳細を見る", href: "#tech", style: "secondary" },
  ],
  heroImage: "app-mockup-main.png",
  techIcons: ["react-native", "firebase", "typescript", "expo"],
};
```

### 2.3 実装要件

**ビジュアル要素:**

- アプリのメインスクリーンショット（ガントチャート画面）
- 技術スタックアイコンのアニメーション
- グラデーション背景（ブランドカラー使用）

**インタラクション:**

- フェードインアニメーション
- タイピングエフェクト（メインテキスト）
- CTA ボタンのホバーエフェクト

**レスポンシブ:**

- モバイル: 縦積みレイアウト
- タブレット: 2 カラムレイアウト
- デスクトップ: 2 カラム+余白最適化

---

## 3. Product Demo Section

### 3.1 現在のアプリ機能マッピング

**デモ対象機能（実装済み）:**

1. **ガントチャート表示**

   - 月次ビューでの全スタッフシフト表示
   - ドラッグ&ドロップでのシフト編集
   - リアルタイム更新機能

2. **権限管理システム**

   - Master/User 権限分離
   - シフト申請・承認フロー
   - セキュアな認証システム

3. **給与計算機能**

   - 時給・シフト時間による自動計算
   - 税込み/税抜き切り替え
   - 管理者給与含有フラグ

4. **PWA 機能**
   - オフライン対応
   - プッシュ通知
   - ネイティブアプリライクな操作感

### 3.2 デモコンテンツ設計

```typescript
interface DemoSection {
  title: string;
  description: string;
  media: {
    type: "video" | "gif" | "image";
    src: string;
    alt: string;
  };
  features: string[];
}

const demoSections: DemoSection[] = [
  {
    title: "直感的なガントチャート操作",
    description:
      "ドラッグ&ドロップでシフトを直感的に編集。リアルタイムで全員のシフトが同期されます。",
    media: {
      type: "gif",
      src: "gantt-demo.gif",
      alt: "ガントチャート操作デモ",
    },
    features: [
      "ドラッグ&ドロップ操作",
      "リアルタイム同期",
      "月次・週次ビュー切り替え",
      "シフト重複チェック",
    ],
  },
  {
    title: "強力な権限管理システム",
    description:
      "Master/User権限で適切なアクセス制御。承認フローで確実なシフト管理を実現。",
    media: { type: "video", src: "auth-demo.mp4", alt: "権限管理デモ" },
    features: [
      "役割ベースアクセス制御",
      "シフト申請・承認フロー",
      "セキュアな認証",
      "監査ログ機能",
    ],
  },
];
```

### 3.3 実装要件

**メディアコンテンツ:**

- 操作動画（30 秒以内、音声なし）
- 機能説明 GIF（ループ再生）
- インタラクティブスクリーンショット

**レイアウト:**

- 左右交互配置（Zigzag レイアウト）
- パララックス効果
- スクロール連動アニメーション

---

## 4. Features Showcase

### 4.1 現在のアプリ機能一覧（実装済み）

**シフト管理コア機能:**

- シフト作成・編集・削除
- ガントチャート表示
- カレンダービュー
- シフト申請・承認システム
- バッチ操作（一括承認・削除）

**ユーザー管理機能:**

- Master/User 権限管理
- ユーザー登録・編集
- 認証システム（Firebase Auth）
- パスワード変更機能

**計算・レポート機能:**

- 給与自動計算
- 税込み/税抜き切り替え
- PDF 出力（基本実装）
- シフト統計表示

**技術的機能:**

- PWA 対応（オフライン機能）
- リアルタイム同期
- レスポンシブデザイン
- セキュリティルール実装

### 4.2 機能アーキテクチャ説明

```typescript
interface FeatureCategory {
  title: string;
  icon: string;
  description: string;
  features: Feature[];
  implementation: TechnicalDetail;
}

interface Feature {
  name: string;
  description: string;
  status: "implemented" | "planned" | "future";
  complexity: "basic" | "advanced" | "expert";
}

const featureCategories: FeatureCategory[] = [
  {
    title: "シフト管理機能",
    icon: "📅",
    description: "エンタープライズレベルのシフト管理システム",
    features: [
      {
        name: "ガントチャート表示",
        description: "全スタッフのシフトを一覧表示、視覚的な管理が可能",
        status: "implemented",
        complexity: "expert",
      },
      {
        name: "ドラッグ&ドロップ編集",
        description: "直感的な操作でシフトの編集・移動が可能",
        status: "implemented",
        complexity: "advanced",
      },
    ],
    implementation: {
      frontend: ["React Native Calendars", "Draggable FlatList"],
      backend: ["Firestore Real-time", "Cloud Functions"],
      complexity_note: "大学生レベルを超越した実装",
    },
  },
];
```

### 4.3 実装要件

**ビジュアル表現:**

- アイコンベースのカード設計
- アニメーション付きホバーエフェクト
- 実装ステータスバッジ
- 技術複雑度インジケーター

**インタラクション:**

- カードクリックで詳細展開
- フィルタリング機能（カテゴリ別）
- 技術レベル別ソート

---

## 5. Technology Stack

### 5.1 現在の技術スタック詳細

**Frontend Architecture:**

```typescript
const frontendStack = {
  framework: "React Native 0.73.6",
  navigation: "Expo Router ~3.4.10",
  ui: [
    "Material-UI 5.15.10",
    "@expo/vector-icons 14.1.0",
    "react-native-calendars 1.1312.1",
  ],
  state_management: "React Hooks + Context API",
  styling: "Emotion React 11.14.0",
  date_handling: "date-fns 2.30.0",
  type_safety: "TypeScript",
  platform: "Cross-platform (iOS/Android/Web)",
};
```

**Backend Architecture:**

```typescript
const backendStack = {
  database: "Cloud Firestore (NoSQL)",
  authentication: "Firebase Authentication",
  functions: "Firebase Admin SDK 13.2.0",
  security: "Firestore Security Rules",
  storage: "Firebase Storage",
  hosting: "Vercel (Web) + Expo (Mobile)",
};
```

**Development Tools:**

```typescript
const devStack = {
  bundler: "Metro Config + Babel",
  testing: "Jest (設定済み)",
  deployment: {
    web: "Vercel",
    mobile: "Expo Build Service",
  },
  pwa: "Service Worker + Manifest",
  monitoring: "Firebase Analytics",
};
```

### 5.2 技術選定の理由とアピールポイント

**なぜこの技術選定？:**

1. **React Native 選定理由:**

   - クロスプラットフォーム開発効率
   - ネイティブレベルのパフォーマンス
   - 豊富なライブラリエコシステム

2. **Firebase 選定理由:**

   - リアルタイム同期機能
   - スケーラブルな NoSQL データベース
   - 認証・セキュリティの堅牢性

3. **TypeScript 採用理由:**
   - 大規模開発での型安全性
   - 開発効率と保守性の向上
   - エンタープライズ開発標準

### 5.3 実装要件

**ビジュアル表現:**

- 技術スタック図（アーキテクチャ図）
- パフォーマンス指標表示
- 学習コスト vs 効果グラフ

**インタラクティブ要素:**

- 技術詳細のツールチップ
- 関連技術のリンク
- GitHub Repository 統計

---

## 6. Development Story

### 6.1 開発ストーリー構成

**開発の背景:**

```markdown
## 課題発見からスタート

「アルバイト先のシフト管理が非効率」
→ Excel 管理の限界
→ リアルタイム共有の必要性
→ 権限管理の重要性を実感
```

**技術学習の軌跡:**

```typescript
interface LearningPath {
  phase: string;
  duration: string;
  challenges: string[];
  achievements: string[];
  technologies: string[];
}

const learningJourney: LearningPath[] = [
  {
    phase: "基礎学習期間",
    duration: "1-2ヶ月目",
    challenges: [
      "React Native の環境構築",
      "Firebase の理解",
      "TypeScript の習得",
    ],
    achievements: [
      "基本的なナビゲーション実装",
      "認証システム構築",
      "データベース設計完了",
    ],
    technologies: ["React Native", "Firebase Auth", "TypeScript"],
  },
  {
    phase: "コア機能開発期間",
    duration: "3-5ヶ月目",
    challenges: [
      "ガントチャートの実装",
      "リアルタイム同期の最適化",
      "複雑な権限管理ロジック",
    ],
    achievements: [
      "ドラッグ&ドロップ機能",
      "承認フロー実装",
      "給与計算システム",
    ],
    technologies: [
      "Firestore",
      "React Native Calendars",
      "Complex State Management",
    ],
  },
];
```

### 6.2 技術的挑戦と解決策

**主要な技術的困難:**

1. **ガントチャートの実装**

   - 問題: React Native での複雑な UI 実装
   - 解決: react-native-calenders + カスタムコンポーネント
   - 学び: パフォーマンス最適化の重要性

2. **リアルタイム同期**

   - 問題: 複数ユーザーの同時編集競合
   - 解決: Firestore の楽観的更新 + 競合解決ロジック
   - 学び: 分散システムの複雑性

3. **権限管理システム**
   - 問題: セキュアな権限制御
   - 解決: Firestore Security Rules + フロントエンド制御
   - 学び: セキュリティ設計の重要性

### 6.3 実装要件

**ストーリーテリング要素:**

- タイムライン表示
- 技術習得グラフ
- 困難度 vs 成果マトリックス
- Before/After 比較

**ビジュアル要素:**

- 開発過程のスクリーンショット
- 学習リソースの紹介
- エラー画面から完成画面への変遷

---

## 7. Live Demo

### 7.1 デモ環境設計

**Web Demo (Vercel):**

```typescript
const webDemoConfig = {
  url: "https://shiftize-demo.vercel.app",
  features: [
    "ガントチャート操作",
    "シフト追加・編集",
    "権限切り替えデモ",
    "リアルタイム同期表示",
  ],
  demo_accounts: {
    master: { id: "demo_master", nickname: "管理者デモ" },
    user: { id: "demo_user", nickname: "講師デモ" },
  },
  limitations: [
    "デモデータのリセット（毎日）",
    "一部機能の制限",
    "パフォーマンス最適化",
  ],
};
```

**操作ガイド:**

```typescript
interface DemoGuide {
  step: number;
  title: string;
  description: string;
  screenshot: string;
  interaction: string;
}

const demoSteps: DemoGuide[] = [
  {
    step: 1,
    title: "ログイン機能",
    description: "デモアカウントでログイン。Master/User権限を体験",
    screenshot: "login-demo.png",
    interaction: "クリックしてログイン",
  },
  {
    step: 2,
    title: "ガントチャート操作",
    description: "ドラッグ&ドロップでシフトを編集。リアルタイム反映を確認",
    screenshot: "gantt-demo.png",
    interaction: "シフトをドラッグして移動",
  },
];
```

### 7.2 実装要件

**デモサイト機能:**

- ガイド付きツアー
- 操作ヒント表示
- リセット機能
- パフォーマンス監視

**アクセシビリティ:**

- キーボード操作対応
- スクリーンリーダー対応
- 高コントラストモード

---

## 8. Developer Profile

### 8.1 プロフィール構成

**個人情報（必要最小限）:**

```typescript
interface DeveloperProfile {
  name: string;
  role: string;
  university: string;
  major: string;
  graduation_year: string;
  location: string;
  interests: string[];
}

const profile: DeveloperProfile = {
  name: "[実名]",
  role: "フルスタック開発者（学生）",
  university: "[大学名]",
  major: "[専攻]",
  graduation_year: "2026年予定",
  location: "日本",
  interests: ["Web開発", "モバイル開発", "UI/UX設計", "アーキテクチャ設計"],
};
```

**技術スキル:**

```typescript
interface SkillSet {
  category: string;
  skills: Skill[];
}

interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  experience: string;
  projects: string[];
}

const skillSets: SkillSet[] = [
  {
    category: "フロントエンド",
    skills: [
      {
        name: "React Native",
        level: "advanced",
        experience: "6ヶ月+ 実プロジェクト",
        projects: ["Shiftize"],
      },
      {
        name: "TypeScript",
        level: "intermediate",
        experience: "大規模アプリでの実用",
        projects: ["Shiftize"],
      },
    ],
  },
];
```

### 8.2 学習・成長ストーリー

**自己学習の軌跡:**

- 独学での技術習得方法
- 困難な課題への取り組み方
- コミュニティでの学習
- 継続的な技術向上への取り組み

**今後の目標:**

- 短期目標（1 年以内）
- 中期目標（2-3 年）
- 長期的なキャリアビジョン

### 8.3 実装要件

**ビジュアル要素:**

- プロフェッショナルな写真
- スキルレーダーチャート
- 学習進捗グラフ
- プロジェクトタイムライン

**インタラクション:**

- スキル詳細のモーダル
- プロジェクト詳細リンク
- 連絡先情報（適切なレベル）

---

## 9. Footer

### 9.1 フッター構成

**主要リンク:**

```typescript
interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterLink {
  text: string;
  href: string;
  external?: boolean;
}

const footerSections: FooterSection[] = [
  {
    title: "プロジェクト",
    links: [
      { text: "ライブデモ", href: "#demo" },
      {
        text: "GitHub",
        href: "https://github.com/[username]/shift-scheduler",
        external: true,
      },
      { text: "技術詳細", href: "#tech" },
    ],
  },
  {
    title: "開発者",
    links: [
      { text: "プロフィール", href: "#developer" },
      {
        text: "LinkedIn",
        href: "https://linkedin.com/in/[profile]",
        external: true,
      },
      { text: "お問い合わせ", href: "#contact" },
    ],
  },
  {
    title: "リソース",
    links: [
      { text: "開発ブログ", href: "/blog" },
      { text: "技術記事", href: "/articles" },
      { text: "使用技術", href: "#tech" },
    ],
  },
];
```

**法的情報:**

- 著作権表示
- プライバシーポリシー（必要に応じて）
- 利用規約（必要に応じて）

### 9.2 実装要件

**デザイン:**

- ダークテーマ
- 3 カラムレイアウト（デスクトップ）
- 1 カラムレイアウト（モバイル）

**機能:**

- ページトップに戻るボタン
- ソーシャルリンク
- 最新更新日表示

---

## 実装優先順位

### Phase 1: 必須コンテンツ

1. Hero Section
2. Features Showcase
3. Technology Stack
4. Live Demo

### Phase 2: 差別化要素

1. Development Story
2. Product Demo Section
3. Developer Profile

### Phase 3: 完成度向上

1. Header Navigation (高度な機能)
2. Footer (詳細リンク)
3. アニメーション・インタラクション

---

## パフォーマンス・SEO 要件

### パフォーマンス目標

- First Contentful Paint: < 1.5 秒
- Largest Contentful Paint: < 2.5 秒
- Cumulative Layout Shift: < 0.1

### SEO 対策

- 構造化データ実装
- OGP 設定完備
- サイトマップ生成
- robots.txt 最適化

この詳細仕様により、現在のアプリの価値を最大限に活かした宣伝サイトを構築できます。
