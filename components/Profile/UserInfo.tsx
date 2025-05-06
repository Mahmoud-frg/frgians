import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-expo';

const UserInfo = () => {
  const { user } = useUser();

  return (
    <View className='flex justify-center items-center mt-5'>
      <Image
        source={{ uri: user?.imageUrl }}
        className='w-36 h-36 rounded-full'
      />
      <Text className='text-3xl mt-3' style={{ fontFamily: 'outfit-bold' }}>
        {user?.fullName}
      </Text>
      <Text
        className='w-auto mt-3 text-lg rounded-3xl text-center bg-title text-white px-5 py-2 font-normal'
        style={{ fontFamily: 'outfit-bold' }}
      >
        {user?.primaryEmailAddress?.emailAddress}
      </Text>
    </View>
  );
};

export default UserInfo;

const styles = StyleSheet.create({});
