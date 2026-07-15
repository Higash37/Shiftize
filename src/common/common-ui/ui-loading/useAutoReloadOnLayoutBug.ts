
import { useEffect } from "react";
import { useWindowDimensions, Platform } from "react-native";

export function useAutoReloadOnLayoutBug(
  threshold: number = 50,
  maxRetry: number = 2
) {
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (Platform.OS === "web") {

      const key = "autoReloadCount";
      const count = Number(sessionStorage.getItem(key) || "0");
      if ((width < threshold || height < threshold) && count < maxRetry) {
        sessionStorage.setItem(key, String(count + 1));
        globalThis.location.reload();
      }
    }
  }, [width, height, threshold, maxRetry]);
}
