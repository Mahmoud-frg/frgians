// components/MatrixRain.tsx
import React, { useEffect } from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  interpolate,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');
const characters = 'アイウエオカキクケコABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateColumn = (index: number) => {
  const randomChar = () =>
    characters[Math.floor(Math.random() * characters.length)];
  const text = Array.from({ length: 10 }, randomChar).join('\n');

  const offset = Math.random() * 1000;
  const translateY = useSharedValue(-height);

  useEffect(() => {
    translateY.value = withDelay(
      offset,
      withRepeat(
        withTiming(height + 200, {
          duration: 4000,
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(translateY.value, [-100, height], [0.2, 1]),
  }));

  return (
    <Animated.View
      key={index}
      style={[styles.column, animatedStyle]}
    >
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
};

const MatrixRain = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: 30 }, (_, i) => generateColumn(i))}
    </View>
  );
};

export default MatrixRain;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  column: {
    marginHorizontal: 2,
  },
  text: {
    color: '#000000',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 16,
  },
});
