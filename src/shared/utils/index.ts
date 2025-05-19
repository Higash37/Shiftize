/**
 * シェアードユーティリティ関数のエクスポート
 *
 * 注意: このモジュールは後方互換性のために維持されています。
 * 新しいコードでは ../core からインポートすることを推奨します。
 */

// 新しいコア機能を再エクスポート
import * as dateUtils from "../core/date/utils";
import * as timeUtils from "../core/time/utils";
import * as styleUtils from "../core/style/utils";
import * as typeUtils from "../core/types/utils";
import * as validationUtils from "../core/validation/utils";

// 型チェック関連ユーティリティ
export const {
  isNullOrUndefined,
  isEmpty,
  isNumeric,
  toNumber,
  isValidDate,
  hasProperty,
  isObjectWithProps,
} = typeUtils;

// バリデーション関連ユーティリティ
export const {
  validateRequired,
  validateEmail,
  validatePassword,
  validateNumberRange,
  validateDate,
  validateLength,
} = validationUtils;

// 日付関連ユーティリティ
export const {
  formatDate,
  formatTime,
  parseDate,
  addDays,
  getDateRange,
  toISODateString,
  getJapaneseDayOfWeek,
  getFirstDayOfMonth,
  getLastDayOfMonth,
} = dateUtils;

// 時間関連ユーティリティ
export const {
  calculateDuration,
  timeToMinutes,
  minutesToTime,
  isTimeInRange,
  doTimesOverlap,
  roundToNearestHalfHour,
} = timeUtils;

// スタイル関連ユーティリティ
export const { getPlatformShadow, adjustColor } = styleUtils;

// 後方互換性のための古いユーティリティ
// 同名関数を別名でエクスポートして名前空間の衝突を回避
import * as legacyDate from "./date";
import * as legacyTime from "./time";

// 古いユーティリティの関数を別名でエクスポート
export const legacyFormatDate = legacyDate.formatDate;
export const legacyFormatTime = legacyDate.formatTime;
export const legacyCalculateDuration = legacyTime.calculateDuration;

// 古いユーティリティから重複しない関数だけを選択的にエクスポート
// 必要に応じて以下を有効化
// export const { 関数名1, 関数名2 } = legacyDate;
// export const { 関数名1, 関数名2 } = legacyTime;
