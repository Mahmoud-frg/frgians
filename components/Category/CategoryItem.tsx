import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';

type CategoryItemProps = {
  onCategoryPress: (id: number, name: string) => void;
  category: CategoryType;
};

const CategoryItem = ({ onCategoryPress, category }: CategoryItemProps) => {
  const { id, iconUrl, name } = category;
  return (
    <TouchableOpacity
      onPress={() => onCategoryPress(id, name)}
      className='ml-5'
      activeOpacity={0.7}
    >
      <View
        className='w-32 h-32 mr-2 mb-5 p-3 items-center bg-iconBG rounded-2xl'
        style={styles.shadow}
      >
        <Image
          source={{ uri: iconUrl }}
          className='w-14 h-14'
          resizeMode='cover'
          tintColor='#ffffff'
        />
        <Text
          className='text-sm mt-3 text-center color-secondary'
          style={{ fontFamily: 'outfit-regular' }}
          numberOfLines={2}
        >
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryItem;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
