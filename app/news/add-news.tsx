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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useEffect, useRef, useState } from 'react';
import GoBackBtn from '@/components/GoBackBtn';
import { router, useNavigation } from 'expo-router';
import Logo from '@/components/Logo';
import { images } from '@/constants/images';
import * as ImagePicker from 'expo-image-picker';
import { collection, doc, getDocs, query, setDoc } from 'firebase/firestore';
import { db, storage } from '@/configs/FirebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useUser } from '@clerk/clerk-expo';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

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
  const [commentable, setCommentable] = useState(true);
  // const [seenBy, setSeenBy] = useState<[]>([]);

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
    // Input validation
    if (!title.trim() || !newsHead.trim() || !newsBody.trim()) {
      // ToastAndroid.show('⚠️ Please fill in all fields!', ToastAndroid.SHORT);
      Toast.show({
        type: 'error', // 'error' for warning-style toast (usually red)
        text1: '⚠️ Please fill in all fields!',
        position: 'bottom',
        visibilityTime: 2000, // similar to ToastAndroid.SHORT
      });
      return;
    }

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
      commentable: commentable,
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

    // ToastAndroid.show('News Added Successfully...', ToastAndroid.LONG);
    Toast.show({
      type: 'success', // Use 'success' for positive actions
      text1: 'News Added Successfully...',
      position: 'bottom',
      visibilityTime: 4000, // Equivalent to ToastAndroid.LONG
    });

    router.back();
  };

  const toggleCommentable = () => {
    setCommentable((prev) => !prev); // flip the value
    console.log('Toggled to:', !commentable);
  };

  const scrollViewRef = useRef<any>(null);

  if (!index || loading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator
          size='large'
          color={Colors.coSecondary}
        />
      </View>
    );
  } else {
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
              Add News
            </Text>
            <Logo />
          </View>
          <Text
            className='text-lg color-coSecondary ml-5 mb-3'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Fill all details to add a news
          </Text>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              {/* Information (details) about a news */}
              <KeyboardAwareScrollView
                ref={scrollViewRef}
                className='mb-24 bg-dataHolder rounded-3xl'
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingBottom: 150, // VERY IMPORTANT
                }}
                keyboardShouldPersistTaps='handled'
                enableAutomaticScroll={true}
                enableOnAndroid
                extraScrollHeight={0}
              >
                <View className='flex items-center'>
                  <TouchableOpacity
                    className='w-[96%] h-80 m-5 items-center bg-black rounded-2xl'
                    onPress={() => ImagePickHandler()}
                  >
                    <Image
                      source={!image ? images.FRGwhiteBG : { uri: image }}
                      className='w-full h-80 rounded-2xl'
                      resizeMode='contain'
                    />
                  </TouchableOpacity>
                  <Text
                    className='text-lg color-coTitle ml-5 mt-1'
                    style={{ fontFamily: 'outfit-medium' }}
                  >
                    Press on the image to replace it
                  </Text>
                </View>
                <View className='gap-2 mt-3 flex items-center'>
                  <View className='flex flex-row items-center w-[90%] justify-between'>
                    <Text
                      className='text-xl mr-3 text-coTitle'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      Title
                    </Text>
                    <TextInput
                      className='w-[80%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                      onChangeText={(val) => setTitle(val)}
                      value={title}
                      placeholder='title'
                      placeholderTextColor='#1234'
                      style={{ fontFamily: 'outfit-regular' }}
                      onFocus={() => {
                        setTimeout(() => {
                          (scrollViewRef.current as any)?.scrollToPosition(
                            0,
                            250,
                            true
                          );
                        }, 300);
                      }}
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
              className='w-[75%] pl-3 py-3 rounded-lg bg-title border-2 border-zinc-300'
              onChangeText={(val) => setDate(val)}
              value={date}
              placeholder='ex: 01-01-2001'
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View> */}

                  <View className='flex flex-row items-center w-[90%] justify-between'>
                    <Text
                      className='text-xl mr-3 text-coTitle'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      Head
                    </Text>
                    <TextInput
                      className='w-[80%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                      onChangeText={(val) => setNewsHead(val)}
                      value={newsHead}
                      placeholder='news head'
                      placeholderTextColor='#1234'
                      style={{ fontFamily: 'outfit-regular' }}
                      onFocus={() => {
                        setTimeout(() => {
                          (scrollViewRef.current as any)?.scrollToPosition(
                            0,
                            250,
                            true
                          );
                        }, 300);
                      }}
                    />
                  </View>

                  <View className='flex flex-row items-center w-[90%] justify-between'>
                    <Text
                      className='text-xl mr-3 text-coTitle'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      Body
                    </Text>
                    <TextInput
                      className='w-[80%] h-24 pl-3 rounded-lg bg-secondary border-2 border-zinc-300'
                      onChangeText={(val) => setNewsBody(val)}
                      value={newsBody}
                      placeholder='news body'
                      placeholderTextColor='#1234'
                      multiline
                      numberOfLines={5}
                      style={{
                        fontFamily: 'outfit-regular',
                        writingDirection:
                          newsBody && /^[\u0600-\u06FF]/.test(newsBody.trim())
                            ? 'rtl'
                            : 'ltr',
                        textAlign:
                          newsBody && /^[\u0600-\u06FF]/.test(newsBody.trim())
                            ? 'right'
                            : 'left',
                      }}
                      onFocus={() => {
                        setTimeout(() => {
                          (scrollViewRef.current as any)?.scrollToPosition(
                            0,
                            250,
                            true
                          );
                        }, 300);
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    className='flex flex-row self-center items-center w-auto py-1 px-4 mx-2 my-2 rounded-3xl bg-backBtn'
                    onPress={toggleCommentable}
                  >
                    <Ionicons
                      name={
                        commentable
                          ? 'chatbubble-ellipses-outline'
                          : 'chatbubble-ellipses'
                      }
                      size={30}
                      color={commentable ? '#ffffff' : '#192440'}
                    />
                    <Text
                      className={`text-lg ml-2 ${
                        commentable ? 'text-title' : 'text-darkest'
                      } `}
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      {commentable ? 'No comments' : 'Comments'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className='my-5 flex items-center'>
                  <TouchableOpacity
                    disabled={loading}
                    onPress={() => AddNewsHandler()}
                    className='w-96 py-3 rounded-lg bg-coSecondary'
                  >
                    {loading && (
                      <ActivityIndicator
                        size='large'
                        color='title'
                        className='self-center'
                      />
                    )}
                    {!loading && (
                      <Text
                        className='mx-auto text-xl text-darkest'
                        style={{ fontFamily: 'outfit-bold' }}
                      >
                        Add News
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>

          {/* Go back button */}
          <GoBackBtn />
        </LinearGradient>
      </View>
    );
  }
};

export default AddNews;

const styles = StyleSheet.create({});
