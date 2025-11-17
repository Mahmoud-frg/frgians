import React from 'react';
import { Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const UnderHead = ({ scrollY }: { scrollY: Animated.Value }) => {
  const router = useRouter();

  // Interpolate curve radius based on scroll
  const borderRadius = scrollY.interpolate({
    inputRange: [0, 200], // 0 = top, 200 = scrolled
    outputRange: [width, 20], // big curve → small curve
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        width: '100%',
        height: 50, // header tail height
        backgroundColor: '#4a6878', // pick your color
        zIndex: 10,

        // Curved bottom
        borderBottomLeftRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
      }}
    />
  );
};

export default UnderHead;
