import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/configs/FirebaseConfig';

import GoBackBtn from '@/components/GoBackBtn';
import { useNavigationState } from '@react-navigation/native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import Logo from '@/components/Logo';
import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { images } from '@/constants/images';
import { LinearGradient } from 'expo-linear-gradient';

const BranchDetails = () => {
  const navigation = useNavigation();
  const { branch } = useLocalSearchParams();
  const [branchDetails, setBranchDetails] = useState<branchesListType | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Fetch branch details by ID
  const getBranchDetailsById = async (branch: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'branches', branch);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data() as branchesListType;
        setBranchDetails(docData);
      } else {
        console.warn(`No branches found with ID: ${branch}`);
        setBranchDetails(null);
      }
    } catch (error) {
      console.error('Error fetching branch details:', error);
      setBranchDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch and set branch details on component mount
  useEffect(() => {
    if (branch) {
      getBranchDetailsById(branch as string);
    }
  }, [branch]);

  // Set navigation options after root layout is mounted
  useEffect(() => {
    if (branch) {
      navigation.setOptions({
        headerShown: true,
        headerTitle: branch,
      });
    }
  }, [branch, navigation]);

  const navStack = useNavigationState((state) => {
    return state.routes.map((r) => r.name);
  });

  const BranchLocationHandler = () => {
    const location = branchDetails?.location; // e.g., "30.072261797196283,31.34443872883488"

    if (!location) return;

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location}`;
    Linking.openURL(mapsUrl).catch((err) =>
      console.error('Failed to open Google Maps:', err)
    );
  };

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
            {branchDetails?.brand}
          </Text>
          <Logo />
        </View>
        <Text
          className='text-lg color-coTitle ml-5 mb-3'
          style={{ fontFamily: 'outfit-medium' }}
        >
          Here is the store
        </Text>

        <TouchableOpacity
          className='flex flex-row self-center items-center w-auto p-2 mx-2 rounded-3xl bg-backBtn'
          onPress={() => BranchLocationHandler()}
        >
          <Ionicons
            name='location'
            size={30}
            color='#CD1818'
          />
          <Text
            className='text-lg ml-2 text-darkest'
            style={{ fontFamily: 'outfit-bold' }}
          >
            Location
          </Text>
        </TouchableOpacity>

        {/* Information (details) about the branch */}
        {/* <ScrollView className='mb-24 bg-slate-100 rounded-3xl'> */}
        <ScrollView className='mb-24 rounded-3xl'>
          <View className='flex items-center'>
            {loading ? (
              <ActivityIndicator
                size='large'
                color={Colors.coSecondary}
                className='mt-[50%] self-center'
              />
            ) : (
              <View className='relative self-center w-[95%] my-5'>
                <View className='z-10 absolute  w-full flex self-center'>
                  <View className='self-center h-80 w-[90%] bg-darkest rounded-3xl'>
                    <Image
                      source={
                        branchDetails?.imgUrl === ''
                          ? images.FRGwhiteBG
                          : { uri: branchDetails?.imgUrl }
                      }
                      className='rounded-3xl object-cover h-full w-full shadow-md self-center border-4 border-darkest'
                      resizeMode='cover'
                    />
                  </View>
                </View>

                <View className='rounded-xl overflow-hidden shadow-md bg-backBtn mt-60 w-full self-center'>
                  <View className='px-6 mt-24 pb-5'>
                    <Text
                      className='text-3xl text-center color-title'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      {branchDetails?.name}
                    </Text>

                    <Text
                      className='text-left text-coSecondary mt-5'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      Store Manager
                    </Text>

                    <Text
                      className='text-coTitle text-2xl text-left'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      {branchDetails?.manager}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Go back button */}
        <GoBackBtn />
      </LinearGradient>
    </View>
  );
};

export default BranchDetails;

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
