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
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { db, storage } from '@/configs/FirebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from 'firebase/firestore';
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
import RNPickerSelect from 'react-native-picker-select';
import { Colors } from '@/constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from '@expo/vector-icons/Ionicons';

type CategoryDropdownOption = {
  label: string;
  value: number;
};

const UpdatePerson = () => {
  const { user } = useUser();

  const { code } = useLocalSearchParams<{ code?: string }>(); // Get code from route params
  const navigation = useNavigation();

  const [personData, setPersonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [arrangement, setArrangement] = useState<number>(0);
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

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(personData?.departmentId || null);

  useFocusEffect(
    React.useCallback(() => {
      if (!code) {
        console.warn('❌ Missing code param');
        return;
      }

      navigation.setOptions({
        headerTitle: 'Update Person',
        headerShown: true,
      });

      const fetchPerson = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, 'personsList', code as string);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setPersonData(data);

            // Pre-fill the fields
            setAbout(data.about);
            setAddress(data.address);
            setMobile(data.contact);
            setEmergency(data.emergency);
            setDepartment(data.department);
            setDepartmentId(data.departmentId);
            setEmail(data.frgMail);
            setImage(data.imageUrl);
            setJoinDate(data.joinDate);
            setJobDescription(data.jobDescription);
            setDateOfBirth(data.dateOfBirth);
            setName(data.name);
            setReportTo(data.reportTo);
            setTitle(data.title);
            setArrangement(data.arrangement);
            setIsAdmin(data.isAdmin);
          } else {
            console.log('❌ No such document!');
          }
        } catch (error) {
          console.error('❌ Firestore fetch failed:', error);
        }
        setLoading(false);
      };

      GetCategory();
      fetchPerson();
    }, [code])
  );

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
    if (type === 'mobile') {
      setMobile(numericText);
    }
    if (type === 'arrangement') {
      setArrangement(numericText);
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

      const timestamp = Date.now(); // This is a number (milliseconds)
      const actualDate = new Date(timestamp);
      const safeDate = actualDate.toISOString().replace(/[:.]/g, '-'); // replaces colons and dots

      // console.log(actualDate.toDateString()); // e.g. "Thu Apr 10 2025"
      // console.log(actualDate.toLocaleDateString()); // e.g. "4/10/2025"
      // console.log(actualDate.toISOString()); // e.g. "2025-04-10T14:23:45.000Z"

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
        const imgDownloadUrl = await getDownloadURL(storageRef); // ← you need to return this
        // console.log('🌐 Download URL:', imgDownloadUrl);
        // use imgDownloadUrl here
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
    if (department !== personData.department)
      updatedFields.department = department;
    if (departmentId !== personData.departmentId)
      updatedFields.departmentId = Number(departmentId);
    if (email !== personData.frgMail) updatedFields.frgMail = email;
    if (imgUrl !== personData.imageUrl) updatedFields.imageUrl = imgUrl;
    if (joinDate !== personData.joinDate) updatedFields.joinDate = joinDate;
    if (jobDescription !== personData.jobDescription)
      updatedFields.jobDescription = jobDescription;
    if (dateOfBirth !== personData.dateOfBirth)
      updatedFields.dateOfBirth = dateOfBirth;
    if (name !== personData.name) updatedFields.name = name;
    if (reportTo !== personData.reportTo) updatedFields.reportTo = reportTo;
    if (title !== personData.title) updatedFields.title = title;
    if (arrangement !== personData.arrangement)
      updatedFields.arrangement = Number(arrangement);
    if (isAdmin !== personData.isAdmin) updatedFields.isAdmin = isAdmin;

    updatedFields.userName = user?.fullName;
    updatedFields.userEmail = user?.primaryEmailAddress?.emailAddress;
    updatedFields.userImage = user?.imageUrl;

    if (Object.keys(updatedFields).length === 3) {
      //3 : userName, userEmail, userImage
      // ToastAndroid.show('No changes detected.', ToastAndroid.SHORT);
      Toast.show({
        type: 'info', // 'info' is good for neutral messages
        text1: 'No changes detected.',
        position: 'bottom',
        visibilityTime: 2000, // Equivalent to ToastAndroid.SHORT
      });
      setUpdating(false);
      return;
    }

    await updateDoc(docRef, updatedFields);

    setLoading(false);

    // ToastAndroid.show('Person updated successfully!', ToastAndroid.LONG);
    Toast.show({
      type: 'success',
      text1: 'Person updated successfully!',
      position: 'bottom',
      visibilityTime: 4000, // Equivalent to ToastAndroid.LONG
    });

    router.back();
  };

  const toggleIsAdmin = () => {
    setIsAdmin((prev) => !prev); // flip the value
    console.log('Toggled to:', !isAdmin);
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
              Update Person
            </Text>
            <Logo />
          </View>
          <Text
            className='text-lg color-coSecondary ml-5 mb-3'
            style={{ fontFamily: 'outfit-medium' }}
          >
            Fill details you want to update
          </Text>

          <KeyboardAwareFlatList
            data={[{}]} // dummy single item to render the full form
            enableAutomaticScroll={true}
            keyExtractor={() => 'form'}
            renderItem={() => (
              <View className='mb-24 bg-dataHolder rounded-3xl'>
                {/* Information (details) about a person */}
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
                      Title
                    </Text>
                    <TextInput
                      className='w-[80%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                      onChangeText={setTitle}
                      value={title}
                      placeholder={personData?.title || 'title'}
                      placeholderTextColor='#42424290'
                      style={{ fontFamily: 'outfit-regular' }}
                    />
                  </View>

                  <View className='flex flex-row items-center w-[90%] justify-between'>
                    <Text
                      className='text-xl mr-3 text-coTitle'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      Department
                    </Text>
                    {/* <View className='w-[65%] h-12 rounded-lg bg-title border-2 border-zinc-300'>
                <RNPickerSelect
                  onDonePress={() => console.log('Picker closed')}
                  onOpen={() => console.log('Picker opened')}
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
                    label: personData?.department || 'Select a department',
                    value: personData?.departmentId || null,
                    color: Colors.coSecondary, // Gray-400 for placeholder
                  }}
                  style={{
                    placeholder: {
                      color: '#000000',
                      fontSize: 16,
                    },
                    inputIOS: {
                      color: '#000000',
                      fontSize: 16,
                      height: 48,
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                    },
                    inputAndroid: {
                      color: '#000000',
                      fontSize: 16,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                    },
                    inputIOSContainer: {
                      height: 48,
                      justifyContent: 'center',
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
                        placeholder={
                          personData?.department || 'Select a department'
                        }
                        placeholderStyle={{
                          color: Colors.icons,
                        }}
                        style={{
                          backgroundColor: '#F5F5F5',
                          borderColor: '#d4d4d4',
                        }}
                        dropDownContainerStyle={{
                          backgroundColor: '#FFF',
                          borderColor: '#d4d4d4',
                          maxHeight: 'auto',
                        }}
                        textStyle={{
                          fontSize: 16,
                          color: '#000',
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
                      className='w-[75%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                      onChangeText={setReportTo}
                      value={reportTo}
                      placeholder={personData?.reportTo || 'report to'}
                      placeholderTextColor='#42424290'
                      style={{ fontFamily: 'outfit-regular' }}
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
                      E-Mail
                    </Text>
                    <TextInput
                      className='w-[80%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                      autoCapitalize='none'
                      onChangeText={setEmail}
                      value={email}
                      placeholder={
                        personData?.frgMail || 'ex: name.name@frg-eg.com'
                      }
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
                      Join date
                    </Text>
                    <TextInput
                      className='w-[75%] pl-3 py-3 rounded-lg bg-secondary border-2 border-zinc-300'
                      onChangeText={setJoinDate}
                      value={joinDate}
                      placeholder={personData?.joinDate || 'ex: 01-01-2001'}
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

                  <View className='flex flex-row items-center w-[90%] justify-between'>
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
                      placeholder={
                        personData?.jobDescription || 'job description'
                      }
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
                    disabled={updating}
                    onPress={UpdatePersonHandler}
                    className='w-96 py-3 rounded-lg bg-coSecondary'
                  >
                    {updating ? (
                      <ActivityIndicator color='title' />
                    ) : (
                      <Text
                        className='text-xl text-center text-darkest'
                        style={{ fontFamily: 'outfit-bold' }}
                      >
                        Update Person
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{
              borderRadius: 24,
            }}
            nestedScrollEnabled
          />

          {/* Go back button */}
          <GoBackBtn />
        </LinearGradient>
      </View>
    );
  }
};

export default UpdatePerson;

const styles = StyleSheet.create({});
