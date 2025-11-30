const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './app/globals.css' });

// const { getDefaultConfig } = require('expo/metro-config');
// const { withNativeWind } = require('nativewind/metro');
// const path = require('path');

// const config = getDefaultConfig(__dirname);

// // Alias react-native-worklets to ensure only one copy is used
// config.resolver.extraNodeModules = {
//   ...(config.resolver.extraNodeModules || {}),
//   'react-native-worklets': path.resolve(
//     __dirname,
//     'node_modules/react-native-worklets'
//   ),
// };

// module.exports = withNativeWind(config, { input: './app/globals.css' });
