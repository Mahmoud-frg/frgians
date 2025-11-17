import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';

const GlassCard = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 100,
            duration: 1250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 100,
            duration: 1250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 100,
            duration: 1250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 1250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 100,
            duration: 1250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 1250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className='py-36'
    >
      <View style={styles.card}>
        <Animated.View
          style={[
            styles.blob,
            {
              transform: [
                { translateX },
                { translateY },
                { translateX: new Animated.Value(-125) }, // compensate center
                { translateY: new Animated.Value(-125) },
              ],
            },
          ]}
        />
        <BlurView
          intensity={50}
          tint='light'
          style={styles.bg}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 250,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#003161',
    shadowOffset: { width: 20, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    backgroundColor: '#fff',
    elevation: 10,
  },
  bg: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 190,
    height: 240,
    borderRadius: 10,
    zIndex: 2,
    borderColor: '#fff',
    borderWidth: 2,
  },
  blob: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 150,
    height: 150,
    backgroundColor: '#000B58',
    borderRadius: 75,
    zIndex: 1,
    filter: 'blur(12px)', // This is ignored by RN, already simulated via opacity
    opacity: 1,
  },
});

export default GlassCard;
