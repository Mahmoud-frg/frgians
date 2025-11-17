import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { images } from '@/constants/images';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, storage } from '@/configs/FirebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Colors } from '@/constants/Colors';

const UserInfo = () => {
  const { user } = useUser();
  const [personData, setPersonData] = useState<any>(null);

  const [code, setCode] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomUserImage = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        setLoading(true);

        const q = query(
          collection(db, 'personsList'), // 👈 change if your collection is named differently
          where('frgMail', '==', user.primaryEmailAddress.emailAddress)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setPersonData(userData);

          setImageUrl(userData.imageUrl || null);
          setCode(userData.code || null);
          setName(userData.name || null);
        }
      } catch (err) {
        console.warn('❌ Failed to fetch user profile from Firestore', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomUserImage();
  }, [user?.primaryEmailAddress?.emailAddress]);

  const profileImage = imageUrl ? { uri: imageUrl } : images.FRGwhiteBG; // fallback to asset

  const ImagePickHandler = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const pickedUri = result.assets[0].uri;

      if (pickedUri !== personData?.imageUrl) {
        setImageUrl(pickedUri);
        setIsSelected(true);
      } else {
        setIsSelected(false); // Same image selected
      }
    }
  };

  const deleteOldImages = async () => {
    try {
      const imagesRef = ref(storage, 'frgians/images'); // The folder where images are stored
      const result = await listAll(imagesRef);

      const deletePromises = result.items
        .filter((item) => item.name.startsWith(`${code}-`))
        .map((item) => deleteObject(item));

      await Promise.all(deletePromises);

      console.log('✅ Old images deleted.');
    } catch (error) {
      console.error('❌ Error deleting old images:', error);
    }
  };

  const UpdatePersonHandler = async () => {
    if (!imageUrl || imageUrl === personData?.imageUrl) {
      Toast.show({
        type: 'info',
        text1: 'No changes detected.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    setUpdating(true);

    await deleteOldImages(); // 🧹 Clean up

    const timestamp = Date.now();
    const safeDate = new Date(timestamp).toISOString().replace(/[:.]/g, '-');
    const fileName = `${code}-${user?.fullName}-${safeDate}.jpeg`;

    const res = await fetch(imageUrl);
    const blob = await res.blob();

    if (!blob.type.startsWith('image/')) {
      throw new Error('Selected file is not a valid image.');
    }

    const storageRef = ref(storage, `frgians/images/${fileName}`);

    try {
      await uploadBytes(storageRef, blob);
      const imgDownloadUrl = await getDownloadURL(storageRef);

      const docRef = doc(db, 'personsList', String(code));

      const updatedFields = {
        imageUrl: String(imgDownloadUrl),
      };

      await updateDoc(docRef, updatedFields);

      Toast.show({
        type: 'success',
        text1: 'Image changed successfully!',
        position: 'bottom',
        visibilityTime: 3000,
      });

      setIsSelected(false);
    } catch (error) {
      console.error('Error updating profile image:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update image.',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
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
      <View className='flex justify-center items-center mt-5'>
        <View className='self-center'>
          <Image
            source={profileImage}
            className='w-40 h-40 rounded-full'
          />
          <TouchableOpacity
            className='absolute top-0 right-0 w-12 h-12  bg-dataHolder rounded-full justify-center items-center z-30'
            activeOpacity={0.8}
            onPress={() => ImagePickHandler()}
            disabled={updating}
          >
            <Ionicons
              name='pencil-outline'
              size={24}
              color='#ffffff'
            />
          </TouchableOpacity>
        </View>
        <View className='self-center flex-row my-2'>
          {updating ? (
            <ActivityIndicator
              size='large'
              color={Colors.coSecondary}
            />
          ) : (
            isSelected && (
              <TouchableOpacity
                className='flex flex-row items-center w-auto p-2 mx-2 rounded-3xl bg-search'
                onPress={UpdatePersonHandler}
              >
                <Ionicons
                  name='sync'
                  size={30}
                  color={Colors.coSecondary}
                />
                <Text
                  className='text-lg ml-2 text-darkest'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Change Image
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <Text
          className='text-3xl mt-3 color-secondary'
          style={{ fontFamily: 'outfit-bold' }}
        >
          {user?.fullName}
        </Text>
        <Text
          className='w-auto mt-3 text-lg rounded-3xl text-center bg-search text-darkest px-5 py-2 font-normal'
          style={{ fontFamily: 'outfit-bold' }}
        >
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>
    );
  }
};

export default UserInfo;

const styles = StyleSheet.create({});
