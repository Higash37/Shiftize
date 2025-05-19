/**
 * 共通コンポーネントのエクスポート
 *
 * 注意: このモジュールは後方互換性のために維持されています。
 * 新しいコードでは ../primitives, ../inputs, ../feedback からインポートしてください。
 */

// 新しい場所のコンポーネントを再エクスポートする
import { Box } from "../primitives";
import { Button, Input } from "../inputs";
import { ErrorMessage } from "../feedback";

// 後方互換性のためのエクスポート
export { Box, Button, Input, ErrorMessage };

// 型定義
export type { BoxProps, BoxStyleName } from "../primitives/Box/types";
export type { ButtonProps, ButtonStyleName } from "../inputs/Button/types";
export type { InputProps, InputStyleName } from "../inputs/Input/types";
export type { ErrorMessageProps } from "../feedback/ErrorMessage/types";

// 共通型定義
export * from "../types/componentTypes";
