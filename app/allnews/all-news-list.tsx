import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import GoBackBtn from '@/components/GoBackBtn';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import NewsListCard from '@/components/NewsList/NewsListCard';

const AllNewsList = () => {
  const [news, setNews] = useState<newsListType[]>([]);
  const [loading, setLoading] = useState(false);

  const GetAllNewsList = async () => {
    setLoading(true);

    setNews([]);
    const q = query(collection(db, 'newsList'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as newsListType;
      setNews((prev) => [...prev, docdata]);
    });
    setLoading(false);
  };

  useEffect(() => {
    GetAllNewsList();
  }, []);

  return (
    <View className='bg-primary flex-1'>
      {/* Logo */}
      <View className='flex flex-row mx-5 justify-between items-center'>
        <Text
          className='color-title text-3xl'
          style={{ fontFamily: 'outfit-bold' }}
        >
          All News List
        </Text>

        <Logo />
      </View>
      {news?.length > 0 && loading == false ? (
        <>
          <View className='flex flex-row ml-5 mb-3'>
            <Text
              className='text-lg color-slate-600'
              style={{ fontFamily: 'outfit-medium' }}
            >
              There are
            </Text>
            <Text
              className='color-title text-xl mx-1'
              style={{ fontFamily: 'outfit-bold' }}
            >
              {news?.length}
            </Text>
            <Text
              className='text-lg color-slate-600'
              style={{ fontFamily: 'outfit-medium' }}
            >
              news in the list.
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            <FlatList
              data={news.reverse()}
              renderItem={({ item, index }) => (
                <NewsListCard
                  key={index}
                  news={item}
                />
              )}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              onRefresh={GetAllNewsList}
              refreshing={loading}
            />
          </ScrollView>
        </>
      ) : loading ? (
        <ActivityIndicator
          size='large'
          color='#ff0031'
          className='mt-[50%] self-center'
        />
      ) : (
        <Text
          className='text-2xl text-light-300 text-center mt-[50%]'
          style={{ fontFamily: 'outfit-bold' }}
        >
          No news Found
        </Text>
      )}

      {/* Go back button */}
      <GoBackBtn />
    </View>
  );
};

export default AllNewsList;

const styles = StyleSheet.create({});
