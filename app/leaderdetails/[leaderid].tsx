import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { icons } from '@/constants/icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import { images } from '@/constants/images';
import GoBackBtn from '@/components/GoBackBtn';

const leaderDetails = () => {
  const navigation = useNavigation();
  const { leaderid } = useLocalSearchParams();
  const [leaderDetails, setLeaderDetails] = useState<SliderType | null>(null);
  const [loading, setLoading] = useState(false);

  // Used to get persons list by category
  const GetLeaderDetailsById = async (
    leaderid: string,
    setLeaderDetails: React.Dispatch<React.SetStateAction<SliderType | null>>
  ) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'slider', leaderid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data() as SliderType;
        setLeaderDetails(docData);
      } else {
        console.warn(`No document found with ID: ${leaderid}`);
        setLeaderDetails(null);
      }
    } catch (error) {
      console.error('Error fetching person details:', error);
      setLeaderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: leaderid,
    });

    if (leaderid) {
      GetLeaderDetailsById(leaderid as string, setLeaderDetails);
    }
  }, [navigation, leaderid]);

  return (
    <View className='bg-primary flex-1'>
      {loading ? (
        <ActivityIndicator
          size='large'
          color='#ff0031'
          className='mt-[50%] self-center'
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View className='w-full h-screen bg-primary px-5 pt-5'>
            <View className='relative self-center w-full'>
              <View className='z-10 absolute  w-full flex self-center'>
                <View className='self-center h-52 w-52'>
                  <Image
                    // source={{ uri: leaderDetails?.imageUrl }}
                    source={
                      leaderDetails?.name === 'Ahmed Azzam'
                        ? images.AA
                        : leaderDetails?.name === 'Mohamed Hanafy'
                        ? images.MH
                        : images.WH
                    }
                    className='rounded-full object-cover h-full w-full shadow-md self-center border-4 border-primary'
                  />
                </View>
              </View>

              <View className='z-0 rounded-xl overflow-hidden shadow-md bg-white mt-28 w-full self-center'>
                <View className='px-6 mt-28'>
                  <Text
                    className='text-3xl text-center'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    {leaderDetails?.name}
                  </Text>
                  <Text
                    className='text-title text-2xl text-center'
                    style={{ fontFamily: 'outfit-medium' }}
                  >
                    {leaderDetails?.title}
                  </Text>
                  <Text
                    className='text-center text-xl text-gray-600 pt-3 pb-5'
                    style={{ fontFamily: 'outfit-regular' }}
                  >
                    {leaderDetails?.about}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Go back button */}
      <GoBackBtn />
    </View>
  );
};

export default leaderDetails;

const styles = StyleSheet.create({});
