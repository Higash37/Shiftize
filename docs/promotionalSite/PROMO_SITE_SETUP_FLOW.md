# 宣伝サイト プロジェクト作成フロー

## 📋 プロジェクト作成手順

### 1. ディレクトリ移動と準備

```bash
# 作業ディレクトリに移動
cd c:\git

# 現在のディレクトリ確認
pwd
```

### 2. プロジェクト作成（推奨オプション）

#### 🎯 Option A: Next.js 14 + TypeScript + Tailwind CSS（推奨）

```bash
# Next.js プロジェクト作成
npx create-next-app@latest shiftize-promo-site --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 作成されるプロジェクト構成
shiftize-promo-site/
├── src/
│   └── app/
│       ├── page.tsx
│       ├── layout.tsx
│       └── globals.css
├── public/
├── components/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

### 3. プロジェクトディレクトリに移動

```bash
cd shiftize-promo-site
```

### 4. 必要なディレクトリ構造作成

```bash
# アセット用ディレクトリ
mkdir -p public/images/screenshots
mkdir -p public/images/mockups
mkdir -p public/videos
mkdir -p public/icons

# ドキュメント参照用ディレクトリ
mkdir -p reference/docs
mkdir -p reference/src

# コンポーネント用ディレクトリ（Next.js/React の場合）
mkdir -p src/components/sections
mkdir -p src/components/ui
mkdir -p src/styles
```

### 6. 開発環境セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

---

## 🎯 推奨設定詳細

### Next.js プロジェクトの場合

#### 追加パッケージインストール

```bash
# アニメーション・UI ライブラリ
npm install framer-motion lucide-react

# ユーティリティ
npm install clsx tailwind-merge

# 開発用
npm install -D @types/node
```

#### プロジェクト構成

```text
shiftize-promo-site/
├── src/
│   ├── app/
│   │   ├── page.tsx           # メインページ
│   │   ├── layout.tsx         # レイアウト
│   │   └── globals.css        # グローバルスタイル
│   ├── components/
│   │   ├── sections/          # ページセクション
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── TechStack.tsx
│   │   │   ├── Demo.tsx
│   │   │   └── Developer.tsx
│   │   ├── ui/               # 再利用コンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   └── layout/           # レイアウト関連
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── styles/
│   │   └── components.css    # コンポーネント用CSS
│   └── lib/
│       └── utils.ts          # ユーティリティ関数
├── public/
│   ├── images/
│   │   ├── screenshots/      # アプリスクリーンショット
│   │   ├── mockups/         # デバイスモックアップ
│   │   └── icons/           # 技術スタックアイコン
│   ├── videos/              # デモ動画
│   └── favicon.ico
├── reference/               # 参照用（デプロイ対象外）
│   ├── docs/               # 仕様書
│   └── src/                # 元アプリソース参照
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 🚀 開発フロー

### Phase 1: セットアップ（Day 1）

```bash
# 1. プロジェクト作成
npx create-next-app@latest shiftize-promo-site --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. 追加パッケージインストール
cd shiftize-promo-site
npm install framer-motion lucide-react clsx tailwind-merge

# 3. ディレクトリ構造作成
mkdir -p src/components/{sections,ui,layout}
mkdir -p public/images/{screenshots,mockups,icons}
mkdir -p reference/{docs,src}

# 4. 仕様書コピー
cp ../shift-scheduler-app/docs/*_SPEC.md ./reference/docs/
```

### Phase 2: デザインシステム実装（Day 2-3）

```bash
# 5. Tailwind 設定カスタマイズ
# tailwind.config.ts でカラーパレット設定

# 6. グローバルスタイル作成
# src/app/globals.css でベーススタイル

# 7. 基本コンポーネント作成
# Button, Card, Badge コンポーネント
```

### Phase 3: コンテンツ実装（Day 4-7）

```bash
# 8. セクション別コンポーネント実装
# Hero, Features, TechStack, Demo, Developer

# 9. アセット準備・配置
# スクリーンショット撮影・最適化

# 10. アニメーション実装
# Framer Motion でページ遷移・スクロール
```

### Phase 4: 最適化・デプロイ（Day 8-10）

```bash
# 11. パフォーマンス最適化
npm run build
npm run start

# 12. SEO対策
# メタデータ、sitemap.xml、robots.txt

# 13. デプロイ準備
# Vercel または Netlify設定
```

---

## 💡 開発のポイント

### TypeScript 活用

```typescript
// 型定義例
interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  techStack: string[];
  complexity: "basic" | "advanced" | "expert";
}

interface DemoSection {
  title: string;
  videoUrl: string;
  description: string;
  highlights: string[];
}
```

### Tailwind CSS カスタマイズ

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E3F2FD",
          500: "#2196F3",
          900: "#0D47A1",
        },
      },
    },
  },
};
```

### 環境変数設定

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://shiftize-promo.vercel.app
NEXT_PUBLIC_GITHUB_URL=https://github.com/username/shift-scheduler
```

このフローに従って進めれば、効率的にプロフェッショナルな宣伝サイトを構築できます！
