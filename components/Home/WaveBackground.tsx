// components/Home/WaveBackground.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const WaveBackground = () => {
  const rotate1 = useRef(new Animated.Value(0)).current;
  const rotate2 = useRef(new Animated.Value(0)).current;
  const rotate3 = useRef(new Animated.Value(0)).current;

  const createLoop = (anim: Animated.Value, duration: number) => {
    return Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    );
  };

  useEffect(() => {
    createLoop(rotate1, 14000).start();
    createLoop(rotate2, 12000).start();
    createLoop(rotate3, 10000).start();
  }, []);

  const getRotation = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents='none'
    >
      <Animated.View
        style={[
          styles.wave,
          {
            top: 0,
            backgroundColor: '#af40ff',
            transform: [{ rotate: getRotation(rotate1) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          {
            top: 200,
            backgroundColor: '#5b42f3',
            transform: [{ rotate: getRotation(rotate2) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          {
            top: 200,
            backgroundColor: '#00ddeb',
            transform: [{ rotate: getRotation(rotate3) }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    borderRadius: width,
    opacity: 0.5,
    left: -width / 2,
    top: -height / 2,
  },
});

export default WaveBackground;
