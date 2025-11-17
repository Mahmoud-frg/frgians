import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import useFetch from '@/services/useFetch';
import { fetchPersonDetails } from '@/services/api';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import Intro from '@/components/PersonDetails/Intro';
import ActionButton from '@/components/PersonDetails/ActionButton';
import GoBackBtn from '@/components/GoBackBtn';
import { useNavigationState } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const PersonDetails = () => {
  const navigation = useNavigation();
  const { personid } = useLocalSearchParams();
  const [personDetails, setPersonDetails] = useState<personsListType | null>(
    null
  );
  const [loading, setLoading] = useState(false);

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
    navigation.setOptions({
      headerShown: true,
      headerTitle: personid,
    });

    if (personid) {
      GetPersonDetailsById(personid as string, setPersonDetails);
    }
  }, [navigation, personid]);

  const navStack = useNavigationState((state) => {
    return state.routes.map((r) => r.name);
  });

  // console.log('Stack:', navStack);

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
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        {/* <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className='w-full h-screen bg-primary px-5 pt-5'>
          <View className='relative self-center w-full'>
            <View className='z-10 absolute  w-full flex self-center'>
              <View className='self-center h-52 w-52'>
                <Image
                  source={{ uri: personDetails?.imageUrl }}
                  className='rounded-full object-cover h-full w-full shadow-md self-center border-4 border-primary'
                />
              </View>
            </View>

            <View className='z-0 rounded-xl overflow-hidden shadow-md bg-secondary mt-28 w-full self-center'>
              <View className='px-6 mt-24'>
                <Text
                  className='text-3xl text-center'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  {personDetails?.name}
                </Text>
                <Text
                  className='text-title text-lg text-center'
                  style={{ fontFamily: 'outfit-medium' }}
                >
                  {personDetails?.title}
                </Text>
                <Text
                  className='text-center text-gray-600'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  {personDetails?.department}
                </Text>
                <Text
                  className='text-center text-gray-600  pt-3 font-normal'
                  style={{ fontFamily: 'outfit-regular' }}
                >
                  Joined @ {personDetails?.joinDate}
                </Text>
                <Text
                  className='text-center text-gray-600 pt-3 pb-3 font-normal'
                  style={{ fontFamily: 'outfit-regular' }}
                >
                  {personDetails?.about}
                </Text>
                <Text
                  className='text-center text-gray-600 mb-3 font-normal'
                  style={{ fontFamily: 'outfit-regular' }}
                >
                  {personDetails?.contact}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView> */}
        {loading ? (
          <ActivityIndicator
            size='large'
            color={Colors.coSecondary}
            className='mt-[50%] self-center'
          />
        ) : (
          <View>
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
              {personDetails ? (
                <>
                  {/* Intro */}
                  <Intro personDetails={personDetails} />

                  {/* Action buttons */}
                  <ActionButton personDetails={personDetails} />
                </>
              ) : (
                <ActivityIndicator
                  size='large'
                  color={Colors.coSecondary}
                  className='mt-[50%] self-center'
                />
              )}
            </ScrollView>
          </View>
        )}

        {/* Go back button */}
        <GoBackBtn />
      </LinearGradient>
    </View>
  );
};

export default PersonDetails;
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
