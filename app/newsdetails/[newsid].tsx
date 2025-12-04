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
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { orginAdmins, db, storage } from '@/configs/FirebaseConfig';

import GoBackBtn from '@/components/GoBackBtn';
import { useNavigationState } from '@react-navigation/native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import Logo from '@/components/Logo';
import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  listAll,
  ref,
} from 'firebase/storage';
import { images } from '@/constants/images';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { Timestamp, FieldValue } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl } from 'react-native';

// When reading from Firestore:
export type CommentData = {
  id: string;
  userId: string;
  name: string;
  image: string;
  text: string;
  createdAt: string;
};

const NewsDetails = () => {
  const navigation = useNavigation();
  const { newsid } = useLocalSearchParams();
  const parsedNewsId = Array.isArray(newsid) ? newsid[0] : newsid;
  const [newsDetails, setNewsDetails] = useState<newsListType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOrginAdmin, setIsOrginAdmin] = useState(false);

  const [code, setCode] = useState<string | null>(null);
  const [personDetails, setPersonDetails] = useState<personsListType | null>(
    null
  );
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentId, setCommentId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height + 15); // extra margin
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const commentInputRef = useRef<TextInput>(null);
  const { user } = useUser();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    // Call your reload logic here
    await GetNewsDetailsById(newsid as string);

    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (
      orginAdmins.includes(user?.primaryEmailAddress?.emailAddress as string)
    ) {
      setIsOrginAdmin(true);
    }
  }, []);

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

  // Used to get persons list by id
  const GetPersonDetailsById = async (
    personid: string,
    setPersonDetails: React.Dispatch<
      React.SetStateAction<personsListType | null>
    >
  ) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'personsList', personid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data() as personsListType;
        setPersonDetails(docData);
      } else {
        console.warn(`No document found with ID: ${personid}`);
        setPersonDetails(null);
      }
    } catch (error) {
      console.error('Error fetching person details:', error);
      setPersonDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      GetPersonDetailsById(code as string, setPersonDetails);
    }
  }, [code]);

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
        // ToastAndroid.show('⚠️ Invalid person ID.', ToastAndroid.SHORT);
        Toast.show({
          type: 'error', // 'error' shows red styling by default
          text1: '⚠️ Invalid person ID.',
          position: 'bottom',
          visibilityTime: 2000, // similar to ToastAndroid.SHORT
        });
        return;
      }

      const docRef = doc(db, 'newsList', newsDetails.index.toString()); // newsDetails.id is now guaranteed to be a string
      await deleteDoc(docRef);

      await deleteOldImages(); // 🧹 First delete old images

      // ToastAndroid.show(`${newsDetails.title} deleted!`, ToastAndroid.LONG);
      Toast.show({
        type: 'success',
        text1: `${newsDetails.title} deleted!`,
        position: 'bottom',
        visibilityTime: 4000, // matches ToastAndroid.LONG
      });
      router.back();
    } catch (error) {
      console.error('❌ Error deleting news:', error);
      // ToastAndroid.show('Failed to delete news.', ToastAndroid.LONG);
      Toast.show({
        type: 'error', // 'error' gives red styling
        text1: 'Failed to delete news.',
        position: 'bottom',
        visibilityTime: 4000, // Equivalent to ToastAndroid.LONG
      });
    }
  };

  // Fetch news details by ID
  const GetNewsDetailsById = async (newsid: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'newsList', parsedNewsId);
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

  // Get image from storage by part of its name
  const getImageUrlByPrefix = async (namePrefix: string) => {
    const storage = getStorage();

    // Reference the folder in Storage
    const folderRef = ref(storage, 'frgians/images');

    try {
      // 1. List all files in the folder
      const result = await listAll(folderRef);

      // 2. Find the file that starts with the given prefix
      const matchedItem = result.items.find((itemRef) =>
        itemRef.name.startsWith(namePrefix)
      );

      if (!matchedItem) {
        throw new Error(`No file found starting with "${namePrefix}"`);
      }

      // 3. Get the download URL for the matched file
      const url = await getDownloadURL(matchedItem);
      return url;
    } catch (error) {
      console.error('Error fetching image URL:', error);
      return null;
    }
  };

  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);

      const urls: Record<string, string | null> = {};

      await Promise.all(
        comments.map(async (comment) => {
          const url = await getImageUrlByPrefix(
            `${comment.userId}-${comment.name}`
          );
          urls[comment.id.toString()] = url;
        })
      );

      setImageUrls(urls);
      setLoading(false); // ✅ finish loading once
    };

    if (comments.length > 0) {
      fetchImages();
    }
  }, [comments]);

  // After fetching newsDetails, determine if the current user has liked it:
  useEffect(() => {
    setLoading(true);
    if (newsDetails?.likes && code) {
      setLiked(newsDetails.likes?.includes(code));
      setComments(newsDetails.comments || []);
    }
    setLoading(false);
  }, [newsDetails, code]);

  const toggleLike = async () => {
    if (!newsDetails || !code) return;

    const newsRef = doc(db, 'newsList', parsedNewsId);

    if (liked) {
      await updateDoc(newsRef, { likes: arrayRemove(code) });
      setLiked(false);
      setNewsDetails({
        ...newsDetails,
        likes: newsDetails.likes?.filter((uid) => uid !== code) || [],
      });
    } else {
      await updateDoc(newsRef, { likes: arrayUnion(code) });
      setLiked(true);
      setNewsDetails({
        ...newsDetails,
        likes: [...(newsDetails.likes || []), code],
      });
    }
  };

  const WriteCommentHandler = () => {
    setShowCommentBox(true); // make it visible
    setTimeout(() => {
      commentInputRef.current?.focus(); // focus after render
    }, 100);
  };

  const submitComment = async () => {
    setLoading(true);

    if (!commentText.trim() || !code) return;

    const comment: CommentData = {
      id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      userId: code,
      name: personDetails?.name || 'Anonymous',
      image: personDetails?.imageUrl || '',
      text: commentText.trim(),
      createdAt: Timestamp.now().toDate().toLocaleString('en-US', {
        weekday: 'long', // Sunday, Monday, ...
        month: 'long', // January, February, ...
        day: '2-digit', // 01, 02, ...
        year: 'numeric', // 2025
        hour: 'numeric', // 2
        minute: '2-digit', // 30
        hour12: true, // AM/PM format
      }),
    };

    const newsRef = doc(db, 'newsList', parsedNewsId);

    await updateDoc(newsRef, {
      comments: arrayUnion(comment),
    });

    // Optimistic UI update
    setComments((prev) => [...prev, comment]);
    setCommentText('');
    setShowCommentBox(false);
    setNewsDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: [...(prev.comments || []), comment],
      };
    });

    setLoading(false);
  };

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

  const confirmDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteComment(commentId),
        },
      ]
    );
  };

  const deleteComment = async (commentId: string) => {
    setLoading(true);

    // Optimistic UI update for comments
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    // Also update newsDetails state
    setNewsDetails((prev) =>
      prev
        ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) }
        : prev
    );

    // Update Firestore
    const newsRef = doc(db, 'newsList', parsedNewsId);
    await updateDoc(newsRef, {
      comments: comments.filter((c) => c.id !== commentId),
    });
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
          style={{ flex: 1, height: '100%', width: '100%' }}
        >
          {/* Logo */}
          <View className='flex flex-row mx-5 justify-between items-center'>
            <Text
              className='color-coTitle text-3xl'
              style={{ fontFamily: 'outfit-bold' }}
            >
              News
            </Text>
            <Logo />
          </View>

          <Text
            className='text-lg color-coTitle ml-5 mb-2'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Here is the news
          </Text>

          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 150 }}
            keyboardShouldPersistTaps='handled'
            enableOnAndroid={true} // important for Android
            extraScrollHeight={Platform.OS === 'ios' ? 0 : 0} // space above keyboard
            keyboardOpeningTime={0} // faster scroll
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor='#F8CA37' // loader color iOS
                colors={[Colors.coSecondary]} // loader colors Android
              />
            }
          >
            {/* Information (details) about the news */}
            {/* <ScrollView className='mb-24 bg-slate-100 rounded-3xl'> */}
            {loading ? (
              <ActivityIndicator
                size='large'
                color={Colors.coSecondary}
                className='mt-[50%] self-center'
              />
            ) : (
              <>
                <View className='flex items-center'>
                  <View className='relative self-center w-[95%] my-2'>
                    <View className='z-10 absolute  w-full flex self-center'>
                      <View className='self-center h-80 w-[90%] bg-darkest rounded-3xl'>
                        <Image
                          source={
                            newsDetails?.imgUrl === ''
                              ? images.FRGwhiteBG
                              : { uri: newsDetails?.imgUrl }
                          }
                          className='rounded-3xl object-cover h-full w-full shadow-md self-center border-4 border-[#183F4E]'
                          resizeMode='cover'
                        />
                      </View>
                    </View>

                    <View className='rounded-xl overflow-hidden shadow-md bg-catPersons mt-60 w-full self-center'>
                      <View className='px-6 mt-24'>
                        <Text
                          className='text-3xl text-center color-title mb-5'
                          style={{ fontFamily: 'outfit-bold' }}
                        >
                          {newsDetails?.title}
                        </Text>

                        <View className='w-96 h-0.5 bg-darkest self-center rounded-3xl opacity-25' />

                        <Text
                          className='text-[#F05929] text-2xl text-left mt-5'
                          style={{ fontFamily: 'outfit-bold' }}
                        >
                          {newsDetails?.head}
                        </Text>

                        <Text
                          className='text-left text-coSecondary'
                          style={{ fontFamily: 'outfit-bold' }}
                        >
                          {newsDetails?.date}
                        </Text>

                        <Text
                          className='text-xl text-left text-title py-5'
                          style={{
                            fontFamily: 'outfit-regular',
                            writingDirection:
                              newsDetails?.body &&
                              /^[\u0600-\u06FF]/.test(newsDetails?.body.trim())
                                ? 'rtl'
                                : 'ltr',
                            textAlign:
                              newsDetails?.body &&
                              /^[\u0600-\u06FF]/.test(newsDetails?.body.trim())
                                ? 'right'
                                : 'left',
                          }}
                        >
                          {newsDetails?.body}
                        </Text>
                      </View>

                      <View className='w-96 h-0.5 bg-darkest self-center rounded-3xl opacity-25' />

                      <View className='self-center flex-row w-full justify-between px-2'>
                        <View className='flex flex-row self-start items-center w-auto py-1 px-4 mx-2 '>
                          <Ionicons
                            name='thumbs-up'
                            size={15}
                            color='#00181f'
                          />
                          <Text
                            className='text-lg ml-2 text-title'
                            style={{ fontFamily: 'outfit-regular' }}
                          >
                            {newsDetails?.likes?.length ?? 0}
                          </Text>
                        </View>

                        {newsDetails?.commentable && (
                          <View className='flex flex-row self-end items-center w-auto py-1 px-4 mx-2 '>
                            <Ionicons
                              name='chatbubble-ellipses'
                              size={15}
                              color='#00181f'
                            />
                            <Text
                              className='text-lg ml-2 text-title'
                              style={{ fontFamily: 'outfit-regular' }}
                            >
                              {newsDetails?.comments?.length ?? 0}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View className='self-center flex-row mb-4'>
                        <TouchableOpacity
                          className='flex flex-row self-center items-center w-auto py-1 px-4 mx-2 rounded-3xl bg-dataHolder'
                          onPress={toggleLike}
                        >
                          <Ionicons
                            name={liked ? 'thumbs-up' : 'thumbs-up-outline'}
                            size={30}
                            color={liked ? '#00181f' : '#ffffff'}
                          />
                          <Text
                            className={`text-lg ml-2 ${
                              liked ? 'text-darkest' : 'text-white'
                            }`}
                            style={{ fontFamily: 'outfit-bold' }}
                          >
                            {liked ? 'Liked' : 'Like'}
                          </Text>
                        </TouchableOpacity>

                        {newsDetails?.commentable && (
                          <TouchableOpacity
                            className='flex flex-row self-center items-center w-auto py-1 px-4 mx-2 rounded-3xl bg-dataHolder'
                            onPress={WriteCommentHandler}
                          >
                            <Ionicons
                              name='chatbubble-ellipses'
                              size={30}
                              color='#ffffff'
                            />
                            <Text
                              className='text-lg ml-2 text-white'
                              style={{ fontFamily: 'outfit-bold' }}
                            >
                              Comment
                            </Text>
                          </TouchableOpacity>
                        )}

                        {(isOrginAdmin || personDetails?.isAdmin) && (
                          <TouchableOpacity
                            className='flex flex-row self-center items-center w-auto py-1 px-4 mx-2 rounded-3xl bg-dataHolder'
                            onPress={() => NewsDeleteHandler()}
                          >
                            <Ionicons
                              name='trash'
                              size={30}
                              color='red'
                            />
                            <Text
                              className='text-lg ml-2 text-white'
                              style={{ fontFamily: 'outfit-bold' }}
                            >
                              Delete
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                {newsDetails?.commentable && (
                  <View className='bg-search rounded-2xl mx-3 px-4'>
                    <View className='flex flex-row self-center items-center w-auto py-1 px-4 mx-2 '>
                      <Ionicons
                        name='chatbubble-ellipses'
                        size={15}
                        color='#00181f'
                      />
                      <Text
                        className='text-lg ml-2 text-darkest'
                        style={{ fontFamily: 'outfit-regular' }}
                      >
                        What's on your mind about this news ?
                      </Text>
                    </View>

                    {/* 
                    <View className='flex flex-row my-2'>
                      <Image
                        source={images.FRGwhiteBG}
                        className='w-12 h-12 m-1 rounded-full bg-black'
                      />
                      <View className='flex max-w-[84%] m-1 p-2 rounded-3xl bg-dataHolder'>
                        <Text
                          className='text-xl text-coTitle'
                          style={{ fontFamily: 'outfit-bold' }}
                        >
                          user
                        </Text>
                        <Text
                          className='w-auto h-auto rounded-3xl text-start text-secondary'
                          style={{ fontFamily: 'outfit-semi-bold' }}
                        >
                          comment what ever you want to say here and comment what ever
                          you want to say here.
                        </Text>
                      </View>
                    </View> */}

                    {comments.length > 0 && (
                      <View className='w-96 h-0.5 bg-darkest self-center rounded-full opacity-50' />
                    )}

                    {loading ? (
                      <ActivityIndicator
                        size='small'
                        color={Colors.coSecondary}
                        style={{ marginRight: 10 }}
                      />
                    ) : (
                      <>
                        {comments.map((item, index) => (
                          <View
                            key={item.id || index}
                            className='flex flex-row m-1'
                          >
                            <Image
                              // source={
                              //   item.image ? { uri: item.image } : images.FRGians
                              // }

                              source={
                                imageUrls[item.id.toString()]
                                  ? { uri: imageUrls[item.id.toString()]! }
                                  : images.FRGians
                              }
                              className='w-12 h-12 m-1 rounded-full bg-title'
                            />

                            <View className='flex max-w-[85%] m-1 p-2 rounded-3xl bg-dataHolder'>
                              <View className='flex-row justify-between items-center'>
                                <Text
                                  className='text-xl text-coTitle'
                                  style={{ fontFamily: 'outfit-bold' }}
                                >
                                  {item.name}
                                </Text>

                                {item.userId === code && (
                                  <TouchableOpacity
                                    onPress={() =>
                                      confirmDeleteComment(item.id)
                                    }
                                  >
                                    <Ionicons
                                      name='trash'
                                      size={16}
                                      color='red'
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>

                              <Text
                                className='text-start text-secondary'
                                style={{
                                  fontFamily: 'outfit-semi-bold',
                                  //   writingDirection:
                                  //     item.text &&
                                  //     /^[\u0600-\u06FF]/.test(item.text.trim())
                                  //       ? 'rtl'
                                  //       : 'ltr',
                                  //   textAlign:
                                  //     item.text &&
                                  //     /^[\u0600-\u06FF]/.test(item.text.trim())
                                  //       ? 'right'
                                  //       : 'left',
                                }}
                              >
                                {item.text}
                              </Text>
                              <Text
                                className='text-xs text-coSecondary'
                                style={{ fontFamily: 'outfit-regular' }}
                              >
                                {item.createdAt ? item.createdAt : 'Sending...'}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </>
                    )}
                  </View>
                )}
              </>
            )}
          </KeyboardAwareScrollView>

          {/* Comment Input – WhatsApp style */}
          {showCommentBox && (
            <>
              {/* <View className='w-96 h-0.5 bg-darkest self-center rounded-full opacity-50' /> */}

              <View
                style={{
                  position: 'absolute',
                  bottom: keyboardHeight,
                  left: 0,
                  right: 0,
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                  backgroundColor: 'transparent',
                }}
              >
                <View className='flex-row items-center w-[95%] self-center rounded-full bg-darker border-2 border-search'>
                  <TextInput
                    ref={commentInputRef}
                    className='flex-1 py-4 pl-3 text-secondary'
                    onChangeText={setCommentText}
                    value={commentText}
                    placeholder='Write a comment...'
                    placeholderTextColor='#ffffff'
                    multiline
                    numberOfLines={5}
                    style={{
                      fontFamily: 'outfit-regular',
                      fontSize: Platform.OS === 'ios' ? 20 : 15,
                      writingDirection:
                        commentText &&
                        /^[\u0600-\u06FF]/.test(commentText.trim())
                          ? 'rtl'
                          : 'ltr',
                      textAlign:
                        commentText &&
                        /^[\u0600-\u06FF]/.test(commentText.trim())
                          ? 'right'
                          : 'left',
                    }}
                  />

                  {commentText.trim().length > 0 && (
                    <TouchableOpacity
                      className='flex flex-row items-center w-auto mx-2 my-2 py-1 px-4 rounded-3xl bg-backBtn'
                      onPress={submitComment}
                    >
                      <Ionicons
                        name='send'
                        size={30}
                        color='#00181f'
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Go back button */}
          <GoBackBtn />
        </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  );
};

export default NewsDetails;

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
