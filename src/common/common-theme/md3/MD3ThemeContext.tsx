

import React, { createContext, useContext } from "react";
import { MD3Theme } from "./MD3Theme.types";
import { lightColorScheme } from "./MD3Colors";
import { md3Typography } from "./MD3Typography";
import { md3Shape } from "./MD3Shape";
import { md3Elevation } from "./MD3Elevation";
import { md3Spacing } from "./MD3Spacing";

export const lightTheme: MD3Theme = {
  colorScheme: lightColorScheme,  
  typography: md3Typography,       
  shape: md3Shape,                 
  elevation: md3Elevation,         
  spacing: md3Spacing,             
};

const MD3ThemeContext = createContext<MD3Theme>(lightTheme);

export const MD3ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <MD3ThemeContext.Provider value={lightTheme}>
    {children}
  </MD3ThemeContext.Provider>
);

export const useMD3Theme = (): MD3Theme => {
  return useContext(MD3ThemeContext);
};
