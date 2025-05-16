module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./src",
            "@components": "./src/shared/components",
            "@utils": "./src/shared/utils",
            "@types": "./src/shared/types",
            "@services": "./src/services",
            "@providers": "./src/providers",
            "react-native": "react-native-web",
          },
        },
      ],
    ],
  };
};
