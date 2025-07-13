# デザインシステム・UI/UX 仕様書

## 目次

1. [デザインコンセプト](#1-デザインコンセプト)
2. [カラーシステム](#2-カラーシステム)
3. [タイポグラフィ](#3-タイポグラフィ)
4. [レイアウトシステム](#4-レイアウトシステム)
5. [コンポーネント設計](#5-コンポーネント設計)
6. [アニメーション・インタラクション](#6-アニメーションインタラクション)
7. [レスポンシブ対応](#7-レスポンシブ対応)

---

## 1. デザインコンセプト

### 1.1 ブランドアイデンティティ

#### コンセプト定義

##### メインコンセプト: "Professional Innovation"

```typescript
interface BrandConcept {
  primary_message: "大学生でありながらプロフェッショナルな技術力";
  visual_direction: "モダン、クリーン、技術的信頼性";
  emotional_tone: "革新的、情熱的、信頼できる";
  target_impression: "この人と一緒に働きたい、技術力を信頼できる";
}

const brandPersonality = {
  professional: "エンタープライズレベルの品質感",
  innovative: "最新技術への理解と活用",
  trustworthy: "安定感のある実装力",
  passionate: "技術への情熱と学習意欲",
  approachable: "大学生らしい親しみやすさ",
};
```

#### ビジュアルアイデンティティ

**デザイン原則:**

1. **Clarity（明確性）**

   - 情報の階層を明確に
   - 技術的な複雑さを分かりやすく表現
   - ユーザーが迷わないナビゲーション

2. **Credibility（信頼性）**

   - プロフェッショナルなビジュアル品質
   - 一貫性のあるデザインシステム
   - 企業レベルの完成度

3. **Innovation（革新性）**
   - モダンなデザイントレンド活用
   - インタラクティブな要素
   - 最新の Web 技術実装

### 1.2 現在のアプリからの継承要素

#### Shiftize アプリのデザイン要素

**現在のアプリの特徴:**

```typescript
interface CurrentAppDesign {
  color_scheme: {
    primary: "#2196F3"; // Material Design Blue
    secondary: "#4CAF50"; // Material Green
    background: "#F2F2F7"; // iOS Gray
    surface: "#FFFFFF";
  };
  design_system: "Material-UI based";
  layout: "タブベース + ガントチャート";
  ui_philosophy: "実用性重視、直感的な操作";
}
```

**宣伝サイトでの発展:**

- アプリの配色を基調としつつ、より洗練された表現
- マテリアルデザインの要素を踏襲
- 技術的な信頼感を強調するカラーリング

---

## 2. カラーシステム

### 2.1 プライマリカラーパレット

#### メインカラー

##### Primary Blue - 技術と信頼性

```css
:root {
  /* Primary Colors */
  --primary-50: #e3f2fd;
  --primary-100: #bbdefb;
  --primary-200: #90caf9;
  --primary-300: #64b5f6;
  --primary-400: #42a5f5;
  --primary-500: #2196f3; /* Main Primary */
  --primary-600: #1e88e5;
  --primary-700: #1976d2;
  --primary-800: #1565c0;
  --primary-900: #0d47a1;
}
```

##### Secondary Green - 成長と成功

```css
:root {
  /* Secondary Colors */
  --secondary-50: #e8f5e8;
  --secondary-100: #c8e6c9;
  --secondary-200: #a5d6a7;
  --secondary-300: #81c784;
  --secondary-400: #66bb6a;
  --secondary-500: #4caf50; /* Main Secondary */
  --secondary-600: #43a047;
  --secondary-700: #388e3c;
  --secondary-800: #2e7d32;
  --secondary-900: #1b5e20;
}
```

#### アクセントカラー

##### Orange - 情熱とエネルギー

```css
:root {
  /* Accent Colors */
  --accent-50: #fff3e0;
  --accent-100: #ffe0b2;
  --accent-200: #ffcc80;
  --accent-300: #ffb74d;
  --accent-400: #ffa726;
  --accent-500: #ff9800; /* Main Accent */
  --accent-600: #fb8c00;
  --accent-700: #f57c00;
  --accent-800: #ef6c00;
  --accent-900: #e65100;
}
```

### 2.2 ニュートラルカラー

#### グレースケール

```css
:root {
  /* Neutral Colors */
  --neutral-0: #ffffff;
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #eeeeee;
  --neutral-300: #e0e0e0;
  --neutral-400: #bdbdbd;
  --neutral-500: #9e9e9e;
  --neutral-600: #757575;
  --neutral-700: #616161;
  --neutral-800: #424242;
  --neutral-900: #212121;
  --neutral-1000: #000000;
}
```

#### セマンティックカラー

```css
:root {
  /* Semantic Colors */
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  --info: #2196f3;

  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #f1f3f4;

  /* Text Colors */
  --text-primary: #212121;
  --text-secondary: #616161;
  --text-disabled: #9e9e9e;
  --text-inverse: #ffffff;
}
```

### 2.3 カラー使用ガイドライン

#### セクション別カラー戦略

```typescript
interface SectionColors {
  hero: {
    background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))";
    text: "var(--neutral-0)";
    accent: "var(--accent-500)";
  };
  features: {
    background: "var(--neutral-50)";
    cards: "var(--neutral-0)";
    text: "var(--neutral-800)";
  };
  technology: {
    background: "var(--neutral-900)";
    text: "var(--neutral-0)";
    accent: "var(--primary-400)";
  };
  demo: {
    background: "var(--primary-50)";
    highlight: "var(--accent-500)";
    text: "var(--neutral-800)";
  };
}
```

---

## 3. タイポグラフィ

### 3.1 フォント選定

#### プライマリフォント

##### Inter - モダンで読みやすい

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

:root {
  --font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  --font-japanese: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic",
    sans-serif;
}
```

#### フォント使用理由

##### Inter 選定理由

- 高い可読性（特にスクリーン表示）
- 技術系サイトでの採用実績
- 豊富なウェイトバリエーション
- 日本語フォントとの相性

### 3.2 タイポグラフィスケール

#### 見出しシステム

```css
/* Heading Styles */
.heading-1 {
  font-family: var(--font-primary);
  font-size: 3.5rem; /* 56px */
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.heading-2 {
  font-family: var(--font-primary);
  font-size: 2.5rem; /* 40px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.heading-3 {
  font-family: var(--font-primary);
  font-size: 2rem; /* 32px */
  font-weight: 600;
  line-height: 1.25;
}

.heading-4 {
  font-family: var(--font-primary);
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.3;
}
```

#### ボディテキスト

```css
/* Body Text Styles */
.body-large {
  font-family: var(--font-primary);
  font-size: 1.125rem; /* 18px */
  font-weight: 400;
  line-height: 1.6;
}

.body-medium {
  font-family: var(--font-primary);
  font-size: 1rem; /* 16px */
  font-weight: 400;
  line-height: 1.5;
}

.body-small {
  font-family: var(--font-primary);
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  line-height: 1.4;
}
```

#### コードテキスト

```css
/* Code Text Styles */
.code-inline {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  background: var(--neutral-100);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  color: var(--primary-700);
}

.code-block {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.5;
  background: var(--neutral-900);
  color: var(--neutral-100);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
```

---

## 4. レイアウトシステム

### 4.1 グリッドシステム

#### 12 カラムグリッド

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
}

/* Column Spans */
.col-1 {
  grid-column: span 1;
}
.col-2 {
  grid-column: span 2;
}
.col-3 {
  grid-column: span 3;
}
.col-4 {
  grid-column: span 4;
}
.col-6 {
  grid-column: span 6;
}
.col-8 {
  grid-column: span 8;
}
.col-12 {
  grid-column: span 12;
}
```

#### セクション間隔

```css
:root {
  /* Spacing Scale */
  --space-xs: 0.5rem; /* 8px */
  --space-sm: 1rem; /* 16px */
  --space-md: 1.5rem; /* 24px */
  --space-lg: 2rem; /* 32px */
  --space-xl: 3rem; /* 48px */
  --space-2xl: 4rem; /* 64px */
  --space-3xl: 6rem; /* 96px */
  --space-4xl: 8rem; /* 128px */
}

.section {
  padding: var(--space-4xl) 0;
}

.section--hero {
  padding: var(--space-4xl) 0 var(--space-3xl);
}
```

### 4.2 レイアウトパターン

#### Hero Section Layout

```css
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3xl);
  align-items: center;
  min-height: 100vh;
  padding: var(--space-4xl) 0;
}

.hero__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.hero__image {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

#### Features Layout

```css
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-xl);
}

.feature-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: var(--space-xl);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
}
```

---

## 5. コンポーネント設計

### 5.1 ボタンコンポーネント

#### ボタンバリエーション

```css
/* Button Base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-family: var(--font-primary);
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

/* Primary Button */
.btn--primary {
  background: var(--primary-500);
  color: var(--neutral-0);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.btn--primary:hover {
  background: var(--primary-600);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4);
}

/* Secondary Button */
.btn--secondary {
  background: transparent;
  color: var(--primary-500);
  border: 2px solid var(--primary-500);
}

.btn--secondary:hover {
  background: var(--primary-500);
  color: var(--neutral-0);
}
```

### 5.2 カードコンポーネント

#### 機能カード

```css
.feature-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: var(--space-xl);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-500), var(--accent-500));
}

.feature-card__icon {
  width: 3rem;
  height: 3rem;
  background: var(--primary-100);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: var(--space-md);
}

.feature-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.feature-card__description {
  color: var(--text-secondary);
  line-height: 1.6;
}
```

### 5.3 テクノロジーバッジ

#### 技術スタック表示

```css
.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 0.5rem 1rem;
  background: var(--neutral-900);
  color: var(--neutral-0);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0.25rem;
}

.tech-badge__icon {
  width: 1.25rem;
  height: 1.25rem;
}

.tech-badge--react {
  background: linear-gradient(135deg, #61dafb, #21aeca);
}

.tech-badge--firebase {
  background: linear-gradient(135deg, #ffca28, #ff8f00);
}

.tech-badge--typescript {
  background: linear-gradient(135deg, #3178c6, #235a97);
}
```

---

## 6. アニメーション・インタラクション

### 6.1 ページロードアニメーション

#### フェードイン・アップ

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

/* 段階的なアニメーション */
.animate-delay-100 {
  animation-delay: 0.1s;
}
.animate-delay-200 {
  animation-delay: 0.2s;
}
.animate-delay-300 {
  animation-delay: 0.3s;
}
```

#### タイピングエフェクト

```css
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.typing-text {
  overflow: hidden;
  border-right: 2px solid var(--primary-500);
  white-space: nowrap;
  animation: typing 3s steps(40, end), blink 0.75s step-end infinite;
}
```

### 6.2 ホバーエフェクト

#### カードホバー

```css
.interactive-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.interactive-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.interactive-card:hover .card__image {
  transform: scale(1.05);
}
```

#### ボタンリップルエフェクト

```css
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-ripple::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-ripple:active::before {
  width: 300px;
  height: 300px;
}
```

### 6.3 スクロールアニメーション

#### Intersection Observer 活用

```typescript
interface ScrollAnimationConfig {
  trigger: string;
  animation: string;
  threshold: number;
  rootMargin: string;
}

const scrollAnimations: ScrollAnimationConfig[] = [
  {
    trigger: ".feature-card",
    animation: "fadeInUp",
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  },
  {
    trigger: ".tech-badge",
    animation: "slideInLeft",
    threshold: 0.5,
    rootMargin: "0px",
  },
];
```

---

## 7. レスポンシブ対応

### 7.1 ブレークポイント定義

#### メディアクエリ設定

```css
:root {
  /* Breakpoints */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  --bp-2xl: 1536px;
}

/* Mobile First Approach */
.responsive-container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .responsive-container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .responsive-container {
    padding: 3rem;
  }
}
```

### 7.2 レスポンシブレイアウト

#### Hero Section レスポンシブ

```css
.hero {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-3xl) 0;
}

/* Mobile */
.hero {
  grid-template-columns: 1fr;
  text-align: center;
}

/* Desktop */
@media (min-width: 1024px) {
  .hero {
    grid-template-columns: 1fr 1fr;
    text-align: left;
  }
}
```

#### ナビゲーション レスポンシブ

```css
/* Mobile Navigation */
.nav-mobile {
  display: block;
}

.nav-desktop {
  display: none;
}

/* Desktop Navigation */
@media (min-width: 1024px) {
  .nav-mobile {
    display: none;
  }

  .nav-desktop {
    display: flex;
  }
}
```

### 7.3 フォントサイズ レスポンシブ

#### Fluid Typography

```css
.heading-1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
}

.heading-2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

.body-large {
  font-size: clamp(1rem, 2vw, 1.125rem);
}
```

---

## 実装ガイドライン

### パフォーマンス考慮事項

1. **CSS 最適化**

   - Critical CSS のインライン化
   - 不要な CSS の削除
   - CSS Sprite の活用

2. **アニメーション最適化**

   - GPU アクセラレーション活用
   - `transform` と `opacity` 優先使用
   - `will-change` プロパティの適切な使用

3. **フォント最適化**
   - フォントサブセット化
   - フォント表示の最適化（font-display: swap）
   - プリロード設定

### アクセシビリティ対応

1. **カラーコントラスト**

   - WCAG AA レベル準拠
   - コントラスト比 4.5:1 以上

2. **キーボードナビゲーション**

   - Tab キーでの操作対応
   - フォーカス表示の明確化

3. **スクリーンリーダー対応**
   - 適切な HTML セマンティクス
   - ARIA ラベルの実装

このデザインシステムにより、現在のアプリの品質感を継承しつつ、プロフェッショナルな宣伝サイトを構築できます。
