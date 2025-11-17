import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import { useNavigationState, useNavigation } from '@react-navigation/native';
import {
  updateDoc,
  arrayUnion,
  doc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';

type NewsListCardProps = {
  news: newsListType;
  userCode: string | null;
};

const NewsListCard = ({ news, userCode }: NewsListCardProps) => {
  const router = useRouter();
  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  const isUnseen = !news.seenBy?.includes(userCode || '');

  const markNewsAsSeen = async (newsId: string, userId: string) => {
    const newsRef = doc(db, 'newsList', newsId);
    await updateDoc(newsRef, {
      seenBy: arrayUnion(userId),
    });
  };

  const NewsCardPressHandler = (id: number) => () => {
    if (!userCode) return; // Prevent calling if userCode is not available
    markNewsAsSeen(id.toString(), userCode);

    // console.log('Current page:', currentRoute); // logs correct page at render time
    router.push({
      pathname: '/newsdetails/[newsid]',
      params: { newsid: id },
    });
  };

  return (
    <TouchableOpacity
      onPress={NewsCardPressHandler(Number(news.index))}
      className='mx-2'
      activeOpacity={0.7}
    >
      <View
        className={`flex flex-row w-full rounded-2xl mt-2 items-center self-center ${
          isUnseen ? 'bg-search' : 'bg-transparent'
        }`}
      >
        <Image
          source={
            news?.imgUrl === '' ? images.FRGwhiteBG : { uri: news?.imgUrl }
          }
          className='w-44 h-28 rounded-2xl m-1'
        />
        <View className='w-[70%] m-3'>
          <Text
            className='text-2xl text-coTitle w-[75%]'
            style={{ fontFamily: 'outfit-bold' }}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {news?.title}
          </Text>
          <Text
            className='text-l color-secondary w-[75%]'
            style={{ fontFamily: 'outfit-medium' }}
            numberOfLines={2}
            ellipsizeMode='tail'
          >
            {news?.head}
          </Text>
          <Text
            className='text-l color-coSecondary'
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
