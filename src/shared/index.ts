/**
 * 共通モジュールのエクスポート
 *
 * このファイルは、共通コンポーネント、ユーティリティ関数、型定義、定数などを
 * 一か所からインポートできるように集約しています。
 */

// コンポーネント
export * from "./components";

// テーマ
export { theme } from "./theme/theme";
export { colors, typography } from "./constants/themeBridge"; // 後方互換性

// コア機能 (新しい構造)
export * from "./core";

// 型定義
export * from "./types";

// 定数
export * from "./constants";

// 後方互換性のためのレガシーエクスポート
// 古い場所からのインポートが存在する場合のため
import * as legacyUtils from "./utils";
export {
  // 古いコードとの互換性のために必要な関数のみをエクスポート
  legacyFormatDate,
  legacyFormatTime,
  legacyCalculateDuration,
} from "./utils";
