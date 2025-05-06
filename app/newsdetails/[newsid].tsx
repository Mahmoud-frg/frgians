import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { admins, db, storage } from '@/configs/FirebaseConfig';

import GoBackBtn from '@/components/GoBackBtn';
import { useNavigationState } from '@react-navigation/native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import Logo from '@/components/Logo';
import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { deleteObject, listAll, ref } from 'firebase/storage';
import { images } from '@/constants/images';

const NewsDetails = () => {
  const navigation = useNavigation();
  const { newsid } = useLocalSearchParams();
  const [newsDetails, setNewsDetails] = useState<newsListType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    if (admins.includes(user?.primaryEmailAddress?.emailAddress as string)) {
      setIsAdmin(true);
    }
  }, []);

  const deleteOldImages = async () => {
    try {
      const imagesRef = ref(storage, 'frgians/news'); // The folder where images are stored
      const result = await listAll(imagesRef);

      const deletePromises = result.items
        .filter((item) => item.name.startsWith(`${newsid}-`))
        .map((item) => deleteObject(item));

      await Promise.all(deletePromises);

      console.log('✅ Old images deleted.');
    } catch (error) {
      console.error('❌ Error deleting old images:', error);
    }
  };

  const deleteNews = async () => {
    try {
      if (!newsDetails?.index?.toString()) {
        ToastAndroid.show('⚠️ Invalid person ID.', ToastAndroid.SHORT);
        return;
      }

      const docRef = doc(db, 'newsList', newsDetails.index.toString()); // newsDetails.id is now guaranteed to be a string
      await deleteDoc(docRef);

      await deleteOldImages(); // 🧹 First delete old images

      ToastAndroid.show(`${newsDetails.title} deleted!`, ToastAndroid.LONG);
      router.back();
    } catch (error) {
      console.error('❌ Error deleting news:', error);
      ToastAndroid.show('Failed to delete news.', ToastAndroid.LONG);
    }
  };

  // Fetch news details by ID
  const GetNewsDetailsById = async (newsid: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'newsList', newsid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data() as newsListType;
        setNewsDetails(docData);
      } else {
        console.warn(`No document found with ID: ${newsid}`);
        setNewsDetails(null);
      }
    } catch (error) {
      console.error('Error fetching news details:', error);
      setNewsDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch and set news details on component mount
  useEffect(() => {
    if (newsid) {
      GetNewsDetailsById(newsid as string);
    }
  }, [newsid]);

  // Set navigation options after root layout is mounted
  useEffect(() => {
    if (newsid) {
      navigation.setOptions({
        headerShown: true,
        headerTitle: newsid,
      });
    }
  }, [newsid, navigation]);

  const navStack = useNavigationState((state) => {
    return state.routes.map((r) => r.name);
  });

  const NewsDeleteHandler = () => {
    Alert.alert(
      `Do you want to delete ${newsDetails?.title} ?`,
      `${newsDetails?.title} will be deleted from database !`,
      [
        {
          text: 'cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNews(),
        },
      ]
    );
  };

  return (
    <View className='bg-primary flex-1'>
      {/* Logo */}
      <View className='flex flex-row mx-5 justify-between items-center'>
        <Text
          className='color-title text-3xl'
          style={{ fontFamily: 'outfit-bold' }}
        >
          News
        </Text>
        <Logo />
      </View>
      <Text
        className='text-lg color-slate-600 ml-5 mb-3'
        style={{ fontFamily: 'outfit-medium' }}
      >
        Here is the news
      </Text>

      {isAdmin && (
        <TouchableOpacity
          className='flex flex-row self-center items-center w-auto p-2 mx-2 rounded-3xl bg-slate-200'
          onPress={() => NewsDeleteHandler()}
        >
          <Ionicons
            name='trash'
            size={30}
            color={Colors.primary}
          />
          <Text
            className='text-lg ml-2 text-gray-600'
            style={{ fontFamily: 'outfit-bold' }}
          >
            Delete
          </Text>
        </TouchableOpacity>
      )}

      {/* Information (details) about the news */}
      {/* <ScrollView className='mb-28 bg-slate-100 rounded-3xl'> */}
      <ScrollView className='mb-28 rounded-3xl'>
        <View className='flex items-center'>
          {loading ? (
            <ActivityIndicator
              size='large'
              color='#ff0031'
              className='mt-[50%] self-center'
            />
          ) : (
            <View className='relative self-center w-[95%] my-5'>
              <View className='z-10 absolute  w-full flex self-center'>
                <View className='self-center h-80 w-[90%] bg-white rounded-3xl'>
                  <Image
                    source={
                      newsDetails?.imgUrl === ''
                        ? images.FRGwhite
                        : { uri: newsDetails?.imgUrl }
                    }
                    className='rounded-3xl object-cover h-full w-full shadow-md self-center border-4 border-primary'
                    resizeMode='cover'
                  />
                </View>
              </View>

              <View className='rounded-xl overflow-hidden shadow-md bg-white mt-60 w-full self-center'>
                <View className='px-6 mt-24'>
                  <Text
                    className='text-3xl text-center'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    {newsDetails?.title}
                  </Text>

                  <Text
                    className='text-title text-2xl text-left mt-5'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    {newsDetails?.head}
                  </Text>

                  <Text
                    className='text-left text-gray-600'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    {newsDetails?.date}
                  </Text>

                  <Text
                    className='text-xl text-left text-gray-600 py-5'
                    style={{ fontFamily: 'outfit-regular' }}
                  >
                    {newsDetails?.body}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Go back button */}
      <GoBackBtn />
    </View>
  );
};

export default NewsDetails;

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
