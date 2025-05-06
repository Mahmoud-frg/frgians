import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { images } from '@/constants/images';

type PersonCardItemProps = {
  onPersonPress: (code: number, name: string) => void;
  person: personsListType;
};

const PersonCardItem = ({ onPersonPress, person }: PersonCardItemProps) => {
  const { code, imageUrl, name } = person;

  return (
    <TouchableOpacity
      onPress={() => onPersonPress(code, name)}
      activeOpacity={0.7}
    >
      <View
        className='w-52 h-64 ml-2 mr-2 mb-5 p-2 bg-white rounded-xl'
        style={styles.shadow}
      >
        <Image
          source={
            person?.imageUrl === ''
              ? images.FRGwhite
              : { uri: person?.imageUrl }
          }
          className='w-32 h-32 mt-5 self-center rounded-full'
        />
        <View className='mt-2'>
          <Text
            className='text-xl mt-1 text-center text-secondary'
            style={{ fontFamily: 'outfit-bold' }}
          >
            {person?.name}
          </Text>
          <Text
            className='text-sm text-center color-slate-600'
            style={{ fontFamily: 'outfit-regular' }}
          >
            {person?.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PersonCardItem;

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
