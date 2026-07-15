

import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useMD3Theme } from "./MD3ThemeContext";
import { MD3Theme } from "./MD3Theme.types";

export function useThemedStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(factory: (theme: MD3Theme) => T): T {

  const theme = useMD3Theme();

  return useMemo(() => factory(theme), [theme, factory]);
}
