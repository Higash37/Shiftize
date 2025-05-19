/**
 * UI関連のユーティリティ関数
 */
import { Platform } from "react-native";

/**
 * プラットフォーム固有のシャドウスタイルを生成するヘルパー関数
 * @param elevation 影の強さ（高さ）
 * @returns プラットフォームに適したシャドウスタイル
 */
export const getPlatformShadow = (elevation: number = 2) => {
  if (Platform.OS === "web") {
    return {
      boxShadow: `0px ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
    };
  }
  return {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1,
    shadowRadius: elevation,
    elevation,
  };
};

/**
 * 色の濃さを調整する
 * @param color HEX形式の色コード
 * @param amount 調整量（-1.0〜1.0）、正の値で明るく、負の値で暗く
 * @returns 調整後のHEX色コード
 */
export const adjustColor = (color: string, amount: number): string => {
  let usePound = false;

  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);
  let r = (num >> 16) + amount * 255;
  let g = ((num >> 8) & 0x00ff) + amount * 255;
  let b = (num & 0x0000ff) + amount * 255;

  r = Math.min(255, Math.max(0, Math.round(r)));
  g = Math.min(255, Math.max(0, Math.round(g)));
  b = Math.min(255, Math.max(0, Math.round(b)));

  const newColor = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");

  return (usePound ? "#" : "") + newColor;
};
