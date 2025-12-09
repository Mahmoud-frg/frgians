import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/configs/FirebaseConfig';
import { router } from 'expo-router';
import NewsCardItem from '../News/NewsCardItem';
import { images } from '@/constants/images';
import { Colors } from '@/constants/Colors';
import { useUser } from '@clerk/clerk-expo';

const NewsList = () => {
  const { user } = useUser();

  const [news, setNews] = useState<newsListType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchUserCode = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const userEmail = user.primaryEmailAddress.emailAddress;
      const personsRef = collection(db, 'personsList');
      const q = query(personsRef, where('frgMail', '==', userEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setCode(doc.id);
      }
    };

    fetchUserCode();
  }, [user]);

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
      const screenWidth = Dimensions.get('window').width;
      const itemWidth = 200; // Approximate width of each news card
      const offset = itemWidth * reversedIndex - (screenWidth - itemWidth) / 2;

      flatListRef.current.scrollToOffset({
        offset: Math.max(0, offset),
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

  const markNewsAsSeen = async (newsId: string, userId: string) => {
    const newsRef = doc(db, 'newsList', newsId);
    await updateDoc(newsRef, {
      seenBy: arrayUnion(userId),
    });
  };

  const NewsPressHandler = (id: number) => () => {
    if (!code) return; // Prevent calling if userCode is not available
    markNewsAsSeen(id.toString(), code);

    // console.log('Current page:', currentRoute); // logs correct page at render time
    router.push({
      pathname: '/newsdetails/[newsid]',
      params: { newsid: id },
    });
  };

  return (
    <View className='w-full h-auto py-4 mt-1'>
      {loading ? (
        <ActivityIndicator
          size='large'
          color={Colors.coSecondary}
          className='mt-[50%] self-center'
        />
      ) : news.length > 0 ? (
        <View
          className='p-2'
          style={styles.shadow}
        >
          <View className='flex flex-row justify-between p-1'>
            <Text
              className='text-2xl font-semibold color-title pl-4'
              style={{ fontFamily: 'outfit-bold' }}
            >
              News
            </Text>
            <TouchableOpacity
              onPress={() => onViewAllHandler()}
              className='mr-5 bg-seeAll rounded-full items-center justify-center px-3 py-1'
            >
              <Text
                className='color-darker'
                style={{ fontFamily: 'outfit-medium' }}
              >
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View className='bg-news pb-3 rounded-2xl'>
            {/* Latest News */}
            <View>
              <View className='w-full h-auto p-4 rounded-t-2xl justify-center'>
                <ImageBackground
                  source={images.FRGians}
                  tintColor='#0a3442'
                  className='absolute top-2 right-2 self-end w-16 h-16 rotate-180 overflow-hidden'
                />
                <Text
                  className='text-3xl text-iconBG w-[90%]'
                  style={{ fontFamily: 'outfit-extra-bold' }}
                >
                  {news[currentIndex]?.title}
                </Text>
              </View>

              <TouchableOpacity
                onPress={NewsPressHandler(news[currentIndex]?.index as number)}
                className='w-full h-80 my-3 self-center rounded-3xl'
                activeOpacity={0.7}
              >
                <Image
                  source={
                    news[currentIndex]?.imgUrl === ''
                      ? images.FRGwhiteBG
                      : { uri: news[currentIndex]?.imgUrl }
                  }
                  className='w-full h-80 my-3 self-center rounded-3xl'
                  resizeMode='cover'
                />
              </TouchableOpacity>

              <View className='w-[90%] justify-center mx-5 my-2'>
                <Text
                  className='text-lg text-date'
                  style={{ fontFamily: 'outfit-regular' }}
                >
                  {news[currentIndex]?.date}
                </Text>

                <Text
                  className='text-2xl text-iconBG'
                  style={{
                    fontFamily: 'outfit-extra-bold',
                    writingDirection:
                      news[currentIndex]?.head &&
                      /^[\u0600-\u06FF]/.test(news[currentIndex]?.head.trim())
                        ? 'rtl'
                        : 'ltr',
                    textAlign:
                      news[currentIndex]?.head &&
                      /^[\u0600-\u06FF]/.test(news[currentIndex]?.head.trim())
                        ? 'right'
                        : 'left',
                  }}
                >
                  {news[currentIndex]?.head}
                </Text>

                <Text
                  className='w-full text-lg color-title'
                  style={{
                    fontFamily: 'outfit-regular',
                    writingDirection:
                      news[currentIndex]?.body &&
                      /^[\u0600-\u06FF]/.test(news[currentIndex]?.body.trim())
                        ? 'rtl'
                        : 'ltr',
                    textAlign:
                      news[currentIndex]?.body &&
                      /^[\u0600-\u06FF]/.test(news[currentIndex]?.body.trim())
                        ? 'right'
                        : 'left',
                  }}
                  numberOfLines={4}
                  ellipsizeMode='tail'
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
    </View>
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
