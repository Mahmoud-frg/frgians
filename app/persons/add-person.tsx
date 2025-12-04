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
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
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
import { Colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  const [arrangement, setArrangement] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [reportTo, setReportTo] = useState('');
  const [mobile, setMobile] = useState('');
  const [emergency, setEmergency] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [about, setAbout] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [categoryList, setCategoryList] = useState<CategoryDropdownOption[]>(
    []
  );

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);

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

  const onChanged = (text: any, type: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (type === 'code') {
      setCode(numericText);
    }
    if (type === 'arrangement') {
      setArrangement(numericText);
    }
    if (type === 'mobile') {
      setMobile(numericText);
    }
    if (type === 'emergency') {
      setEmergency(numericText);
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
    const isFormValid = () => {
      if (
        !name ||
        !code ||
        !title ||
        !department ||
        !reportTo ||
        !email ||
        !joinDate
      ) {
        // ToastAndroid.show(
        //   '⚠️ Please fill all fields before submitting.',
        //   ToastAndroid.LONG
        // );
        Toast.show({
          type: 'error',
          text1: '⚠️ Please fill all fields before submitting.',
          position: 'bottom',
          visibilityTime: 4000, // Equivalent to ToastAndroid.LONG
        });
        return false;
      }
      return true;
    };

    if (!isFormValid()) return;

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
      arrangement: Number(arrangement),
      code: Number(code),
      contact: mobile,
      emergency: emergency,
      department: department,
      departmentId: Number(departmentId),
      frgMail: email,
      imageUrl: imgUrl,
      joinDate: joinDate,
      jobDescription: jobDescription,
      dateOfBirth: dateOfBirth,
      name: name,
      reportTo: reportTo,
      title: title,
      isAdmin: isAdmin,
      userName: user?.fullName,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      userImage: user?.imageUrl,
    });

    setLoading(false);

    // ToastAndroid.show('New Person Added...', ToastAndroid.LONG);
    Toast.show({
      type: 'success',
      text1: 'New Person Added...',
      position: 'bottom',
      visibilityTime: 4000, // Equivalent to ToastAndroid.LONG
    });

    router.back();
  };

  const toggleIsAdmin = () => {
    setIsAdmin((prev) => !prev); // flip the value
    console.log('Toggled to:', !isAdmin);
  };

  const scrollViewRef = useRef<any>(null);

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator
          size='large'
          color={Colors.coSecondary}
        />
      </View>
    );
  } else
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
          style={{ flex: 1, height: '100%', width: '100%' }}
        >
          {/* Logo */}
          <View className='flex flex-row mx-5 justify-between items-center'>
            <Text
              className='color-coTitle text-3xl'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Add New Person
            </Text>
            <Logo />
          </View>
          <Text
            className='text-lg color-coSecondary ml-5 mb-3'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Fill all details to add a new person
          </Text>

          <KeyboardAwareFlatList
            data={[{}]} // dummy single item to render the full form
            keyExtractor={() => 'form'}
            enableAutomaticScroll={true}
            contentContainerStyle={{
              flexGrow: 1,
              borderRadius: 24,
              paddingBottom: 150, // VERY IMPORTANT
            }}
            keyboardShouldPersistTaps='handled'
            enableOnAndroid
            extraScrollHeight={0}
            nestedScrollEnabled
            renderItem={() => (
              <View className='mb-24 bg-dataHolder rounded-3xl'>
                {/* Information (details) about a person */}

                <View className='flex items-center'>
                  <TouchableOpacity
                    className='w-52 h-52 m-5 rounded-2xl bg-black'
                    onPress={() => ImagePickHandler()}
                  >
                    <Image
                      source={!image ? images.FRGians : { uri: image }}
                      className='w-52 h-52 rounded-2xl bg-secondary'
                    />
                  </TouchableOpacity>
                  <Text
                    className='text-lg color-coTitle ml-5 mt-1'
                    style={{ fontFamily: 'outfit-medium' }}
                  >
                    Press on the image to pick up your photo
                  </Text>
                </View>

                <View className='gap-2 mt-3 flex items-center'>
                  <View className='flex flex-row items-center w-[90%] justify-between'>
                    <Text
                      className='text-xl mr-3 text-coTitle'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      Name
                    </Text>
                    <TextInput
                      className='w-[80%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      onChangeText={(val) => setName(val)}
                      value={name}
                      placeholder='name'
                      placeholderTextColor='#42424290'
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
                      Code
                    </Text>
                    <TextInput
                      className='w-[80%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      keyboardType='numeric'
                      onChangeText={(text) => onChanged(text, 'code')}
                      value={code}
                      placeholder='code'
                      placeholderTextColor='#42424290'
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
                      Title
                    </Text>
                    <TextInput
                      className='w-[80%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      onChangeText={(val) => setTitle(val)}
                      value={title}
                      placeholder='title'
                      placeholderTextColor='#42424290'
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
                      Department
                    </Text>
                    {/* <View className='w-[65%] h-12 rounded-lg bg-white border-2 border-zinc-300'>
                      <RNPickerSelect
                        useNativeAndroidPickerStyle={false}
                        onValueChange={(value) => {
                          const numericValue = Number(value);
                          const selectedItem = categoryList.find(
                            (item) => item.value === numericValue
                          );
                          if (selectedItem) {
                            setCategory(selectedItem.label, numericValue);
                          }
                        }}
                        items={categoryList}
                        placeholder={{
                          label: 'Select a department',
                          value: null,
                          color: Colors.coSecondary, // This is a Tailwind gray-400 (zinc-400) like color
                        }}
                        style={{
                          placeholder: {
                            color: '#1234',
                            fontSize: 16,
                          },
                          inputIOS: {
                            color: '#000000', // Text color for selected item (gray-800)
                            paddingVertical: 12,
                            paddingHorizontal: 10,
                            fontSize: 16,
                            height: 48,
                          },
                          inputAndroid: {
                            color: '#000000',
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            fontSize: 16,
                          },
                        }}
                      />
                    </View> */}

                    <View className='w-[65%]'>
                      <DropDownPicker
                        open={open}
                        value={value}
                        items={categoryList}
                        setOpen={setOpen}
                        setValue={(callback) => {
                          const selectedValue = callback(value);
                          setValue(selectedValue);

                          const selectedItem = categoryList.find(
                            (item) => item.value === selectedValue
                          );

                          if (selectedItem) {
                            setCategory(selectedItem.label, selectedItem.value);
                          }
                        }}
                        placeholder='Select a department'
                        placeholderStyle={{
                          color: Colors.icons || '#888888',
                          fontSize: 16,
                        }}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#d4d4d4',
                        }}
                        dropDownContainerStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#d4d4d4',
                          maxHeight: 'auto',
                        }}
                        textStyle={{
                          fontSize: 16,
                          color: '#000000',
                        }}
                      />
                    </View>
                  </View>

                  <View className='flex flex-row items-center w-[90%] justify-between'>
                    <Text
                      className='text-xl mr-3 text-coTitle'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      Report to
                    </Text>
                    <TextInput
                      className='w-[75%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      onChangeText={(val) => setReportTo(val)}
                      value={reportTo}
                      placeholder='report to'
                      placeholderTextColor='#42424290'
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
                      Arrangement
                    </Text>
                    <TextInput
                      className='w-[65%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      keyboardType='numeric'
                      onChangeText={(text) => onChanged(text, 'arrangement')}
                      value={String(arrangement)}
                      placeholder='arrangement'
                      placeholderTextColor='#42424290'
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
                      Contact
                    </Text>
                    <TextInput
                      className='w-[75%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      onChangeText={(text) => onChanged(text, 'mobile')}
                      value={mobile}
                      placeholder='mobile'
                      placeholderTextColor='#42424290'
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
                      Emergency
                    </Text>
                    <TextInput
                      className='w-[70%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      onChangeText={(text) => onChanged(text, 'emergency')}
                      value={emergency}
                      placeholder='emergency contact'
                      placeholderTextColor='#42424290'
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
                      E-Mail
                    </Text>
                    <TextInput
                      className='w-[80%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      autoCapitalize='none'
                      onChangeText={(val) => setEmail(val)}
                      value={email}
                      placeholder='ex: name.name@frg-eg.com'
                      placeholderTextColor='#42424290'
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
                      Address
                    </Text>
                    <TextInput
                      className='w-[75%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      autoCapitalize='none'
                      onChangeText={(val) => setAddress(val)}
                      value={address}
                      placeholder='ex: nasr city'
                      placeholderTextColor='#42424290'
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
                      Join date
                    </Text>
                    <TextInput
                      className='w-[75%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      onChangeText={(val) => setJoinDate(val)}
                      value={joinDate}
                      placeholder='ex: 01-01-2001'
                      placeholderTextColor='#42424290'
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
                      Date Of Birth
                    </Text>
                    <TextInput
                      className='w-[65%] pl-3 py-3 rounded-lg bg-white border-2 border-zinc-300'
                      onChangeText={(val) => setDateOfBirth(val)}
                      value={dateOfBirth}
                      placeholder='ex: 01-01-2001'
                      placeholderTextColor='#42424290'
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
                      Job Description
                    </Text>
                    <TextInput
                      className='w-[60%] h-24 pl-3 rounded-lg bg-white border-2 border-zinc-300'
                      onChangeText={(val) => setJobDescription(val)}
                      value={jobDescription}
                      placeholder='job description'
                      placeholderTextColor='#42424290'
                      multiline
                      numberOfLines={5}
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
                      About
                    </Text>
                    <TextInput
                      className='w-[80%] h-24 pl-3 rounded-lg bg-white border-2 border-zinc-300'
                      onChangeText={(val) => setAbout(val)}
                      value={about}
                      placeholder='about'
                      placeholderTextColor='#42424290'
                      multiline
                      numberOfLines={5}
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

                  <TouchableOpacity
                    className='flex flex-row self-center items-center w-auto py-1 px-4 mx-2 my-2 rounded-3xl bg-backBtn'
                    onPress={toggleIsAdmin}
                  >
                    <Ionicons
                      name={isAdmin ? 'cog-outline' : 'cog'}
                      size={30}
                      color={isAdmin ? '#ffffff' : '#192440'}
                    />
                    <Text
                      className={`text-lg ml-2 ${
                        isAdmin ? 'text-title' : 'text-darkest'
                      } `}
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      {isAdmin ? 'Not Admin' : 'Admin'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className='my-5 flex items-center'>
                  <TouchableOpacity
                    disabled={loading}
                    onPress={() => AddNewPersonHandler()}
                    className='w-96 py-3 rounded-lg bg-coSecondary'
                  >
                    {loading && (
                      <ActivityIndicator
                        size='large'
                        color='white'
                        className='self-center'
                      />
                    )}
                    {!loading && (
                      <Text
                        className='mx-auto text-xl  text-darkest'
                        style={{ fontFamily: 'outfit-bold' }}
                      >
                        Add New Person
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Go back button */}
          <GoBackBtn />
        </LinearGradient>
      </View>
    );
};

export default AddPerson;

const styles = StyleSheet.create({});
