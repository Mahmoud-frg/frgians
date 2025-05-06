import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  StyleSheet,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { db, storage } from '@/configs/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import GoBackBtn from '@/components/GoBackBtn';
import Logo from '@/components/Logo';
import { images } from '@/constants/images';
import * as ImagePicker from 'expo-image-picker';
import {
  getDownloadURL,
  ref,
  uploadBytes,
  listAll,
  deleteObject,
} from 'firebase/storage';
import { useUser } from '@clerk/clerk-expo';

const UpdateMyInfo = () => {
  const { user } = useUser();

  const { code } = useLocalSearchParams<{ code: string }>(); // Get code from route params
  const navigation = useNavigation();

  const [personData, setPersonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');

  useEffect(() => {
    navigation.setOptions({ headerTitle: 'Update Person', headerShown: true });

    const fetchPerson = async () => {
      setLoading(true);
      const docRef = doc(db, 'personsList', code);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPersonData(data);

        // Pre-fill the fields
        setAbout(data.about);
        setAddress(data.address);
        setMobile(data.contact);
        setImage(data.imageUrl);
        setName(data.name);
      } else {
        console.log('❌ No such document!');
      }
      setLoading(false);
    };

    fetchPerson();
  }, [code, navigation]);

  const onChanged = (text: string, type: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (type === 'mobile') {
      setMobile(numericText);
    }
  };

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
    setLoading(true);

    // Only update image if the user actually selected a new one
    const isNewImageSelected = image && image !== personData.imageUrl;

    if (isNewImageSelected) {
      await deleteOldImages(); // 🧹 First delete old images

      const timestamp = Date.now();
      const actualDate = new Date(timestamp);
      const safeDate = actualDate.toISOString().replace(/[:.]/g, '-');
      const fileName = `${code}-${name}-${safeDate}.jpeg`;

      const res = await fetch(image);
      const blob = await res.blob();

      if (blob.type && !blob.type.startsWith('image/')) {
        console.warn('⚠️ Selected file is not an image!');
        return;
      }

      const storageRef = ref(storage, `frgians/images/${fileName}`);

      try {
        await uploadBytes(storageRef, blob);
        const imgDownloadUrl = await getDownloadURL(storageRef);
        await updatePersonDetails(imgDownloadUrl);
      } catch (error) {
        console.error('❌ Error uploading image:', error);
      }
    } else {
      // Image not changed, just update the rest of the fields
      await updatePersonDetails(personData.imageUrl);
    }

    setLoading(false);
  };

  const updatePersonDetails = async (imgUrl: string) => {
    const docRef = doc(db, 'personsList', code);

    const updatedFields: any = {};

    // Only add fields that have changed
    if (about !== personData.about) updatedFields.about = about;
    if (address !== personData.address) updatedFields.address = address;
    if (mobile !== personData.contact) updatedFields.contact = mobile;
    if (imgUrl !== personData.imageUrl) updatedFields.imageUrl = imgUrl;
    if (name !== personData.name) updatedFields.name = name;

    updatedFields.userName = user?.fullName;
    updatedFields.userEmail = user?.primaryEmailAddress?.emailAddress;
    updatedFields.userImage = user?.imageUrl;

    console.log(Object.keys(updatedFields).length);

    if (Object.keys(updatedFields).length === 3) {
      //3 : userName, userEmail, userImage
      ToastAndroid.show('No changes detected.', ToastAndroid.SHORT);
      setUpdating(false);
      return;
    }

    await updateDoc(docRef, updatedFields);

    setLoading(false);

    ToastAndroid.show('Person updated successfully!', ToastAndroid.LONG);

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
    <View className='flex-1 bg-primary'>
      {/* Logo */}
      <View className='flex flex-row mx-5 justify-between items-center'>
        <Text
          className='color-title text-3xl'
          style={{ fontFamily: 'outfit-bold' }}
        >
          Update My Info.
        </Text>
        <Logo />
      </View>
      <Text
        className='text-lg color-slate-600 ml-5 mb-3'
        style={{ fontFamily: 'outfit-medium' }}
      >
        Fill details you want to update
      </Text>

      {/* Information (details) about a person */}
      <ScrollView className='mb-28 bg-slate-100 rounded-3xl'>
        {/* Image */}
        <View className='flex items-center'>
          <TouchableOpacity
            className='w-40 h-40 m-5'
            onPress={() => ImagePickHandler()}
          >
            <Image
              source={!image ? images.FRGblack : { uri: image }}
              className='w-40 h-40 rounded-2xl'
            />
          </TouchableOpacity>
          <Text
            className='text-lg color-slate-600 ml-5 mt-1'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Press on the image to pick up your photo
          </Text>
        </View>

        {/* Details */}
        <View className='gap-2 mt-3 flex items-center'>
          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Name
            </Text>
            <TextInput
              className='w-[80%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              placeholder={personData?.name || 'Name'}
              value={name}
              onChangeText={setName}
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>

          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Contact
            </Text>
            <TextInput
              className='w-[75%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              onChangeText={(text) => onChanged(text, 'mobile')}
              value={mobile}
              placeholder={personData?.contact || 'mobile'}
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>

          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Address
            </Text>
            <TextInput
              className='w-[75%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              autoCapitalize='none'
              onChangeText={setAddress}
              value={address}
              placeholder={personData?.address || 'ex: nasr city'}
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>

          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              About
            </Text>
            <TextInput
              className='w-[80%] h-24 pl-3 rounded-lg bg-white border-2 border-zinc-300'
              onChangeText={setAbout}
              value={about}
              placeholder={personData?.about || 'about'}
              multiline
              numberOfLines={5}
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>
        </View>

        <View className='my-5 flex items-center'>
          <TouchableOpacity
            disabled={updating}
            onPress={UpdatePersonHandler}
            className='w-96 py-3 rounded-lg bg-title'
          >
            {updating ? (
              <ActivityIndicator color='white' />
            ) : (
              <Text className='text-xl text-center text-white'>
                Update My Info.
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

export default UpdateMyInfo;

const styles = StyleSheet.create({});
