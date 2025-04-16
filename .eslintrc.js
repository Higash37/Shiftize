module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-native/all",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-native"],
  rules: {
    "react-native/no-inline-styles": "off",
    "react-native/no-color-literals": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
