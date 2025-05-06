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
import { deleteDoc, doc } from 'firebase/firestore';
import { admins, db, storage } from '@/configs/FirebaseConfig';
import { deleteObject, listAll, ref } from 'firebase/storage';

type IntroProps = {
  personDetails: personsListType | null;
};

const Intro: React.FC<IntroProps> = ({ personDetails }) => {
  const [myProfile, setMyProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    if (admins.includes(user?.primaryEmailAddress?.emailAddress as string)) {
      setIsAdmin(true);
    }

    if (user?.primaryEmailAddress?.emailAddress === personDetails?.frgMail) {
      setMyProfile(true);
    }
  }, []);

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
        ToastAndroid.show('⚠️ Invalid person ID.', ToastAndroid.SHORT);
        return;
      }

      const docRef = doc(db, 'personsList', personDetails.code.toString()); // personDetails.id is now guaranteed to be a string
      await deleteDoc(docRef);

      await deleteOldImages(); // 🧹 First delete old images

      ToastAndroid.show(`${personDetails.name} deleted!`, ToastAndroid.LONG);
      router.back();
    } catch (error) {
      console.error('❌ Error deleting person:', error);
      ToastAndroid.show('Failed to delete person.', ToastAndroid.LONG);
    }
  };

  const UserUpdateHandler = () => {
    router.push({
      pathname: '/persons/update-my-info',
      params: { code: personDetails?.code?.toString() },
    });
  };

  const PersonUpdateHandler = () => {
    router.push({
      pathname: '/persons/update-person',
      params: { code: personDetails?.code?.toString() },
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
        <View className='self-center h-80 w-full'>
          <Image
            source={
              personDetails?.imageUrl === ''
                ? images.FRGblack
                : { uri: personDetails?.imageUrl }
            }
            className='object-cover h-full w-full shadow-md self-center'
            resizeMode='cover'
          />
        </View>
      </View>

      <View className='rounded-t-3xl overflow-hidden shadow-md bg-white -mt-5 w-full self-center'>
        <View className='mt-5'>
          <View>
            <Text
              className='text-3xl ml-5'
              style={{ fontFamily: 'outfit-bold' }}
            >
              {personDetails?.name}
            </Text>
            <Text
              className='text-title text-xl ml-5'
              style={{ fontFamily: 'outfit-medium' }}
            >
              {personDetails?.title}
            </Text>
            <Text
              className='ml-5 text-gray-600 text-xl'
              style={{ fontFamily: 'outfit-bold' }}
            >
              {personDetails?.department}
            </Text>
          </View>

          <View className='self-center flex-row my-2'>
            {myProfile && (
              <TouchableOpacity
                className='flex flex-row items-center w-auto p-2 mx-2 rounded-3xl bg-slate-200'
                onPress={() => UserUpdateHandler()}
              >
                <Ionicons
                  name='person'
                  size={30}
                  color={Colors.dark.background}
                />
                <Text
                  className='text-lg ml-2 text-gray-600'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Update me
                </Text>
              </TouchableOpacity>
            )}

            {isAdmin && (
              <>
                <TouchableOpacity
                  className='flex flex-row items-center w-auto p-2 mx-2 rounded-3xl bg-slate-200'
                  onPress={() => PersonUpdateHandler()}
                >
                  <Ionicons
                    name='sync'
                    size={30}
                    color={Colors.dark.background}
                  />
                  <Text
                    className='text-lg ml-2 text-gray-600'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    Update
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className='flex flex-row items-center w-auto p-2 mx-2 rounded-3xl bg-slate-200'
                  onPress={() => PersonDeleteHandler()}
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
              </>
            )}
          </View>

          <View className='w-96 h-0.5 bg-secondary self-center rounded-3xl opacity-25 mt-5' />

          <View className='mt-5'>
            <View className='flex flex-row justify-between m-1'>
              <Text
                className='text-xl ml-5 text-gray-600  pt-2 font-normal'
                style={{ fontFamily: 'outfit-bold' }}
              >
                Code
              </Text>
              <Text
                className='w-auto mr-5 rounded-3xl text-center bg-title text-white p-2 font-normal'
                style={{ fontFamily: 'outfit-bold' }}
              >
                {personDetails?.code}
              </Text>
            </View>
            <View className='flex flex-row justify-between m-1'>
              <Text
                className='text-xl ml-5 text-gray-600  pt-2 font-normal'
                style={{ fontFamily: 'outfit-bold' }}
              >
                Joined @
              </Text>
              <Text
                className='w-auto mr-5 rounded-3xl text-center bg-title text-white p-2 font-normal'
                style={{ fontFamily: 'outfit-bold' }}
              >
                {personDetails?.joinDate}
              </Text>
            </View>
            <View className='flex flex-row justify-between m-1'>
              <Text
                className='text-xl ml-5 text-gray-600  pt-2 font-normal'
                style={{ fontFamily: 'outfit-bold' }}
              >
                Mail
              </Text>
              <Text
                className='w-auto mr-5 rounded-3xl text-center bg-title text-white p-2 font-normal'
                style={{ fontFamily: 'outfit-bold' }}
              >
                {personDetails?.frgMail}
              </Text>
            </View>
            <View className='flex flex-row justify-between m-1'>
              <Text
                className='text-xl ml-5 text-gray-600  pt-2 font-normal'
                style={{ fontFamily: 'outfit-bold' }}
              >
                Report line
              </Text>
              <Text
                className='w-auto mr-5 rounded-3xl text-center bg-title text-white p-2 font-normal'
                style={{ fontFamily: 'outfit-bold' }}
              >
                {personDetails?.reportTo}
              </Text>
            </View>
            {personDetails?.contact ? (
              <View className='flex flex-row justify-between m-1'>
                <Text
                  className='text-xl ml-5 text-gray-600  pt-2 font-normal'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Phone
                </Text>
                <Text
                  className='w-auto mr-5 rounded-3xl text-center bg-title text-white p-2 font-normal'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  {personDetails?.contact}
                </Text>
              </View>
            ) : (
              <></>
            )}
          </View>

          {personDetails?.about ? (
            <>
              <Text
                className='text-xl ml-7 text-gray-600  pt-5 font-normal'
                style={{ fontFamily: 'outfit-bold' }}
              >
                About
              </Text>
              <View className='bg-slate-200 mt-2 mb-5 mx-5 px-5 rounded-2xl '>
                <Text
                  className='text-xl text-secondary pt-3 pb-3 font-normal'
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
      </View>
    </View>
  );
};
export default Intro;

const styles = StyleSheet.create({});
