import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { images } from '@/constants/images';

const Logo = () => {
  return (
    <View>
      <Image source={images.FRGians} className='w-12 h-12 mt-5 mx-auto' />
      <Text className='mb-2 mx-auto text-secondary text-base font-extrabold'>
        FRGians
      </Text>
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({});
