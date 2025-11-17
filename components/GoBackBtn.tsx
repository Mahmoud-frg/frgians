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
import { Colors } from '@/constants/Colors';

const GoBackBtn = () => {
  const router = useRouter();

  const { code, from } = useLocalSearchParams<{
    code: string;
    from?: string;
  }>();

  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  const handleGoBack = () => {
    if (router.canGoBack()) {
      if (from === 'search') {
        router.replace('/search');
      }
      if (from === 'profile') {
        router.replace('/profile');
      }
      if (from === 'update-my-info') {
        router.replace({
          pathname: '/persondetails/[personid]',
          params: { personid: code, from: 'profile' },
        });
      }
      if (from === 'update-person') {
        router.replace({
          pathname: '/persondetails/[personid]',
          params: { personid: code, from: 'search' },
        });
      }
      if (from === 'update-leader-info') {
        router.replace({
          pathname: '/leaderdetails/[leaderid]',
          params: { leaderid: code, from: 'home' },
        });
      }
      if (from === 'profile-add-news') {
        router.replace({
          pathname: '/news/add-news',
          params: { from: 'profile' },
        });
      }
      if (
        from !== 'search' &&
        from !== 'profile' &&
        from !== 'update-my-info' &&
        from !== 'update-person' &&
        from !== 'update-leader-info' &&
        from !== 'profile-add-news'
      ) {
        router.back();
      }
      console.log('Current page:', currentRoute);
    } else {
      router.replace('/home'); // fallback to home if no history
    }
  };
  return (
    <TouchableOpacity
      className='absolute bottom-0 right-0 w-auto mx-5 my-5 bg-backBtn rounded-full px-2 py-3.5 flex flex-row  items-center justify-center z-50'
      onPress={handleGoBack}
      activeOpacity={0.7}
      accessibilityRole='button'
      accessibilityLabel='Go back'
      accessibilityHint='Navigates to the previous screen'
    >
      <Image
        source={icons.arrow}
        className='size-5 mr-2 rotate-180'
        tintColor='#000000'
      />
      <Text
        className='text-darkest'
        style={{ fontFamily: 'outfit-bold' }}
      >
        Go back
      </Text>
    </TouchableOpacity>
  );
};

export default GoBackBtn;

const styles = StyleSheet.create({});
