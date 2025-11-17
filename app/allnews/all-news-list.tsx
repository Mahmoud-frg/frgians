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
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import NewsListCard from '@/components/NewsList/NewsListCard';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';

const AllNewsList = () => {
  const [news, setNews] = useState<newsListType[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const [code, setCode] = useState<string | null>(null);

  const GetAllNewsList = async () => {
    setLoading(true);

    setNews([]);
    const q = query(collection(db, 'newsList'), orderBy('index', 'desc'));
    const querySnapshot = await getDocs(q);
    // querySnapshot.forEach((doc) => {
    //   const docdata = doc.data() as newsListType;
    //   setNews((prev) => [...prev, docdata]);
    // });
    const sortedNews = querySnapshot.docs
      .map((doc) => doc.data() as newsListType)
      .sort((a, b) => (b.index ?? 0) - (a.index ?? 0)); // highest index first
    setNews(sortedNews);
    setLoading(false);
  };

  useEffect(() => {
    GetAllNewsList();
  }, []);

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

  return (
    <View className='bg-primary flex-1'>
      <LinearGradient
        colors={[
          '#001920', // deep navy black (bottom base)
          '#00181f', // dark desaturated blue
          '#093341', // mid-indigo layer
          '#1E4451', // soft vibrant blue
          '#2B505D', // light glow blue (top-right)
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]} // smooth transitions
        start={{ x: 0, y: 1 }} // bottom left
        end={{ x: 1, y: 0 }} // top right
        style={{ height: '100%', width: '100%' }}
      >
        {/* Logo */}
        <View className='flex flex-row mx-5 justify-between items-center'>
          <Text
            className='color-coTitle text-3xl'
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
                className='text-lg color-coTitle'
                style={{ fontFamily: 'outfit-medium' }}
              >
                There are
              </Text>
              <Text
                className='color-coSecondary text-xl mx-1'
                style={{ fontFamily: 'outfit-bold' }}
              >
                {news?.length}
              </Text>
              <Text
                className='text-lg color-coTitle'
                style={{ fontFamily: 'outfit-medium' }}
              >
                news in the list.
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
              <FlatList
                data={news}
                keyExtractor={(item, i) => (item.index ?? i).toString()}
                renderItem={({ item, index }) => (
                  <NewsListCard
                    news={item}
                    userCode={code}
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
            color={Colors.coSecondary}
            className='mt-[50%] self-center'
          />
        ) : (
          <Text
            className='text-2xl text-coTitle text-center mt-[50%]'
            style={{ fontFamily: 'outfit-bold' }}
          >
            No news Found
          </Text>
        )}

        {/* Go back button */}
        <GoBackBtn />
      </LinearGradient>
    </View>
  );
};

export default AllNewsList;

const styles = StyleSheet.create({});
