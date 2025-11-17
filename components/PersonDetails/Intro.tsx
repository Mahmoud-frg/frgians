import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useUser } from '@clerk/clerk-expo';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { orginAdmins, db, storage } from '@/configs/FirebaseConfig';
import { deleteObject, listAll, ref } from 'firebase/storage';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

type IntroProps = {
  personDetails: personsListType | null;
};

const Intro: React.FC<IntroProps> = ({ personDetails }) => {
  const [myProfile, setMyProfile] = useState(false);
  const [isOrginAdmin, setIsOrginAdmin] = useState(false);

  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<personsListType | null>(null);

  useEffect(() => {
    if (
      orginAdmins.includes(user?.primaryEmailAddress?.emailAddress as string)
    ) {
      setIsOrginAdmin(true);
    }

    if (user?.primaryEmailAddress?.emailAddress === personDetails?.frgMail) {
      setMyProfile(true);
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
    setUserDetails: React.Dispatch<React.SetStateAction<personsListType | null>>
  ) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'personsList', personid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data() as personsListType;
        setUserDetails(docData);
      } else {
        console.warn(`No document found with ID: ${personid}`);
        setUserDetails(null);
      }
    } catch (error) {
      console.error('Error fetching person details:', error);
      setUserDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      GetPersonDetailsById(code as string, setUserDetails);
    }
  }, [code]);

  const deleteOldImages = async () => {
    try {
      const imagesRef = ref(storage, 'frgians/images'); // The folder where images are stored
      const result = await listAll(imagesRef);

      const deletePromises = result.items
        .filter((item) => item.name.startsWith(`${personDetails?.code}-`))
        .map((item) => deleteObject(item));

      await Promise.all(deletePromises);

      console.log('✅ Old images deleted.');
    } catch (error) {
      console.error('❌ Error deleting old images:', error);
    }
  };

  const deletePerson = async () => {
    try {
      if (!personDetails?.code?.toString()) {
        // ToastAndroid.show('⚠️ Invalid person ID.', ToastAndroid.SHORT);
        Toast.show({
          type: 'error', // For warnings or failures
          text1: '⚠️ Invalid person ID.',
          position: 'bottom',
          visibilityTime: 2000, // Equivalent to ToastAndroid.SHORT
        });
        return;
      }

      const docRef = doc(db, 'personsList', personDetails.code.toString()); // personDetails.id is now guaranteed to be a string
      await deleteDoc(docRef);

      await deleteOldImages(); // 🧹 First delete old images

      // ToastAndroid.show(`${personDetails.name} deleted!`, ToastAndroid.LONG);
      Toast.show({
        type: 'success',
        text1: `${personDetails.name} deleted!`,
        position: 'bottom',
        visibilityTime: 4000, // Equivalent to ToastAndroid.LONG
      });
      router.back();
    } catch (error) {
      console.error('❌ Error deleting person:', error);
      // ToastAndroid.show('Failed to delete person.', ToastAndroid.LONG);
      Toast.show({
        type: 'error',
        text1: 'Failed to delete person.',
        position: 'bottom',
        visibilityTime: 4000, // Equivalent to ToastAndroid.LONG
      });
    }
  };

  const UserUpdateHandler = () => {
    router.push({
      pathname: '/persons/update-my-info',
      params: {
        code: personDetails?.code?.toString(),
        from: 'update-my-info',
      },
    });
  };

  const PersonUpdateHandler = () => {
    router.push({
      pathname: '/persons/update-person',
      params: { code: personDetails?.code?.toString(), from: 'update-person' },
    });
  };

  const PersonDeleteHandler = () => {
    Alert.alert(
      `Do you want to delete ${personDetails?.name} ?`,
      `${personDetails?.name} will be deleted from database !`,
      [
        {
          text: 'cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePerson(),
        },
      ]
    );
  };
  return (
    <View className='self-center w-full'>
      <View className='w-full flex self-center'>
        <View className='self-center h-96 w-full bg-leaderBorder'>
          <Image
            source={
              personDetails?.imageUrl === ''
                ? images.FRGwhiteBG
                : { uri: personDetails?.imageUrl }
            }
            className='object-contain h-full w-full shadow-md self-center rounded-bl-[100px]'
            resizeMode='cover'
          />
        </View>
      </View>

      {/* Mirror Image */}
      <View
        style={{ position: 'relative', overflow: 'hidden' }}
        className='h-96 w-full self-center'
      >
        <Image
          source={
            personDetails?.imageUrl === ''
              ? images.FRGwhiteBG
              : { uri: personDetails?.imageUrl }
          }
          style={[styles.mirrorImage]}
          className='object-contain h-full w-full self-center'
          resizeMode='cover'
        />

        {/* Gradient to fade reflection */}
        {/* <LinearGradient
          colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
          style={StyleSheet.absoluteFillObject}
        /> */}
      </View>

      <View className='rounded-tr-[100px] overflow-hidden bg-leaderBorder -mt-96 w-full self-center'>
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
          <View className='mt-5'>
            <View>
              <Text
                className='text-secondary text-3xl ml-5'
                style={{ fontFamily: 'outfit-bold' }}
              >
                {personDetails?.name}
              </Text>
              <Text
                className='text-coSecondary text-xl ml-5'
                style={{ fontFamily: 'outfit-medium' }}
              >
                {personDetails?.title}
              </Text>
              <Text
                className='ml-5 text-coTitle text-xl'
                style={{ fontFamily: 'outfit-bold' }}
              >
                {personDetails?.department}
              </Text>
            </View>

            <View className='self-center flex-row my-2'>
              {myProfile && (
                <TouchableOpacity
                  className='flex flex-row items-center w-auto p-2 mx-2 rounded-3xl bg-search'
                  onPress={() => UserUpdateHandler()}
                >
                  <Ionicons
                    name='person'
                    size={30}
                    color='#FFFFFF'
                  />
                  <Text
                    className='text-lg ml-2 text-coTitle'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    Update me
                  </Text>
                </TouchableOpacity>
              )}

              {(isOrginAdmin || userDetails?.isAdmin) && (
                <>
                  <TouchableOpacity
                    className='flex flex-row items-center w-auto p-2 mx-2 rounded-3xl bg-search'
                    onPress={() => PersonUpdateHandler()}
                  >
                    <Ionicons
                      name='sync'
                      size={30}
                      color='#83FFE6'
                    />
                    <Text
                      className='text-lg ml-2 text-coTitle'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      Update
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className='flex flex-row items-center w-auto p-2 mx-2 rounded-3xl bg-search'
                    onPress={() => PersonDeleteHandler()}
                  >
                    <Ionicons
                      name='trash'
                      size={30}
                      color='#CD1818'
                    />
                    <Text
                      className='text-lg ml-2 text-coTitle'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View className='w-96 h-0.5 bg-secondary self-center rounded-3xl opacity-25 mt-5' />

            <View className='my-5'>
              <View className='w-auto h-auto'>
                <Image
                  source={images.FRGlogoLeftHalf}
                  tintColor='#FFFFFF'
                  className='absolute inset-0 object-cover opacity-15 rotate-180'
                />
              </View>
              <View className='flex flex-row justify-between m-1'>
                <Text
                  className='text-xl ml-5 text-coTitle  pt-2'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Code
                </Text>
                <Text
                  className='w-auto mr-5 rounded-3xl text-center bg-search text-secondary p-2'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  {personDetails?.code}
                </Text>
              </View>
              <View className='flex flex-row justify-between m-1'>
                <Text
                  className='text-xl ml-5 text-coTitle  pt-2'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Joined @
                </Text>
                <Text
                  className='w-auto mr-5 rounded-3xl text-center bg-search text-secondary p-2'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  {personDetails?.joinDate}
                </Text>
              </View>
              <View className='flex flex-row justify-between m-1'>
                <Text
                  className='text-xl ml-5 text-coTitle  pt-2'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Mail
                </Text>
                <Text
                  className='w-auto mr-5 rounded-3xl text-center bg-search text-secondary p-2'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  {personDetails?.frgMail}
                </Text>
              </View>
              <View className='flex flex-row justify-between m-1'>
                <Text
                  className='text-xl ml-5 text-coTitle  pt-2'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Report line
                </Text>
                <Text
                  className='w-auto mr-5 rounded-3xl text-center bg-search text-secondary p-2'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  {personDetails?.reportTo}
                </Text>
              </View>
              {personDetails?.contact ? (
                <View className='flex flex-row justify-between m-1'>
                  <Text
                    className='text-xl ml-5 text-coTitle  pt-2'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    Phone
                  </Text>
                  <Text
                    className='w-auto mr-5 rounded-3xl text-center bg-search text-secondary p-2'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    {personDetails?.contact}
                  </Text>
                </View>
              ) : (
                <></>
              )}
              {personDetails?.emergency ? (
                <View className='flex flex-row justify-between m-1'>
                  <Text
                    className='text-xl ml-5 text-coTitle  pt-2'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    Emergency
                  </Text>
                  <Text
                    className='w-auto mr-5 rounded-3xl text-center bg-search text-secondary p-2'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    {personDetails?.emergency}
                  </Text>
                </View>
              ) : (
                <></>
              )}
              {personDetails?.dateOfBirth ? (
                <View className='flex flex-row justify-between m-1'>
                  <Text
                    className='text-xl ml-5 text-coTitle  pt-2'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    Date Of Birth
                  </Text>
                  <Text
                    className='w-auto mr-5 rounded-3xl text-center bg-search text-secondary p-2'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    {personDetails?.dateOfBirth}
                  </Text>
                </View>
              ) : (
                <></>
              )}
            </View>

            {personDetails?.jobDescription ? (
              <>
                <Text
                  className='text-xl ml-7 text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Job Description
                </Text>
                <View className='bg-search mt-2 mb-5 mx-5 px-5 rounded-2xl '>
                  <Text
                    className='text-xl text-secondary pt-3 pb-3'
                    style={{ fontFamily: 'outfit-regular' }}
                  >
                    {personDetails?.jobDescription}
                  </Text>
                </View>
              </>
            ) : (
              <></>
            )}

            {personDetails?.about ? (
              <>
                <Text
                  className='text-xl ml-7 text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  About
                </Text>
                <View className='bg-search mt-2 mb-5 mx-5 px-5 rounded-2xl '>
                  <Text
                    className='text-xl text-secondary pt-3 pb-3'
                    style={{ fontFamily: 'outfit-regular' }}
                  >
                    {personDetails?.about}
                  </Text>
                </View>
              </>
            ) : (
              <></>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};
export default Intro;

const styles = StyleSheet.create({
  mirrorImage: {
    transform: [{ scaleY: -1 }],
  },
});
