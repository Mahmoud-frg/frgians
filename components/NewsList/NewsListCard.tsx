import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import { useNavigationState, useNavigation } from '@react-navigation/native';

type NewsListCardProps = {
  news: newsListType;
};

const NewsListCard = ({ news }: NewsListCardProps) => {
  const router = useRouter();
  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  const NewsCardPressHandler = (id: number) => () => {
    // console.log('Current page:', currentRoute); // logs correct page at render time
    router.push({
      pathname: '/newsdetails/[newsid]',
      params: { newsid: id },
    });
  };

  return (
    <TouchableOpacity
      onPress={NewsCardPressHandler(news.index)}
      className='mx-2'
      activeOpacity={0.7}
    >
      <View className='flex flex-row w-full rounded-lg items-center self-center'>
        <Image
          source={news?.imgUrl === '' ? images.FRGwhite : { uri: news?.imgUrl }}
          className='w-44 h-28 rounded-2xl m-1'
        />
        <View className='w-[70%] m-3'>
          <Text
            className='text-2xl text-secondary'
            style={{ fontFamily: 'outfit-bold' }}
          >
            {news?.title}
          </Text>
          <Text
            className='text-l color-slate-600'
            style={{ fontFamily: 'outfit-medium' }}
          >
            {news?.head}
          </Text>
          <Text
            className='text-l color-title'
            style={{ fontFamily: 'outfit-medium' }}
          >
            {news?.date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NewsListCard;

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
