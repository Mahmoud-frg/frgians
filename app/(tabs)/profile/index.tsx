import { View, Text, ScrollView, Image, RefreshControl } from 'react-native';
import React, { useCallback, useState } from 'react';
import Logo from '@/components/Logo';
import UserInfo from '@/components/Profile/UserInfo';
import MenuList from '@/components/Profile/MenuList';
import SignOutButton from '@/components/SignOutButton';
import AnimatedCard from '@/components/Home/AnimatedCard';
import { images } from '@/constants/images';
import { LinearGradient } from 'expo-linear-gradient';

const profile = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    // 🔄 Fetch latest profile data here (example)
    try {
      // await fetchUserProfile();
    } catch (err) {
      console.error(err);
    }

    setRefreshing(false);
  }, []);

  return (
    <View className='flex-1 bg-darkest'>
      <LinearGradient
        colors={[
          '#001920', // deep navy black (bottom base)
          '#00181f', // dark desaturated blue
          '#093341', // mid-indigo layer
          '#1E4451', // soft vibrant blue
          '#2B505D', // light glow blue (top-right)
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]} // smooth transitions
        start={{ x: 0, y: 1 }} // bottom left
        end={{ x: 1, y: 0 }} // top right
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        {/* Logo */}
        <View className='flex flex-row mx-5 justify-between items-center'>
          <Text
            className='color-coTitle text-3xl'
            style={{ fontFamily: 'outfit-bold' }}
          >
            Profile
          </Text>

          <Logo />
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {/* User intro */}
          <UserInfo />

          {/* Menu list */}
          <MenuList />

          {/* Sign out */}
          <SignOutButton />

          {/* Created by Mahmoud Gamal */}
          <AnimatedCard />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default profile;
