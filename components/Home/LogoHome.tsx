import { Animated, Image, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { images } from '@/constants/images';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const LogoHome = ({ scrollY }: { scrollY: Animated.Value }) => {
  const router = useRouter();

  const handleLogoPress = () => {
    router.push({
      pathname: '/home',
      params: {
        loading: 'true',
        key: Date.now().toString(),
      },
    });
  };

  // Animation interpolations
  const logoScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const textOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const backgroundOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.2],
    extrapolate: 'clamp',
  });

  const backgroundColor = backgroundOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0)'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 5,
        paddingRight: 0,
        backgroundColor,
      }}
    >
      <TouchableOpacity
        onPress={handleLogoPress}
        className='flex flex-row items-center justify-center self-end mx-3'
      >
        <Animated.Text
          style={{
            fontFamily: 'outfit-bold',
            fontSize: 16,
            textAlign: 'center',

            color: Colors.dark.text,
            opacity: textOpacity,
          }}
        >
          FRG
        </Animated.Text>
        <Animated.Image
          source={images.FRGians}
          style={{
            width: 48,
            height: 48,
            alignSelf: 'center',
            transform: [{ scale: logoScale }],
          }}
          tintColor='#ffffff'
        />
        <Animated.Text
          style={{
            fontFamily: 'outfit-bold',
            fontSize: 16,
            textAlign: 'center',

            color: Colors.dark.text,
            opacity: textOpacity,
          }}
        >
          ians
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default LogoHome;
