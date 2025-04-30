import React from "react";
import { View, Platform } from "react-native";
import { WebTimeSelectProps } from "./types";
import {
  formatTimeToString,
  generateTimeOptions,
  createDateFromTimeString,
} from "./utils";
import { styles } from "./WebTimeSelect.styles";
import "./WebTimeSelect.css"; // CSSファイルをインポート

/**
 * Web環境向けのシンプルな時間選択コンポーネント
 * ネイティブのselect要素を使用したドロップダウン形式の時間選択UI
 */
export const WebTimeSelect: React.FC<WebTimeSelectProps> = ({
  value,
  onChange,
  position = "left",
}) => {
  // 時間オプションを生成（9:00 から 22:00 までの30分刻み）
  const timeOptions = generateTimeOptions();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = createDateFromTimeString(event.target.value, value);
    onChange(newDate);
  };

  // selectコンポーネントのクラス名を使用するためのカスタムコンポーネント
  const SelectElement = () => {
    // Webの環境でのみ実行されるコード
    if (Platform.OS === "web") {
      return (
        <select
          value={formatTimeToString(value)}
          onChange={handleChange}
          className="time-select"
          aria-label="時間を選択"
        >
          {timeOptions.map((time) => (
            <option key={time.getTime()} value={formatTimeToString(time)}>
              {formatTimeToString(time)}
            </option>
          ))}
        </select>
      );
    }

    // 他のプラットフォーム用の実装（後でネイティブ用に拡張可能）
    return null;
  };

  return (
    <View style={styles.container}>
      <SelectElement />
    </View>
  );
};
