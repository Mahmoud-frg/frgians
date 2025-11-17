import {
  View,
  Image,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  StyleSheet,
  Text,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import Header from '@/components/Home/Header';
import SliderPersons from '@/components/Home/SliderPersons';
import Category from '@/components/Home/Category';
import PersonsList from '@/components/Home/PersonsList';
import { images } from '@/constants/images';
import LogoHome from '@/components/Home/LogoHome';
import NewsList from '@/components/Home/News';
import useNotification from '@/context/NotificationContext';
import { ThemedText } from '@/components/ThemedText';
import * as Updates from 'expo-updates';
import { router, useLocalSearchParams } from 'expo-router';
import AppLoadingScreen from '@/components/LoadingScreen/AppLoadingScreen';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import { Button } from 'react-native';
import { TouchableOpacity } from 'react-native';
import WaveCard from '@/components/Home/WaveCard';
import WaveBackground from '@/components/Home/WaveBackground';
import MatrixRain from '@/components/Home/MatrixRain';
import GlassCard from '@/components/Home/GlassCard';
import AnimatedCard from '@/components/Home/AnimatedCard';
import AddFieldButton from '@/components/AddFieldBtn';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import UnderHead from '@/components/Home/UnderHead';
import CurvedHeader from '@/components/Home/CurvedHeader';
import SliderBrands, { BrandsList } from '@/components/Home/SliderBrands';

import { tabVisibility } from '@/app/(tabs)/_layout'; // 👈 adjust import path

let lastOffset = 0; // track last scroll position

const handleScroll = (event: any) => {
  const currentOffset = event.nativeEvent.contentOffset.y;
  const diff = currentOffset - lastOffset;

  // Detect scroll direction (down = hide, up = show)
  if (Math.abs(diff) > 10) {
    if (diff > 0) {
      // scrolling down
      tabVisibility.setVisible?.(false);
    } else {
      // scrolling up
      tabVisibility.setVisible?.(true);
    }
  }

  lastOffset = currentOffset;
};

const Home = () => {
  const { user } = useUser();
  const { loading, key } = useLocalSearchParams();
  const { expoPushToken, notification, error } = useNotification() ?? {};
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } =
    Updates.useUpdates();

  const [isLoading, setIsLoading] = useState(loading === 'true');
  const [refreshing, setRefreshing] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchCode = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const userEmail = user.primaryEmailAddress.emailAddress;

      const personsRef = collection(db, 'personsList');
      const q = query(personsRef, where('frgMail', '==', userEmail));

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setCode(doc.id); // document ID is the code
      }
    };

    fetchCode();
  }, [user]);

  // Changing Document id firebase
  const changeDocumentId = async (
    collectionPath: string,
    oldId: string,
    newId: string
  ) => {
    const oldDocRef = doc(db, collectionPath, oldId);
    const newDocRef = doc(db, collectionPath, newId);

    const snapshot = await getDoc(oldDocRef);

    if (snapshot.exists()) {
      const data = snapshot.data();

      await setDoc(newDocRef, data); // write to new ID
      await deleteDoc(oldDocRef); // delete old document
      console.log('Document ID changed successfully.');
    } else {
      console.log('Old document does not exist.');
    }
  };

  useEffect(() => {
    if (isUpdatePending) {
      handleUpdateReload();
    }
  }, [isUpdatePending]);

  const handleUpdateReload = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      Alert.alert('Error applying update');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setIsLoading(true);

    try {
      // Simulate a 2-second refresh
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (e) {
      Alert.alert('Failed to refresh');
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loading === 'true') {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000); // Simulate data loading
      return () => clearTimeout(timer);
    }
  }, [loading, key]); // <-- react to key change

  // Un seen news
  const getUnseenNewsCount = async (userId: string) => {
    const snapshot = await getDocs(collection(db, 'newsList'));
    let unseenCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.seenBy || !data.seenBy.includes(userId)) {
        unseenCount += 1;
      }
    });

    return unseenCount;
  };

  useEffect(() => {
    if (!code) return; // only run if we actually have a code

    const fetchUnseenCount = async () => {
      const count = await getUnseenNewsCount(code);
      setCount(count);
    };

    fetchUnseenCount();
  }, [code]);

  const UnSeenNewsHandler = () => {
    router.push(`/allnews/all-news-list`);
  };

  if (isLoading) {
    return <AppLoadingScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <View className='justify-center bg-darkest'>
      {/* <LinearGradient
        colors={[
          '#0B1022', // deep navy black (bottom base)
          '#17203F', // dark desaturated blue
          '#2C3F73', // mid-indigo layer
          '#4F73D1', // soft vibrant blue
          '#B4D1F6', // light glow blue (top-right)
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]} // smooth transitions
        start={{ x: 0, y: 1 }} // bottom left
        end={{ x: 1, y: 0 }} // top right
        style={{ height: '100%', width: '100%' }}
      > */}
      <LogoHome scrollY={scrollY} />

      {count > 0 && (
        <TouchableOpacity
          className='absolute top-0 left-0 w-12 h-12 p-1 mt-3 ml-5 bg-search rounded-full z-30'
          activeOpacity={0.8}
          onPress={() => UnSeenNewsHandler()}
        >
          <Ionicons
            name='notifications-outline'
            size={35}
            color='white'
          />

          <View className='absolute -top-1 -right-2 rounded-full bg-notification w-6 h-6 justify-center items-center'>
            <Text
              className='text-coTitle text-sm'
              style={{ fontFamily: 'outfit-bold' }}
            >
              {count}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* <Header scrollY={scrollY} /> */}
      {/* <UnderHead scrollY={scrollY} /> */}

      <Animated.ScrollView
        style={{
          zIndex: 0, // higher, so it's on top
          position: 'relative', // important for zIndex to work
          // paddingTop: 200,
          backgroundColor: '#ffffff',
        }}
        // onScroll={Animated.event(
        //   [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        //   { useNativeDriver: true } // ✅ use native driver for performance
        // )}
        onScroll={(event) => {
          // pass event to both animations and visibility handler
          scrollY.setValue(event.nativeEvent.contentOffset.y);
          handleScroll(event);
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Use this button only to change some document id */}
        {/* <Button
            title='Press to change document id'
            onPress={() => changeDocumentId('personsList', '99999', '7777')}
          /> */}

        {/* Use this button to add new field to all documents in a certain collection */}
        {/* <AddFieldButton /> */}

        {/* <WaveBackground /> */}

        {/* <MatrixRain /> */}

        {/* <Image
          source={images.blueBG} // or use <BackgroundSvg /> for SVG
          className='absolute inset-0 w-full h-full'
          resizeMode='repeat'
        /> */}

        {/* ✅ Curved animated header */}
        <CurvedHeader scrollY={scrollY} />

        {/* Foreground content */}
        <SliderPersons />
        <SliderBrands itemList={BrandsList} />
        <Category />
        <NewsList />
        <PersonsList />

        {/* <WaveCard /> */}

        {/* <GlassCard /> */}

        {/* Footer Card */}
        <AnimatedCard />
      </Animated.ScrollView>
      {/* </LinearGradient> */}
    </View>
  );
};

export default Home;
