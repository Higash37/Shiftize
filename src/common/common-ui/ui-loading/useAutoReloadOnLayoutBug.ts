import { useEffect, useRef } from "react";
import { useWindowDimensions, Platform } from "react-native";

/**
 * レイアウト崩れ（幅や高さが異常値）を検知し、自動でページリロードするフック
 * @param threshold 異常とみなす最小幅・高さ(px)
 * @param maxRetry 最大自動リロード回数
 */
export function useAutoReloadOnLayoutBug(
  threshold: number = 50,
  maxRetry: number = 2
) {
  const { width, height } = useWindowDimensions();
  const retried = useRef(0);

  useEffect(() => {
    if (Platform.OS === "web") {
      // セッション単位でリロード回数を管理
      const key = "autoReloadCount";
      let count = Number(sessionStorage.getItem(key) || "0");
      if ((width < threshold || height < threshold) && count < maxRetry) {
        sessionStorage.setItem(key, String(count + 1));
        window.location.reload();
      }
    }
  }, [width, height, threshold, maxRetry]);
}
