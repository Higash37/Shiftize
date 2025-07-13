# 機能別コンテンツ詳細仕様書

## 目次

1. [実装済み機能の詳細分析](#1-実装済み機能の詳細分析)
2. [機能デモ用コンテンツ](#2-機能デモ用コンテンツ)
3. [技術的アピールポイント](#3-技術的アピールポイント)
4. [ビジュアルコンテンツ要件](#4-ビジュアルコンテンツ要件)
5. [ユーザーストーリー](#5-ユーザーストーリー)

---

## 1. 実装済み機能の詳細分析

### 1.1 シフト管理システム

#### ガントチャート機能

**現在の実装レベル:**

- React Native Calendars を使用した高度なカスタマイズ
- 月次ビューでの全スタッフシフト表示
- ドラッグ&ドロップによる直感的な編集
- リアルタイムデータ同期

**技術的複雑度:**

```typescript
interface GanttComplexity {
  ui_complexity: "Expert Level";
  data_management: "Advanced Level";
  real_time_sync: "Expert Level";
  performance_optimization: "Advanced Level";
}

// 実装の困難さを大学生レベルとして評価
const technicalAssessment = {
  typical_university_level: "基本的なCRUDアプリ",
  this_implementation: "エンタープライズレベルUI + リアルタイム同期",
  skill_gap: "実務2-3年相当の技術力が必要",
  learning_curve: "非常に steep（急勾配）",
};
```

**宣伝サイトでのアピール方法:**

1. **Before/After 比較**

   - Excel 管理 → リアルタイム同期システム
   - 手動調整 → ドラッグ&ドロップ操作
   - 個別連絡 → 自動通知システム

2. **技術的チャレンジの説明**
   - "React Native でのガントチャート実装は通常ライブラリが限定的"
   - "独自コンポーネント開発でパフォーマンス最適化を実現"
   - "複数ユーザーの同時編集競合を解決"

#### シフト申請・承認フロー

**現在の実装:**

- User: シフト申請機能
- Master: 一括承認・個別承認機能
- ステータス管理（申請中・承認済み・拒否・完了）
- 履歴管理とログ機能

**ビジネスロジックの複雑性:**

```typescript
interface ApprovalWorkflow {
  states: ["pending", "approved", "rejected", "completed"];
  transitions: {
    pending: ["approved", "rejected"];
    approved: ["completed", "rejected"];
    rejected: ["pending"];
    completed: [];
  };
  business_rules: [
    "同じ時間帯の重複チェック",
    "最小スタッフ数の確保",
    "権限に基づく操作制限",
    "変更履歴の追跡"
  ];
}
```

### 1.2 権限管理システム

#### 実装されている権限制御

**Firebase Security Rules の活用:**

```javascript
// 実際に実装されているルール例
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master");
    }
    match /shifts/{shiftId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master");
    }
  }
}
```

**フロントエンド権限制御:**

- 役割ベースのナビゲーション分岐
- 機能レベルでのアクセス制御
- UI 要素の動的表示・非表示

**宣伝でのアピールポイント:**

- "セキュリティを最優先に設計"
- "バックエンド・フロントエンド両方での多層防御"
- "エンタープライズ標準の権限管理"

### 1.3 給与計算システム

#### 実装されている計算機能

**自動計算ロジック:**

```typescript
interface SalaryCalculation {
  base_calculation: {
    hourly_rate: number;
    working_hours: number;
    basic_salary: number;
  };
  tax_options: {
    include_tax: boolean;
    tax_rate: number;
  };
  admin_options: {
    include_admin_salary: boolean;
    admin_hourly_rate: number;
  };
  output_formats: ["screen_display", "pdf_export"];
}

// 実際の計算式
const calculateSalary = (shifts, options) => {
  const basicSalary = shifts.reduce((total, shift) => {
    return total + shift.hours * shift.hourlyRate;
  }, 0);

  const taxAmount = options.includeTax ? basicSalary * options.taxRate : 0;
  return basicSalary + taxAmount;
};
```

**技術的アピールポイント:**

- ビジネスロジックの正確な実装
- 柔軟な計算オプション
- データの永続化と履歴管理

---

## 2. 機能デモ用コンテンツ

### 2.1 ガントチャートデモ

#### デモシナリオ

##### シナリオ 1: 新規シフト追加

```typescript
const demoScenario1 = {
  title: "新規シフト追加デモ",
  steps: [
    {
      step: 1,
      action: "カレンダーの空白セルをクリック",
      result: "シフト追加モーダルが表示",
      screenshot: "add-shift-modal.png",
    },
    {
      step: 2,
      action: "スタッフ選択・時間設定",
      result: "入力値のリアルタイムバリデーション",
      screenshot: "shift-validation.png",
    },
    {
      step: 3,
      action: "保存ボタンクリック",
      result: "ガントチャートに即座に反映",
      screenshot: "shift-added.png",
    },
  ],
  technical_points: [
    "入力バリデーション（重複チェック）",
    "リアルタイムUI更新",
    "楽観的UI更新の実装",
  ],
};
```

##### シナリオ 2: ドラッグ&ドロップ編集

```typescript
const demoScenario2 = {
  title: "ドラッグ&ドロップ編集デモ",
  demo_type: "interactive_gif",
  duration: "15秒",
  actions: [
    "既存シフトを別の日時にドラッグ",
    "リアルタイム位置プレビュー表示",
    "ドロップ時の自動保存",
    "他ユーザー画面での即時反映",
  ],
  technical_complexity: "React Native でのドラッグ&ドロップは実装困難度が高い",
};
```

### 2.2 権限管理デモ

#### Master/User 切り替えデモ

**デモ構成:**

```typescript
const authDemo = {
  demo_accounts: {
    master: {
      username: "demo_master",
      features_available: [
        "全スタッフシフト閲覧",
        "シフト承認・拒否",
        "ユーザー管理",
        "統計データ閲覧",
        "システム設定",
      ],
    },
    user: {
      username: "demo_user",
      features_available: [
        "自分のシフト閲覧・編集",
        "シフト申請",
        "承認ステータス確認",
      ],
    },
  },
  comparison_points: [
    "利用可能メニューの違い",
    "データアクセス範囲の制限",
    "操作権限の違い",
  ],
};
```

### 2.3 リアルタイム同期デモ

#### 複数ウィンドウでの同期表示

**デモ設計:**

```typescript
const realtimeDemo = {
  setup: "2つのブラウザウィンドウを並べて表示",
  demo_flow: [
    {
      window: "左（Master）",
      action: "シフト承認",
      expected_result: "右ウィンドウで即座にステータス更新",
    },
    {
      window: "右（User）",
      action: "新規シフト申請",
      expected_result: "左ウィンドウの承認待ちリストに追加",
    },
  ],
  technical_highlight: "WebSocketレベルのリアルタイム性をFirestoreで実現",
};
```

---

## 3. 技術的アピールポイント

### 3.1 大学生レベルを超越している点

#### 一般的な大学生プロジェクトとの比較

**典型的な大学生プロジェクト:**

```typescript
const typicalStudentProject = {
  scope: "個人的なTo-Doアプリ、簡単なCRUDアプリ",
  technology: "基本的なReact + REST API",
  features: ["基本的な作成・読取・更新・削除"],
  complexity: "シングルユーザー、基本的なUI",
  deployment: "ローカル環境またはシンプルなホスティング",
};
```

**Shiftize プロジェクト:**

```typescript
const shiftizeProject = {
  scope: "エンタープライズ級のワークフォース管理システム",
  technology: "React Native + Firebase + TypeScript",
  features: [
    "リアルタイム同期",
    "複雑な権限管理",
    "高度なUI実装",
    "ビジネスロジック実装",
    "PWA対応",
  ],
  complexity: "マルチユーザー、エンタープライズアーキテクチャ",
  deployment: "クロスプラットフォーム本格運用",
};
```

#### 技術的難易度の定量化

**実装困難度マトリックス:**

```typescript
interface TechnicalDifficulty {
  feature: string;
  university_level: 1 | 2 | 3 | 4 | 5;
  this_implementation: 1 | 2 | 3 | 4 | 5;
  industry_standard: 1 | 2 | 3 | 4 | 5;
}

const difficultyMatrix: TechnicalDifficulty[] = [
  {
    feature: "ガントチャートUI",
    university_level: 2,
    this_implementation: 5,
    industry_standard: 4,
  },
  {
    feature: "リアルタイム同期",
    university_level: 1,
    this_implementation: 4,
    industry_standard: 5,
  },
  {
    feature: "権限管理システム",
    university_level: 2,
    this_implementation: 4,
    industry_standard: 5,
  },
];
```

### 3.2 学習曲線とスキル習得

#### 自己学習の軌跡

**技術習得タイムライン:**

```typescript
const learningTimeline = [
  {
    month: 1,
    focus: "React Native 基礎",
    challenges: ["環境構築", "ナビゲーション理解", "基本コンポーネント"],
    output: "Hello World レベルのアプリ",
  },
  {
    month: 2,
    focus: "Firebase 統合",
    challenges: ["認証実装", "Firestore理解", "セキュリティルール"],
    output: "ログイン機能付きアプリ",
  },
  {
    month: 3,
    focus: "状態管理とUI",
    challenges: [
      "複雑な状態管理",
      "カスタムコンポーネント",
      "レスポンシブ対応",
    ],
    output: "基本的なシフト管理機能",
  },
  {
    month: 4 - 5,
    focus: "高度な機能実装",
    challenges: ["ガントチャート", "ドラッグ&ドロップ", "リアルタイム同期"],
    output: "コア機能完成",
  },
  {
    month: 6,
    focus: "最適化と仕上げ",
    challenges: ["パフォーマンス最適化", "バグ修正", "PWA対応"],
    output: "本格運用可能なアプリ",
  },
];
```

#### 学習リソースと方法

**活用した学習リソース:**

- 公式ドキュメント深読み
- Stack Overflow での問題解決
- GitHub のオープンソースプロジェクト研究
- YouTube チュートリアル（基礎部分）
- 技術書籍による体系的学習

**学習方法のアピールポイント:**

- 自主的な問題解決能力
- 最新技術のキャッチアップ力
- ドキュメント読解力
- 実践的な実装力

---

## 4. ビジュアルコンテンツ要件

### 4.1 スクリーンショット撮影計画

#### 主要画面の撮影リスト

**Master 権限画面:**

```typescript
const masterScreenshots = [
  {
    screen: "ガントチャート表示",
    file: "master-gantt-view.png",
    description: "全スタッフのシフトを月次ビューで表示",
    highlight_points: ["視覚的な一覧性", "色分けによる識別", "時間軸の明確性"],
  },
  {
    screen: "シフト承認画面",
    file: "shift-approval.png",
    description: "申請されたシフトの一括承認・個別対応",
    highlight_points: ["バッチ操作UI", "ステータス管理", "権限制御"],
  },
  {
    screen: "ユーザー管理画面",
    file: "user-management.png",
    description: "スタッフの登録・編集・権限管理",
    highlight_points: ["権限設定UI", "ユーザー情報管理", "セキュリティ設定"],
  },
];
```

**User 権限画面:**

```typescript
const userScreenshots = [
  {
    screen: "個人シフト表示",
    file: "user-shift-view.png",
    description: "自分のシフト予定とステータス確認",
    highlight_points: ["個人向けUI", "ステータス表示", "申請履歴"],
  },
  {
    screen: "シフト申請画面",
    file: "shift-application.png",
    description: "新規シフトの申請フォーム",
    highlight_points: ["入力バリデーション", "使いやすいUI", "確認機能"],
  },
];
```

#### モックアップとワイヤーフレーム

**デバイス別表示:**

- iPhone 14 Pro（375x812）
- iPad Air（820x1180）
- MacBook Pro（1440x900）

**ブラウザ別対応:**

- Chrome（最新）
- Safari（最新）
- Edge（最新）

### 4.2 操作動画撮影計画

#### 機能デモ動画

##### 動画 1: ガントチャート操作（30 秒）

```typescript
const ganttDemo = {
  duration: "30秒",
  resolution: "1920x1080",
  format: "MP4",
  scenario: [
    "0-5秒: 全体画面表示",
    "5-15秒: ドラッグ&ドロップ操作",
    "15-25秒: リアルタイム同期確認",
    "25-30秒: 結果確認",
  ],
  highlight_techniques: [
    "カーソル強調",
    "操作箇所のズーム",
    "変更点のハイライト",
  ],
};
```

##### 動画 2: 権限管理デモ（20 秒）

```typescript
const authDemo = {
  duration: "20秒",
  format: "GIF（ループ再生）",
  scenario: [
    "0-5秒: Master権限画面表示",
    "5-10秒: ログアウト・ログイン切り替え",
    "10-15秒: User権限画面表示",
    "15-20秒: 機能制限の確認",
  ],
};
```

### 4.3 技術アーキテクチャ図

#### システム構成図

**アーキテクチャ図の要素:**

```typescript
const architectureDiagram = {
  components: [
    {
      layer: "Frontend",
      technologies: ["React Native", "Expo Router", "TypeScript"],
      description: "クロスプラットフォーム UI",
    },
    {
      layer: "Backend",
      technologies: ["Firebase Auth", "Firestore", "Cloud Functions"],
      description: "サーバーレス バックエンド",
    },
    {
      layer: "Infrastructure",
      technologies: ["Vercel", "Firebase Hosting", "PWA"],
      description: "デプロイメント環境",
    },
  ],
  data_flow: [
    "User Interaction → React Native",
    "React Native → Firebase SDK",
    "Firebase → Firestore Database",
    "Real-time Updates → All Connected Clients",
  ],
};
```

---

## 5. ユーザーストーリー

### 5.1 実際の使用場面

#### ペルソナ設定

**Master（管理者）- 田中さん（塾の責任者）**

```typescript
const masterPersona = {
  name: "田中さん",
  role: "塾の責任者・エリアマネージャー",
  age: 35,
  tech_literacy: "中級",
  pain_points: [
    "毎月のシフト調整に時間がかかる",
    "講師との連絡調整が煩雑",
    "シフト変更の管理が大変",
    "給与計算のミスを防きたい",
  ],
  goals: [
    "効率的なシフト管理",
    "講師とのスムーズなコミュニケーション",
    "正確な勤怠管理",
    "時間の節約",
  ],
};
```

##### User（講師）- 佐藤さん（大学生アルバイト）

```typescript
const userPersona = {
  name: "佐藤さん",
  role: "大学生・塾講師アルバイト",
  age: 20,
  tech_literacy: "高級",
  pain_points: [
    "シフト申請の手続きが面倒",
    "承認状況が分からない",
    "急なシフト変更への対応",
    "給与確認が煩雑",
  ],
  goals: [
    "簡単なシフト申請",
    "リアルタイムな状況確認",
    "柔軟なスケジュール管理",
    "透明性のある給与管理",
  ],
};
```

### 5.2 ユーザージャーニー

#### Master（管理者）の典型的な使用フロー

**月初のシフト作成業務:**

```typescript
const masterJourney = [
  {
    step: "ログイン",
    action: "アプリにアクセス・認証",
    current_solution: "Shiftize でワンクリックログイン",
    old_solution: "Excel ファイルを開いて前月データをコピー",
  },
  {
    step: "前月実績確認",
    action: "ガントチャートで全体把握",
    current_solution: "視覚的に一目で全体を把握",
    old_solution: "Excel の行列を目で追って確認",
  },
  {
    step: "新月シフト作成",
    action: "テンプレートから新規作成",
    current_solution: "ドラッグ&ドロップで直感的に配置",
    old_solution: "セルに手動で名前と時間を入力",
  },
  {
    step: "講師への共有",
    action: "システム内で自動通知",
    current_solution: "アプリ内通知で即座に共有",
    old_solution: "LINE や メールで個別に連絡",
  },
];
```

#### User（講師）の典型的な使用フロー

**シフト申請・確認業務:**

```typescript
const userJourney = [
  {
    step: "スケジュール確認",
    action: "来月の予定を確認",
    current_solution: "アプリで自分のシフト予定を一覧表示",
    old_solution: "LINEメッセージを遡って確認",
  },
  {
    step: "シフト申請",
    action: "追加でシフトを申請",
    current_solution: "カレンダーから希望日時を選択して申請",
    old_solution: "LINE で「○日○時から入れます」とメッセージ",
  },
  {
    step: "承認待ち",
    action: "申請の承認状況を確認",
    current_solution: "アプリでリアルタイムにステータス確認",
    old_solution: "返事が来るまで不安で待機",
  },
  {
    step: "確定通知",
    action: "シフト確定の通知受領",
    current_solution: "アプリ内通知で即座に確認",
    old_solution: "LINE の個別メッセージで確認",
  },
];
```

### 5.3 Before/After 比較ストーリー

#### 導入前の課題

**管理者側の課題:**

```markdown
## Excel 管理時代の苦労

### 毎月のシフト作成作業

- Excel ファイルを開いて前月データをコピー
- 手動で各講師の希望を転記
- 重複や空きコマのチェックを目視で実施
- 完成後、PDF 化して LINE で個別送信

**時間: 約 3-4 時間/月**
**ミス: 重複配置、連絡漏れが頻発**
```

**講師側の課題:**

```markdown
## LINE 管理時代の不便さ

### シフト希望の連絡

- 毎回 LINE で「○ 日 ○ 時から入れます」と連絡
- 前の申請内容を確認するためにメッセージを遡る
- 承認されたかどうかが分からない
- 給与の計算根拠が不透明

**手間: 毎回の個別連絡**
**不安: 承認状況の不透明性**
```

#### 導入後の改善

**管理者側の改善:**

```markdown
## Shiftize 導入後の効率化

### ワンクリック シフト管理

- ガントチャートで全体を視覚的に把握
- ドラッグ&ドロップで直感的な編集
- 自動的な重複・空きチェック
- 講師への自動通知

**時間: 約 30 分/月（90%削減）**
**ミス: ゼロ（システムが自動チェック）**
```

**講師側の改善:**

```markdown
## アプリによる快適な申請

### 直感的なシフト申請

- カレンダーから希望日時を選択
- リアルタイムで承認状況を確認
- 自動給与計算で透明性確保
- 全ての履歴がアプリ内で確認可能

**手間: ワンクリック申請**
**安心: リアルタイム状況確認**
```

---

## 実装優先度とタイムライン

### フェーズ 1: 必須コンテンツ（Week 1-2）

1. **主要スクリーンショット撮影**
2. **基本的な機能説明テキスト作成**
3. **技術スタック図作成**

### フェーズ 2: 差別化コンテンツ（Week 2-3）

1. **操作デモ動画作成**
2. **Before/After 比較コンテンツ**
3. **ユーザーストーリー作成**

### フェーズ 3: 完成度向上（Week 3-4）

1. **インタラクティブデモ実装**
2. **技術的詳細説明**
3. **パフォーマンス指標データ**

この詳細仕様により、現在のアプリの真の価値と技術的優秀性を最大限アピールできる宣伝サイトを構築できます。
