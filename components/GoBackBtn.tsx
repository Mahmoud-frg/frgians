import { Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import {
  router,
  useLocalSearchParams,
  useNavigationContainerRef,
  useRouter,
} from 'expo-router';
import { icons } from '@/constants/icons';
import { useNavigationState } from '@react-navigation/native';

const GoBackBtn = () => {
  const router = useRouter();

  const { personid, from } = useLocalSearchParams<{
    personid: string;
    from?: string;
  }>();

  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  const handleGoBack = () => {
    if (router.canGoBack()) {
      if (from === 'search') {
        router.push('/search');
      }
      if (from === 'profile') {
        router.push('/profile');
      }
      if (from !== 'search' && from !== 'profile') {
        router.back();
      }
      // console.log('Current page:', currentRoute);
    } else {
      router.push('/home'); // fallback to home if no history
    }
  };
  return (
    <TouchableOpacity
      className='absolute bottom-10 left-0 right-0 mt-10 mx-5 bg-slate-900 rounded-xl py-3.5 flex flex-row  items-center justify-center z-50'
      onPress={handleGoBack}
      activeOpacity={0.7}
      accessibilityRole='button'
      accessibilityLabel='Go back'
      accessibilityHint='Navigates to the previous screen'
    >
      <Image
        source={icons.arrow}
        className='size-5 mr-2 rotate-180'
        tintColor='#ff0031'
      />
      <Text className='text-accent' style={{ fontFamily: 'outfit-bold' }}>
        Go back
      </Text>
    </TouchableOpacity>
  );
};

export default GoBackBtn;

const styles = StyleSheet.create({});
