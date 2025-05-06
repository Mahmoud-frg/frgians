import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import GoBackBtn from '@/components/GoBackBtn';
import { router, useNavigation } from 'expo-router';
import Logo from '@/components/Logo';
import { images } from '@/constants/images';
import * as ImagePicker from 'expo-image-picker';
import { collection, doc, getDocs, query, setDoc } from 'firebase/firestore';
import { db, storage } from '@/configs/FirebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useUser } from '@clerk/clerk-expo';

const AddNews = () => {
  const navigation = useNavigation();

  const { user } = useUser();

  const [news, setNews] = useState<newsListType[]>([]);
  const [index, setIndex] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [newsHead, setNewsHead] = useState('');
  const [newsBody, setNewsBody] = useState('');

  const [loading, setLoading] = useState(false);

  const GetAllNewsList = async () => {
    setLoading(true);
    const q = query(collection(db, 'newsList'));
    const querySnapshot = await getDocs(q);

    let allNews: newsListType[] = [];
    let maxIndex = 0;

    querySnapshot.forEach((doc) => {
      const docData = doc.data() as newsListType;
      allNews.push(docData);
      if (docData.index !== undefined && docData.index >= maxIndex) {
        maxIndex = docData.index;
      }
    });

    setNews(allNews);
    setIndex(maxIndex + 1); // 👈 set the next available index
    setLoading(false);
  };

  useEffect(() => {
    GetAllNewsList();

    const newstimestamp = Date.now(); // This is a number (milliseconds)
    const newsactualDate = new Date(newstimestamp);
    const newssafeDate = newsactualDate.toDateString();
    setDate(newssafeDate);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add News',
      headerShown: true,
    });
  }, [navigation]);

  const ImagePickHandler = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      // aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const AddNewsHandler = async () => {
    setLoading(true);

    // Only update image if the user actually selected a new one
    const isNewImageSelected = image && image !== '';

    if (isNewImageSelected) {
      const timestamp = Date.now(); // This is a number (milliseconds)
      const actualDate = new Date(timestamp);
      const safeDate = actualDate.toISOString().replace(/[:.]/g, '-'); // replaces colons and dots

      // console.log(actualDate.toDateString()); // e.g. "Thu Apr 10 2025"
      // console.log(actualDate.toLocaleDateString()); // e.g. "4/10/2025"
      // console.log(actualDate.toISOString()); // e.g. "2025-04-10T14:23:45.000Z"

      const fileName = `${index}-${title}-${safeDate}.jpeg`;
      const res = await fetch(image);
      const blob = await res.blob(); // This is fine in React Native with Expo SDK 49+

      if (blob.type && !blob.type.startsWith('image/')) {
        console.warn('⚠️ Selected file is not an image!');
        return;
      }

      const storageRef = ref(storage, `frgians/news/${fileName}`);

      await uploadBytes(storageRef, blob)
        .then(() => {
          console.log('✅ File uploaded successfully!');
          return getDownloadURL(storageRef); // ← you need to return this
        })
        .then((imgDownloadUrl) => {
          // console.log('🌐 Download URL:', imgDownloadUrl);
          // use imgDownloadUrl here
          saveNewsDetails(imgDownloadUrl);
        })
        .catch((error) => {
          console.error('❌ Error uploading or getting URL:', error);
        });
    } else {
      // Image not changed, just update the rest of the fields
      await saveNewsDetails('');
    }

    setLoading(false);
  };

  const saveNewsDetails = async (imgUrl: string) => {
    await setDoc(doc(db, 'newsList', index.toString()), {
      body: newsBody,
      date: date,
      head: newsHead,
      imgUrl: imgUrl,
      index: Number(index),
      title: title,
      userName: user?.fullName,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      userImage: user?.imageUrl,
    });

    setLoading(false);

    console.log('Adding news with index:', index);

    ToastAndroid.show('News Added Successfully...', ToastAndroid.LONG);

    router.back();
  };

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator
          size='large'
          color='#000'
        />
      </View>
    );
  }

  return (
    <View className='bg-primary flex-1'>
      {/* Logo */}
      <View className='flex flex-row mx-5 justify-between items-center'>
        <Text
          className='color-title text-3xl'
          style={{ fontFamily: 'outfit-bold' }}
        >
          Add News
        </Text>
        <Logo />
      </View>
      <Text
        className='text-lg color-slate-600 ml-5 mb-3'
        style={{ fontFamily: 'outfit-medium' }}
      >
        Fill all details to add a news
      </Text>

      {/* Information (details) about a news */}
      <ScrollView className='mb-28 bg-slate-100 rounded-3xl'>
        <View className='flex items-center'>
          <TouchableOpacity
            className='w-[96%] h-80 m-5 items-center bg-black rounded-2xl'
            onPress={() => ImagePickHandler()}
          >
            <Image
              source={!image ? images.FRGblack : { uri: image }}
              className='w-full h-80 rounded-2xl'
              resizeMode='contain'
            />
          </TouchableOpacity>
          <Text
            className='text-lg color-slate-600 ml-5 mt-1'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Press on the image to replace it
          </Text>
        </View>

        <View className='gap-2 mt-3 flex items-center'>
          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Title
            </Text>
            <TextInput
              className='w-[80%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              onChangeText={(val) => setTitle(val)}
              value={title}
              placeholder='title'
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>

          {/* <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Date
            </Text>
            <TextInput
              className='w-[75%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              onChangeText={(val) => setDate(val)}
              value={date}
              placeholder='ex: 01-01-2001'
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View> */}

          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Head
            </Text>
            <TextInput
              className='w-[80%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              onChangeText={(val) => setNewsHead(val)}
              value={newsHead}
              placeholder='news head'
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>

          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Body
            </Text>
            <TextInput
              className='w-[80%] h-24 pl-3 rounded-lg bg-white border-2 border-zinc-300'
              onChangeText={(val) => setNewsBody(val)}
              value={newsBody}
              placeholder='news body'
              multiline
              numberOfLines={5}
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>
        </View>

        <View className='my-5 flex items-center'>
          <TouchableOpacity
            disabled={loading}
            onPress={() => AddNewsHandler()}
            className='w-96 py-3 rounded-lg bg-title'
          >
            {loading && (
              <ActivityIndicator
                size='large'
                color='white'
                className='self-center'
              />
            )}
            {!loading && (
              <Text className='mx-auto text-xl font-bold text-white'>
                Add News
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Go back button */}
      <GoBackBtn />
    </View>
  );
};

export default AddNews;

const styles = StyleSheet.create({});
