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
        className='flex flex-row w-full m-2 bg-darkest rounded-xl items-center self-center'
        style={styles.shadow}
      >
        <Image
          source={imageUrl ? { uri: imageUrl } : images.FRGiansBG}
          className='w-32 h-32 rounded-2xl m-1 bg-white'
        />
        <View className='w-[65%] m-3'>
          <Text
            className='text-2xl text-secondary'
            style={{ fontFamily: 'outfit-bold' }}
          >
            {name}
          </Text>
          <Text
            className='text-l color-coSecondary'
            style={{ fontFamily: 'outfit-medium' }}
          >
            {person.title}
          </Text>
          <Text
            className='text-l color-coTitle'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Joined @ {person.joinDate}
          </Text>
          <View className='flex flex-row justify-between items-center'>
            <Text
              className='w-[75%] text-l color-secondary'
              style={{ fontFamily: 'outfit-semi-bold' }}
            >
              {person.frgMail}
            </Text>
            <View className='w-auto h-auto px-2 rounded-full bg-dataHolder text-center content-center items-center self-center'>
              <Text
                className='text-2xl color-coTitle'
                style={{ fontFamily: 'outfit-extra-bold' }}
              >
                {code}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// 🧠 Wrap with memo to prevent unnecessary re-renders
export default React.memo(SearchPersonsListCard);

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
