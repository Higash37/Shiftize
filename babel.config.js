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
            "@components": "./src/components",
            "@utils": "./src/utils",
            "@types": "./src/types",
            "@services": "./src/services",
            "@providers": "./src/providers",
            "react-native": "react-native-web",
          },
        },
      ],
    ],
  };
};
