const { getDefaultConfig } = require("expo/metro-config");
const {
  resolver: { sourceExts, assetExts },
} = getDefaultConfig(__dirname);

module.exports = getDefaultConfig(__dirname);
