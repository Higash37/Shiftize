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
            "@": "./app",
            "@components": "./app/components",
            "@utils": "./app/utils",
            "@types": "./app/types",
            "@services": "./app/services",
            "@providers": "./app/providers",
            "react-native": "react-native-web",
          },
        },
      ],
    ],
  };
};
