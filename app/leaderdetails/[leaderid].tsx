import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { icons } from '@/constants/icons';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { orginAdmins, db } from '@/configs/FirebaseConfig';
import { images } from '@/constants/images';
import GoBackBtn from '@/components/GoBackBtn';
import { Colors } from '@/constants/Colors';
import Logo from '@/components/Logo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const leaderDetails = () => {
  const navigation = useNavigation();
  const { leaderid } = useLocalSearchParams<{ leaderid?: string }>();
  const [leaderDetails, setLeaderDetails] = useState<SliderType | null>(null);

  const [loading, setLoading] = useState(false);

  const [myProfile, setMyProfile] = useState(false);
  const [isOrginAdmin, setIsOrginAdmin] = useState(false);

  const [code, setCode] = useState<string | null>(null);
  const [personDetails, setPersonDetails] = useState<personsListType | null>(
    null
  );

  const { user } = useUser();

  useEffect(() => {
    const fetchCode = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const userEmail = user.primaryEmailAddress.emailAddress;

      const personsRef = collection(db, 'personsList');
      const q = query(personsRef, where('frgMail', '==', userEmail));

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setCode(doc.id); // document ID is the code
      }
    };

    fetchCode();
  }, [user]);

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
    if (code) {
      GetPersonDetailsById(code as string, setPersonDetails);
    }
  }, [code]);

  // Used to get leader details list by leaderid
  const GetLeaderDetailsById = async (
    leaderid: string,
    setLeaderDetails: React.Dispatch<React.SetStateAction<SliderType | null>>
  ) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'slider', leaderid as string);
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

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerShown: true,
        headerTitle: leaderid,
      });

      if (leaderid) {
        GetLeaderDetailsById(leaderid as string, setLeaderDetails);
      }
    }, [leaderid])
  );

  useEffect(() => {
    if (
      orginAdmins.includes(user?.primaryEmailAddress?.emailAddress as string)
    ) {
      setIsOrginAdmin(true);
    }

    if (user?.primaryEmailAddress?.emailAddress === leaderDetails?.frgMail) {
      setMyProfile(true);
    }
  }, []);

  const UserUpdateHandler = () => {
    router.replace({
      pathname: '/leaders/update-leader-info',
      params: {
        code: leaderid?.toString(),
        from: 'update-leader-info',
      },
    });
  };

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
        style={{ height: '100%', width: '100%' }}
      >
        {/* Logo */}
        <View className='flex flex-row mx-5 justify-between items-center'>
          <Text
            className='color-coTitle text-3xl'
            style={{ fontFamily: 'outfit-bold' }}
          >
            Leaders
          </Text>
          <Logo />
        </View>
        {loading ? (
          <ActivityIndicator
            size='large'
            color={Colors.coSecondary}
            className='mt-[50%] self-center'
          />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            <View className='w-full h-screen px-5 pt-5'>
              <View className='relative self-center w-full'>
                <View className='z-10 absolute  w-full flex self-center'>
                  <View className='self-center h-52 w-52'>
                    <Image
                      source={{ uri: leaderDetails?.imageUrl }}
                      // source={
                      //   leaderDetails?.name === 'Ahmed Azzam'
                      //     ? images.AA
                      //     : leaderDetails?.name === 'Mohamed Hanafy'
                      //     ? images.MH
                      //     : images.WH
                      // }
                      className='rounded-full object-cover h-full w-full shadow-md self-center border-4 border-leaderBorder'
                    />
                    {/* Edit Button on Circular Frame */}
                    {(myProfile || isOrginAdmin || personDetails?.isAdmin) && (
                      <TouchableOpacity
                        className='absolute top-2 right-2 bg-search border-2 border-leaderBorder p-2 rounded-full z-10'
                        activeOpacity={0.8}
                        onPress={() => UserUpdateHandler()}
                      >
                        <Ionicons
                          name='pencil-outline'
                          size={24}
                          color='#000000'
                        />
                        {/* <Text
                      className='text-lg w-auto color-title'
                      style={{ fontFamily: 'outfit-regular' }}
                    >
                      edit
                    </Text> */}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View className='z-0 rounded-xl overflow-hidden shadow-md bg-search mt-28 w-full self-center'>
                  <View className='px-6 mt-28'>
                    <Text
                      className='text-3xl text-center color-darkest'
                      style={{ fontFamily: 'outfit-bold' }}
                    >
                      {leaderDetails?.name}
                    </Text>
                    <Text
                      className='text-coSecondary text-2xl text-center'
                      style={{ fontFamily: 'outfit-medium' }}
                    >
                      {leaderDetails?.title}
                    </Text>
                    <Text
                      className='text-center text-xl text-darkest pt-3 pb-5'
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
      </LinearGradient>
    </View>
  );
};

export default leaderDetails;

const styles = StyleSheet.create({});
