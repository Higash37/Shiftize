import React from "react";
import { Text } from "react-native";
import { styles } from "./styles";
import { ErrorMessageProps } from "./types";

/**
 * ErrorMessage - エラーメッセージ表示コンポーネント
 *
 * フォームやその他のコンポーネントでエラーを表示するために使用します。
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return <Text style={styles.error}>{message}</Text>;
};

export default ErrorMessage;
