import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { images } from '@/constants/images';
import { useNavigationState, useNavigation } from '@react-navigation/native';

type BranchesListCardProp = {
  branch: branchesListType;
};

const BranchesListCard = ({ branch }: BranchesListCardProp) => {
  const router = useRouter();
  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  const BranchCardPressHandler = (id: number) => () => {
    router.push({
      pathname: '/branchdetails/[branch]',
      params: { branch: id },
    });
  };

  return (
    <TouchableOpacity
      onPress={BranchCardPressHandler(branch.id as number)}
      activeOpacity={0.7}
      className='m-2'
      style={{ width: '47%' }} // Half row with spacing
    >
      <View className='rounded-lg items-center'>
        <Image
          source={
            branch?.imgUrl === '' ? images.FRGwhiteBG : { uri: branch?.imgUrl }
          }
          className='w-full h-28 rounded-2xl'
          resizeMode='cover'
        />
        <Text
          className='text-center text-coTitle mt-2'
          style={{ fontFamily: 'outfit-bold', fontSize: 16 }}
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {branch?.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BranchesListCard;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
