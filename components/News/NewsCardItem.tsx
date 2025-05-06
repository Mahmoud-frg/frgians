import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { images } from '@/constants/images';
import { rgbaColor } from 'react-native-reanimated/lib/typescript/Colors';

type NewsCardItemProps = {
  news: newsListType;
  onNewsPress: (index: number) => void;
  highlighted?: boolean;
};

const NewsCardItem = ({
  news,
  onNewsPress,
  highlighted,
}: NewsCardItemProps) => {
  return (
    <TouchableOpacity
      onPress={() => onNewsPress(news?.index)}
      activeOpacity={0.7}
      style={[
        styles.card,
        highlighted && {
          paddingTop: 10,
          backgroundColor: 'rgba(0,0,0,0.25)',
        },
      ]}
    >
      <View className='w-52 h-52 mx-2 rounded-xl'>
        <View className='bg-white rounded-2xl w-full h-32'>
          <Image
            source={
              news?.imgUrl === '' ? images.FRGwhite : { uri: news?.imgUrl }
            }
            className='w-full h-full self-center rounded-2xl'
            resizeMode='cover'
          />
        </View>
        <View className='my-2'>
          <Text
            className='text-xl text-center text-secondary'
            style={{ fontFamily: 'outfit-bold' }}
          >
            {news?.title}
          </Text>
          <Text
            className='text-sm text-center color-slate-600'
            style={{ fontFamily: 'outfit-regular' }}
          >
            {news?.head}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NewsCardItem;

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
  card: {
    borderRadius: 10,
  },
  highlighted: { backgroundColor: 'rgba(0,0,0,0.25)' },
});
