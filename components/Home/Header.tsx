import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

const Header = () => {
  const { user } = useUser();

  return (
    <View className='p-10 bg-primary  rounded-t-3xl'>
      <View className='flex flex-row items-center gap-5'>
        <Image
          source={{ uri: user?.imageUrl }}
          className='w-14 h-14 rounded-full'
        />
        <View className='flex flex-row items-center gap-1'>
          <Text className='text-xl font-semibold color-title'>Hi,</Text>
          <Text className='text-secondary text-xl font-bold'>
            {user?.fullName}
          </Text>
        </View>
      </View>
      {/* Search bar */}
      <View
        className='flex flex-row items-center mt-3 pl-3 gap-3 bg-white rounded-2xl'
        onTouchStart={() => router.push('/(tabs)/search')}
      >
        <Ionicons name='search' size={24} color={Colors.primary} />
        <TextInput
          placeholder='Search...'
          className='text-lg w-full'
          style={{ fontFamily: 'outfit-regular' }}
        />
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
