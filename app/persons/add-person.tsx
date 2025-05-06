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
import RNPickerSelect from 'react-native-picker-select';
import { collection, doc, getDocs, query, setDoc } from 'firebase/firestore';
import { db, storage } from '@/configs/FirebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useUser } from '@clerk/clerk-expo';

type CategoryDropdownOption = {
  label: string;
  value: number;
};

const AddPerson = () => {
  const navigation = useNavigation();

  const { user } = useUser();

  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [reportTo, setReportTo] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [about, setAbout] = useState('');

  const [categoryList, setCategoryList] = useState<CategoryDropdownOption[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const GetCategory = async () => {
    setCategoryList([]);
    setLoading(true);
    const q = query(collection(db, 'category'));
    const querySnapshot = await getDocs(q);

    const categories: CategoryDropdownOption[] = [];

    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as CategoryType;
      categories.push({ label: docdata.name, value: Number(docdata.id) });
    });

    setCategoryList(categories); // ✅ Set once
    setLoading(false);
  };

  const setCategory = (label: string, value: number) => {
    setDepartment(label);
    setDepartmentId(value);
  };

  const onChanged = (text: string, type: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (type === 'code') {
      setCode(numericText);
    }
    if (type === 'mobile') {
      setMobile(numericText);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add New Person',
      headerShown: true,
    });

    GetCategory();
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

  const AddNewPersonHandler = async () => {
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

      const fileName = `${code}-${name}-${safeDate}.jpeg`;
      const res = await fetch(image);
      const blob = await res.blob(); // This is fine in React Native with Expo SDK 49+

      if (blob.type && !blob.type.startsWith('image/')) {
        console.warn('⚠️ Selected file is not an image!');
        return;
      }

      const storageRef = ref(storage, `frgians/images/${fileName}`);

      await uploadBytes(storageRef, blob)
        .then(() => {
          console.log('✅ File uploaded successfully!');
          return getDownloadURL(storageRef); // ← you need to return this
        })
        .then((imgDownloadUrl) => {
          // console.log('🌐 Download URL:', imgDownloadUrl);
          // use imgDownloadUrl here
          savePersonDetails(imgDownloadUrl);
        })
        .catch((error) => {
          console.error('❌ Error uploading or getting URL:', error);
        });
    } else {
      // Image not changed, just update the rest of the fields
      await savePersonDetails('');
    }

    setLoading(false);
  };

  const savePersonDetails = async (imgUrl: string) => {
    await setDoc(doc(db, 'personsList', code.toString()), {
      about: about,
      address: address,
      code: Number(code),
      contact: mobile,
      department: department,
      departmentId: Number(departmentId),
      frgMail: email,
      imageUrl: imgUrl,
      joinDate: joinDate,
      name: name,
      reportTo: reportTo,
      title: title,
      userName: user?.fullName,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      userImage: user?.imageUrl,
    });

    setLoading(false);

    ToastAndroid.show('New Person Added...', ToastAndroid.LONG);

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
          Add New Person
        </Text>
        <Logo />
      </View>
      <Text
        className='text-lg color-slate-600 ml-5 mb-3'
        style={{ fontFamily: 'outfit-medium' }}
      >
        Fill all details to add a new person
      </Text>

      {/* Information (details) about a person */}
      <ScrollView className='mb-28 bg-slate-100 rounded-3xl'>
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
              onChangeText={(val) => setName(val)}
              value={name}
              placeholder='name'
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>
          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Code
            </Text>
            <TextInput
              className='w-[80%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              keyboardType='numeric'
              onChangeText={(text) => onChanged(text, 'code')}
              value={code}
              placeholder='code'
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>
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
          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Department
            </Text>
            <View className='w-[65%] rounded-lg bg-white border-2 border-zinc-300'>
              <RNPickerSelect
                onValueChange={(value) => {
                  const numericValue = Number(value); // ensures value is a number
                  const selectedItem = categoryList.find(
                    (item) => item.value === numericValue
                  );
                  if (selectedItem) {
                    setCategory(selectedItem.label, numericValue);
                  }
                }}
                items={categoryList}
                placeholder={{ label: 'Select a department', value: null }}
              />
            </View>
          </View>
          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Report to
            </Text>
            <TextInput
              className='w-[75%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              onChangeText={(val) => setReportTo(val)}
              value={reportTo}
              placeholder='report to'
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
              placeholder='mobile'
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>
          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              E-Mail
            </Text>
            <TextInput
              className='w-[80%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              autoCapitalize='none'
              onChangeText={(val) => setEmail(val)}
              value={email}
              placeholder='ex: name.name@frg-eg.com'
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
              onChangeText={(val) => setAddress(val)}
              value={address}
              placeholder='ex: nasr city'
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>
          <View className='flex flex-row items-center w-[90%] justify-between'>
            <Text
              className='text-xl mr-3 text-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Join date
            </Text>
            <TextInput
              className='w-[75%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
              onChangeText={(val) => setJoinDate(val)}
              value={joinDate}
              placeholder='ex: 01-01-2001'
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
              onChangeText={(val) => setAbout(val)}
              value={about}
              placeholder='about'
              multiline
              numberOfLines={5}
              style={{ fontFamily: 'outfit-regular' }}
            />
          </View>
        </View>

        <View className='my-5 flex items-center'>
          <TouchableOpacity
            disabled={loading}
            onPress={() => AddNewPersonHandler()}
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
                Add New Person
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

export default AddPerson;

const styles = StyleSheet.create({});
