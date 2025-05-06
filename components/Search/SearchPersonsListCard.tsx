import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import { useNavigationState } from '@react-navigation/native';

type PersonsListCardProps = {
  person: personsListType;
};

const SearchPersonsListCard = ({ person }: PersonsListCardProps) => {
  const { code, imageUrl, name } = person;

  const router = useRouter();
  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  const PersonCardPressHandler = (code: string) => () => {
    // console.log('Current page:', currentRoute); // logs correct page at render time
    router.push({
      pathname: '/persondetails/[personid]',
      params: { personid: code, from: 'search' },
    });
  };

  return (
    <TouchableOpacity
      onPress={PersonCardPressHandler(person.code.toString())}
      className='mx-2'
      activeOpacity={0.7}
    >
      <View
        className='flex flex-row w-full m-2  bg-white rounded-xl items-center self-center'
        style={styles.shadow}
      >
        <Image
          source={
            person?.imageUrl === ''
              ? images.FRGwhite
              : { uri: person?.imageUrl }
          }
          className='w-32 h-32 rounded-2xl m-1'
        />
        <View className='w-[70%] m-3'>
          <Text
            className='text-2xl text-secondary'
            style={{ fontFamily: 'outfit-bold' }}
          >
            {person?.name}
          </Text>
          <Text
            className='text-l color-slate-600'
            style={{ fontFamily: 'outfit-medium' }}
          >
            {person?.title}
          </Text>
          <Text
            className='text-l color-title'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Joined @ {person?.joinDate}
          </Text>
          <Text
            className='text-l color-secondary'
            style={{ fontFamily: 'outfit-semi-bold' }}
          >
            {person?.frgMail}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchPersonsListCard;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
