import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const WaveCard = () => {
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const rotateAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      );
    };

    const spin = (anim: Animated.Value) =>
      anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });

    createLoop(rotateAnim1, 14000).start();
    createLoop(rotateAnim2, 12000).start();
    createLoop(rotateAnim3, 10000).start();
  }, []);

  const spin = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

  return (
    <View className='flex-1 items-center justify-center pb-36'>
      <View className='w-60 h-[330px] rounded-2xl overflow-hidden shadow-lg bg-transparent items-center justify-center mt-24'>
        {/* Rotating Waves */}
        <Animated.View
          style={[
            styles.wave,
            {
              transform: [{ rotate: spin(rotateAnim1) }],
              backgroundColor: '#af40ff',
              opacity: 0.6,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            {
              transform: [{ rotate: spin(rotateAnim2) }],
              backgroundColor: '#5b42f3',
              opacity: 0.5,
              top: 50,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            {
              transform: [{ rotate: spin(rotateAnim3) }],
              backgroundColor: '#00ddeb',
              opacity: 0.4,
              top: 50,
            },
          ]}
        />

        {/* Info */}
        <View className='absolute top-24 left-0 right-0 items-center px-4'>
          <Text className='text-white text-lg font-semibold text-center mt-2'>
            UI / EX Designer
          </Text>
          <Text className='text-white text-sm mt-2 lowercase'>
            MikeAndrewDesigner
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    width: 540,
    height: 700,
    left: -270,
    top: -500,
    borderRadius: 270,
  },
});

export default WaveCard;
