// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require("nativewind/metro");

// const config = getDefaultConfig(__dirname);

// module.exports = withNativeWind(config, { input: "./app/globals.css" });

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for expo-router entry issue on iOS
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'expo-router/entry': path.resolve(
    __dirname,
    'node_modules/expo-router/entry-classic.js'
  ),
};

// Wrap with NativeWind
module.exports = withNativeWind(config, { input: './app/globals.css' });
