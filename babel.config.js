module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: [
      'react-native-reanimated/plugin', // must be last
    ],
  };
};

// plugins: [
//       "nativewind/babel", // This line is crucial
//       'react-native-reanimated/plugin', // Keep this plugin for reanimated
//       'expo-router/babel',
//     ],
