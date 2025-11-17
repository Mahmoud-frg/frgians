import { Image, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { images } from '@/constants/images';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const Logo = () => {
  const router = useRouter();

  const handleLogoPress = () => {
    router.push({
      pathname: '/home',
      params: {
        loading: 'true',
        key: Date.now().toString(), // force full remount
      },
    });
  };

  return (
    <TouchableOpacity onPress={handleLogoPress}>
      <Image
        source={images.FRGians}
        className='w-12 h-12 mt-5 mx-auto'
        tintColor={Colors.dark.text}
      />
      <Text className='mb-2 mx-auto text-secondary text-base font-extrabold'>
        FRGians
      </Text>
    </TouchableOpacity>
  );
};

export default Logo;
