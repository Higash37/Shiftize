

import { TextStyle } from "react-native";

import { APP_FONT_FAMILY } from "@/common/common-constants/FontConstants";

export interface MD3TypeScale {

  displayLarge: TextStyle;    
  displayMedium: TextStyle;   
  displaySmall: TextStyle;    

  headlineLarge: TextStyle;   
  headlineMedium: TextStyle;  
  headlineSmall: TextStyle;   

  titleLarge: TextStyle;      
  titleMedium: TextStyle;     
  titleSmall: TextStyle;      

  bodyLarge: TextStyle;       
  bodyMedium: TextStyle;      
  bodySmall: TextStyle;       

  labelLarge: TextStyle;      
  labelMedium: TextStyle;     
  labelSmall: TextStyle;      
}

const fontFamily = APP_FONT_FAMILY;

export const md3Typography: MD3TypeScale = {

  displayLarge: {
    fontFamily,
    fontSize: 57,           
    fontWeight: "400",      
    lineHeight: 64,         
    letterSpacing: -0.25,   
  },
  displayMedium: {
    fontFamily,
    fontSize: 45,
    fontWeight: "400",
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily,
    fontSize: 36,
    fontWeight: "400",
    lineHeight: 44,
    letterSpacing: 0,
  },

  headlineLarge: {
    fontFamily,
    fontSize: 32,
    fontWeight: "400",
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily,
    fontSize: 28,
    fontWeight: "400",
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily,
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 32,
    letterSpacing: 0,
  },

  titleLarge: {
    fontFamily,
    fontSize: 22,
    fontWeight: "400",
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: "500",      
    lineHeight: 24,
    letterSpacing: 0.15,    
  },
  titleSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  bodyLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: "400",       
    lineHeight: 24,
    letterSpacing: 0.5,      
  },
  bodyMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.4,      
  },

  labelLarge: {
    fontFamily,
    fontSize: 14,
    fontWeight: "500",       
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily,
    fontSize: 11,            
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};
