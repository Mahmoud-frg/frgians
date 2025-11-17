import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedCard = () => {
  const dotPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(dotPosition, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const top = dotPosition.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['10%', '10%', '88%', '88%', '10%'],
  });

  const right = dotPosition.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['2%', '97%', '97%', '2%', '2%'],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.dot, { top, right }]} />

      <View style={styles.card}>
        {/* <View style={styles.ray} /> */}
        <Text
          className='text-sm color-coSecondary self-center'
          style={{ fontFamily: 'outfit-medium' }}
        >
          We care about you
        </Text>
        <Text
          className='text-sm color-slate-400 self-center'
          style={{ fontFamily: 'outfit-medium' }}
        >
          Copyright &copy; 2025 FRG | IT department - App version 1.1
        </Text>

        {/* <View style={[styles.line, styles.topl]} />
        <View style={[styles.line, styles.leftl]} />
        <View style={[styles.line, styles.bottoml]} />
        <View style={[styles.line, styles.rightl]} /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 150,
    borderRadius: 0,
    padding: 1,
    // backgroundColor: Colors.primary,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
    paddingBottom: '20%',
  },
  dot: {
    width: 5,
    height: 5,
    position: 'absolute',
    backgroundColor: '#F05727',
    borderRadius: 100,
    shadowColor: Colors.icons,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 2,
  },
  card: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#202222',
    // backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ray: {
    width: 270,
    height: 45,
    borderRadius: 100,
    backgroundColor: '#c7c7c7',
    opacity: 0.2,
    position: 'absolute',
    top: -25,
    left: -100,
    transform: [{ rotate: '30deg' }],
    shadowColor: '#ffffff',
    shadowOpacity: 1,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    fontFamily: 'outfit-regular',
    fontWeight: 'bold',
    fontSize: 20,
    color: '#ccc',
  },
  subtext: {
    fontSize: 16,
    color: '#ccc',
  },
  line: {
    position: 'absolute',
    backgroundColor: '#2c2c2c',
  },
  topl: {
    top: '10%',
    height: 1,
    width: '100%',
    backgroundColor: '#888888',
  },
  bottoml: {
    bottom: '10%',
    height: 1,
    width: '100%',
  },
  leftl: {
    left: '2%',
    width: 1,
    height: '100%',
    backgroundColor: '#747474',
  },
  rightl: {
    right: '2%',
    width: 1,
    height: '100%',
  },
});

export default AnimatedCard;
