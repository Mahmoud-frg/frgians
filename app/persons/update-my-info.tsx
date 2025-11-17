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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const UpdateMyInfo = () => {
  const { user } = useUser();

  const { code } = useLocalSearchParams<{
    code?: string;
  }>(); // Get code from route params
  const navigation = useNavigation();

  const [personData, setPersonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [emergency, setEmergency] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [about, setAbout] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchPerson = async () => {
        setLoading(true);
        const docRef = doc(db, 'personsList', code as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPersonData(data);

          setAbout(data.about);
          setAddress(data.address);
          setMobile(data.contact);
          setEmergency(data.emergency);
          setImage(data.imageUrl);
          setJobDescription(data.jobDescription);
          setName(data.name);
          setDateOfBirth(data.dateOfBirth);
        } else {
          console.log('❌ No such document!');
        }
        setLoading(false);
      };

      fetchPerson();
    }, [code])
  );

  const onChanged = (text: string, type: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (type === 'mobile') {
      setMobile(numericText);
    }
    if (type === 'emergency') {
      setEmergency(numericText);
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
    const docRef = doc(db, 'personsList', code as string);

    const updatedFields: any = {};

    // Only add fields that have changed
    if (about !== personData.about) updatedFields.about = about;
    if (address !== personData.address) updatedFields.address = address;
    if (mobile !== personData.contact) updatedFields.contact = mobile;
    if (emergency !== personData.emergency) updatedFields.emergency = emergency;
    if (imgUrl !== personData.imageUrl) updatedFields.imageUrl = imgUrl;
    if (jobDescription !== personData.jobDescription)
      updatedFields.jobDescription = jobDescription;
    if (name !== personData.name) updatedFields.name = name;
    if (dateOfBirth !== personData.dateOfBirth)
      updatedFields.dateOfBirth = dateOfBirth;

    updatedFields.userName = user?.fullName;
    updatedFields.userEmail = user?.primaryEmailAddress?.emailAddress;
    updatedFields.userImage = user?.imageUrl;

    console.log(Object.keys(updatedFields).length);

    if (Object.keys(updatedFields).length === 3) {
      //3 : userName, userEmail, userImage
      // ToastAndroid.show('No changes detected.', ToastAndroid.SHORT);

      Toast.show({
        type: 'info', // or 'success', 'error'
        text1: 'No changes detected.',
        position: 'bottom',
        visibilityTime: 2000,
      });
      setUpdating(false);
      return;
    }

    await updateDoc(docRef, updatedFields);

    setLoading(false);

    // ToastAndroid.show('Person updated successfully!', ToastAndroid.LONG);

    Toast.show({
      type: 'success', // could also be 'info' or 'error'
      text1: 'Person updated successfully!',
      position: 'bottom',
      visibilityTime: 4000, // LONG equivalent (ToastAndroid.LONG ≈ 3500–4000ms)
    });

    router.back();
  };

  if (!code || loading || !personData) {
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
      <View className='flex-1 bg-primary'>
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
              Update My Info.
            </Text>
            <Logo />
          </View>
          <Text
            className='text-lg color-coSecondary ml-5 mb-3'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Fill details you want to update
          </Text>

          {/* Information (details) about a person */}
          {/* <ScrollView className='mb-24 bg-darkest rounded-3xl'> */}
          {/* <SafeAreaView style={{ flex: 1 }}> */}
          <KeyboardAwareScrollView
            className='mb-24 bg-dataHolder rounded-3xl'
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps='handled'
            enableAutomaticScroll={true}
          >
            {/* Image */}
            <View className='flex items-center'>
              <TouchableOpacity
                className='w-52 h-52 m-5 rounded-2xl bg-black'
                onPress={() => ImagePickHandler()}
              >
                <Image
                  source={!image ? images.FRGwhiteBG : { uri: image }}
                  className='w-52 h-52 rounded-2xl bg-black'
                />
              </TouchableOpacity>
              <Text
                className='text-lg color-coTitle ml-5 mt-1'
                style={{ fontFamily: 'outfit-medium' }}
              >
                Press on the image to pick up your photo
              </Text>
            </View>

            {/* Details */}
            <View className='gap-2 mt-3 flex items-center'>
              <View className='flex flex-row items-center w-[90%] justify-between'>
                <Text
                  className='text-xl mr-3 text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Name
                </Text>
                <TextInput
                  className='w-[80%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                  placeholder={personData?.name || 'Name'}
                  placeholderTextColor='#42424290'
                  value={name}
                  onChangeText={setName}
                  style={{ fontFamily: 'outfit-regular' }}
                />
              </View>

              <View className='flex flex-row items-center w-[90%] justify-between'>
                <Text
                  className='text-xl mr-3 text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Contact
                </Text>
                <TextInput
                  className='w-[75%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                  onChangeText={(text) => onChanged(text, 'mobile')}
                  value={mobile}
                  placeholder={personData?.contact || 'mobile'}
                  placeholderTextColor='#42424290'
                  style={{ fontFamily: 'outfit-regular' }}
                />
              </View>

              <View className='flex flex-row items-center w-[90%] justify-between'>
                <Text
                  className='text-xl mr-3 text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Emergency
                </Text>
                <TextInput
                  className='w-[70%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                  onChangeText={(text) => onChanged(text, 'emergency')}
                  value={emergency}
                  placeholder={personData?.emergency || 'emergency contact'}
                  placeholderTextColor='#42424290'
                  style={{ fontFamily: 'outfit-regular' }}
                />
              </View>

              <View className='flex flex-row items-center w-[90%] justify-between'>
                <Text
                  className='text-xl mr-3 text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Address
                </Text>
                <TextInput
                  className='w-[75%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                  autoCapitalize='none'
                  onChangeText={setAddress}
                  value={address}
                  placeholder={personData?.address || 'ex: nasr city'}
                  placeholderTextColor='#42424290'
                  style={{ fontFamily: 'outfit-regular' }}
                />
              </View>

              <View className='flex flex-row items-center w-[90%] justify-between'>
                <Text
                  className='text-xl mr-3 text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Date Of Birth
                </Text>
                <TextInput
                  className='w-[65%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                  onChangeText={setDateOfBirth}
                  value={dateOfBirth}
                  placeholder={personData?.dateOfBirth || 'ex: 01-01-2001'}
                  placeholderTextColor='#42424290'
                  style={{ fontFamily: 'outfit-regular' }}
                />
              </View>

              <View className='hidden flex-row items-center w-[90%] justify-between'>
                <Text
                  className='text-xl mr-3 text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Job Description
                </Text>
                <TextInput
                  className='w-[60%] h-24 pl-3 rounded-lg bg-secondary border-2 border-zinc-300'
                  onChangeText={setJobDescription}
                  value={jobDescription}
                  placeholder={personData?.jobDescription || 'job description'}
                  placeholderTextColor='#42424290'
                  multiline
                  numberOfLines={5}
                  style={{ fontFamily: 'outfit-regular' }}
                />
              </View>

              <View className='flex flex-row items-center w-[90%] justify-between'>
                <Text
                  className='text-xl mr-3 text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  About
                </Text>
                <TextInput
                  className='w-[80%] h-24 pl-3 rounded-lg bg-secondary border-2 border-zinc-300'
                  onChangeText={setAbout}
                  value={about}
                  placeholder={personData?.about || 'about'}
                  placeholderTextColor='#42424290'
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
                className='w-96 py-3 rounded-lg bg-coSecondary'
              >
                {updating ? (
                  <ActivityIndicator color='#FFFFFF' />
                ) : (
                  <Text
                    className='text-xl text-center text-darkest'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    Update My Info.
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
          {/* </SafeAreaView> */}
          {/* </ScrollView> */}

          {/* Go back button */}
          <GoBackBtn />
        </LinearGradient>
      </View>
    );
  }
};

export default UpdateMyInfo;

const styles = StyleSheet.create({});
