import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import Logo from '@/components/Logo';
import UserInfo from '@/components/Profile/UserInfo';
import MenuList from '@/components/Profile/MenuList';
import SignOutButton from '@/components/SignOutButton';

const profile = () => {
  return (
    <ScrollView>
      {/* Logo */}
      <View className='flex flex-row mx-5 justify-between items-center'>
        <Text
          className='color-title text-3xl'
          style={{ fontFamily: 'outfit-bold' }}
        >
          Profile
        </Text>

        <Logo />
      </View>

      {/* User intro */}
      <UserInfo />

      {/* Menu list */}
      <MenuList />

      {/* Sign out */}
      <SignOutButton />

      {/* Created by Mahmoud Gamal */}
      <Text
        className='text-lg color-slate-600 self-center my-10'
        style={{ fontFamily: 'outfit-medium' }}
      >
        Developed by FRG | IT department @ 2025
      </Text>
    </ScrollView>
  );
};

export default profile;
