import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/configs/FirebaseConfig';
import { router } from 'expo-router';
import NewsCardItem from '../News/NewsCardItem';
import { images } from '@/constants/images';

const NewsList = () => {
  const [news, setNews] = useState<newsListType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const GetNewsList = async () => {
    try {
      setLoading(true);
      // 🔁 Order by `index` descending to get the last news entries
      const q = query(
        collection(db, 'newsList'),
        orderBy('index', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const newsData: newsListType[] = [];
      querySnapshot.forEach((doc) => {
        newsData.push(doc.data() as newsListType);
      });
      // Optional: reverse to show oldest of the last 5 first
      setNews(newsData.reverse());
      setCurrentIndex(newsData.length - 1); // last item in this new subset
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetNewsList();
    setCurrentIndex(news.length - 1);
  }, []);

  useEffect(() => {
    if (news.length === 0) return;

    startAutoScroll();

    return () => {
      stopAutoScroll();
    };
  }, [news]);

  useEffect(() => {
    if (flatListRef.current && news.length > 0) {
      const reversedIndex = news.length - 1 - currentIndex;
      flatListRef.current.scrollToIndex({
        index: reversedIndex,
        animated: true,
      });
    }
  }, [currentIndex]);

  const startAutoScroll = () => {
    stopAutoScroll(); // clear prev if any
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex - 1 >= 0 ? prevIndex - 1 : news.length - 1
      );
    }, 5000);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const onViewAllHandler = () => {
    router.push(`/allnews/all-news-list`);
  };

  const handleNewsPress = (index: number) => {
    setCurrentIndex(index);
    startAutoScroll(); // restart from this point
  };

  return (
    <>
      {loading ? (
        <ActivityIndicator
          size='large'
          color='#ff0031'
          className='mt-[50%] self-center'
        />
      ) : news.length > 0 ? (
        <View
          className='p-2 mt-5'
          style={styles.shadow}
        >
          <View className='flex flex-row justify-between p-1'>
            <Text
              className='text-2xl font-semibold color-title pl-4'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Our News
            </Text>
            <TouchableOpacity
              onPress={() => onViewAllHandler()}
              className='mr-5'
            >
              <Text
                className='color-slate-600'
                style={{ fontFamily: 'outfit-medium' }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View className='bg-zinc-200 pb-3 border-2 border-zinc-400 rounded-xl'>
            {/* Latest News */}
            <View>
              <View className='w-full h-16 p-4 bg-title rounded-t-xl justify-center'>
                <Text
                  className='text-3xl text-white'
                  style={{ fontFamily: 'outfit-extra-bold' }}
                >
                  {news[currentIndex]?.title}
                </Text>
              </View>

              <Image
                source={
                  news[currentIndex]?.imgUrl === ''
                    ? images.FRGwhite
                    : { uri: news[currentIndex]?.imgUrl }
                }
                className='w-[96%] h-80 my-3 self-center rounded-xl'
                resizeMode='cover'
              />

              <View className='w-[90%] justify-center mx-5 my-2'>
                <Text
                  className='text-lg text-title'
                  style={{ fontFamily: 'outfit-regular' }}
                >
                  {news[currentIndex]?.date}
                </Text>

                <Text
                  className='text-2xl text-dark-200'
                  style={{ fontFamily: 'outfit-extra-bold' }}
                >
                  {news[currentIndex]?.head}
                </Text>

                <Text
                  className='w-full text-lg color-slate-600'
                  style={{ fontFamily: 'outfit-regular' }}
                >
                  {news[currentIndex]?.body}
                </Text>
              </View>
            </View>

            {/* Other News */}
            <FlatList
              data={[...news].reverse()}
              keyExtractor={(item, index) =>
                item.index?.toString() || index.toString()
              }
              renderItem={({ item, index }) => {
                const originalIndex = news.length - 1 - index; // because the list is reversed
                return (
                  <NewsCardItem
                    news={item}
                    onNewsPress={() => handleNewsPress(originalIndex)}
                    highlighted={originalIndex === currentIndex}
                    // onNewsPress={() =>
                    //   router.push({
                    //     pathname: '/newsdetails/[newsid]',
                    //     params: { newsid: item.index },
                    //   })
                    // }
                  />
                );
              }}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              className='mt-2'
              onRefresh={GetNewsList}
              refreshing={loading}
              ref={flatListRef}
            />
          </View>
        </View>
      ) : (
        <Text className='text-center text-gray-500 mt-10'>No news found.</Text>
      )}
    </>
  );
};

export default NewsList;

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
