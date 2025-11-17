import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import { useNavigationState, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

type PersonsListCardProps = {
  person: personsListType;
};

const PersonsListCard = ({ person }: PersonsListCardProps) => {
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
      params: { personid: code, from: 'home' },
    });
  };

  return (
    <TouchableOpacity
      onPress={PersonCardPressHandler(person.code.toString())}
      className='mx-2'
      activeOpacity={0.7}
    >
      <View
        className='flex flex-row w-full m-2  bg-catPersons rounded-xl items-center self-center'
        style={styles.shadow}
      >
        <Image
          source={
            person?.imageUrl === ''
              ? images.FRGiansBG
              : { uri: person?.imageUrl }
          }
          className='w-32 h-32 rounded-2xl m-1 bg-secondary'
        />
        <View className='w-[65%] m-3'>
          <Text
            className='text-2xl text-darkest'
            style={{ fontFamily: 'outfit-bold' }}
          >
            {person?.name}
          </Text>
          <Text
            className='text-l color-[#711B25]'
            style={{ fontFamily: 'outfit-medium' }}
          >
            {person?.title}
          </Text>
          <Text
            className='text-l color-[#F05727]'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Joined @ {person?.joinDate}
          </Text>
          <View className='flex flex-row justify-between items-center'>
            <Text
              className='text-l color-[#5D626C] w-[75%]'
              style={{ fontFamily: 'outfit-semi-bold' }}
            >
              {person?.frgMail}
            </Text>
            <View className='w-auto h-auto px-2 rounded-full bg-dataHolder text-center items-center content-center self-center'>
              <Text
                className='text-2xl color-coTitle'
                style={{ fontFamily: 'outfit-extra-bold' }}
              >
                {person?.code}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PersonsListCard;

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
