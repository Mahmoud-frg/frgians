// **babel.config.js**
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // 1. Correctly configure the Expo preset with NativeWind's JSX source.
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
