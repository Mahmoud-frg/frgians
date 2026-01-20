import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import PersonsListCard from '@/components/PersonsList/PersonsListCard';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import GoBackBtn from '@/components/GoBackBtn';
import Logo from '@/components/Logo';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const PersonsListByCategory = () => {
  const navigation = useNavigation();
  const { category, name } = useLocalSearchParams();
  const [persons, setPersons] = useState<personsListType[]>([]);
  const [sectionHead, setSectionHead] = useState<personsListType[]>([]);
  const [loading, setLoading] = useState(false);

  // Used to get persons list by category
  const getPersonsList = async () => {
    setLoading(true);
    setPersons([]); // Clear the previous persons list

    const q = query(
      collection(db, 'personsList'),
      where('departmentId', '==', Number(category))
    );

    const querySnapshot = await getDocs(q);

    // Store the fetched persons in a temporary array
    const fetchedPersons: personsListType[] = [];

    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as personsListType;
      fetchedPersons.push({ id: doc.id, ...docdata });
    });

    // Now, sort the array by 'arrangement' in ascending order
    const sortedPersons = fetchedPersons.sort(
      (a, b) => Number(a.arrangement) - Number(b.arrangement)
    );

    // Update the state with the sorted array
    setPersons(sortedPersons);
    setLoading(false);
  };

  // Get section head person of the category
  const getDepartmentHead = async (category: number) => {
    try {
      setLoading(true);
      setSectionHead([]);

      const q = query(
        collection(db, 'personsList'),
        where('headOfSections', 'array-contains', category)
      );

      const querySnapshot = await getDocs(q);

      const fetchedPersons: personsListType[] = [];

      querySnapshot.forEach((doc) => {
        fetchedPersons.push({
          id: doc.id,
          ...(doc.data() as personsListType),
        });
      });

      setSectionHead(fetchedPersons);
    } catch (error) {
      console.error('Error fetching department head:', error);
      setSectionHead([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: name,
    });

    getPersonsList();
    getDepartmentHead(Number(category));
  }, []);

  // useEffect(() => {
  //   console.log('Updated sectionHead:', sectionHead);
  // }, [sectionHead]);

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
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Logo */}
          <View className='flex flex-row mx-5 justify-between items-center'>
            <Text
              className='color-coTitle text-3xl'
              style={{ fontFamily: 'outfit-bold' }}
            >
              {name}
            </Text>

            <Logo />
          </View>

          {/* Section head */}
          {sectionHead?.length > 0 && loading == false ? (
            <View className='relative self-center w-[90%] h-auto pb-4'>
              <View className='z-10 absolute  w-full flex self-center'>
                <View className='self-center h-52 w-52'>
                  <Image
                    source={
                      sectionHead[0]?.imageUrl === ''
                        ? images.FRGiansBG
                        : { uri: sectionHead[0]?.imageUrl }
                    }
                    className='rounded-full object-cover h-full w-full shadow-md self-center bg-secondary border-4 border-leaderBorder'
                  />
                </View>
              </View>

              <View className='z-0 rounded-xl overflow-hidden shadow-md bg-search mt-28 w-full self-center'>
                <View className='px-6 mt-28 pb-4'>
                  <Text
                    className='text-3xl text-center color-darkest'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    {sectionHead[0]?.name}
                  </Text>
                  <Text
                    className='text-coTitle text-2xl text-center'
                    style={{ fontFamily: 'outfit-medium' }}
                  >
                    {sectionHead[0]?.title}
                  </Text>
                </View>
              </View>
            </View>
          ) : loading ? (
            <ActivityIndicator
              size='large'
              color={Colors.coSecondary}
              className='self-center'
            />
          ) : (
            <Text
              className='text-2xl text-light-300 text-center'
              style={{ fontFamily: 'outfit-bold' }}
            >
              No Section Head Person Found
            </Text>
          )}

          {/* Persons */}
          {persons?.length > 0 && loading == false ? (
            <FlatList
              data={persons}
              renderItem={({ item, index }) => (
                <PersonsListCard
                  key={index}
                  person={item}
                />
              )}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              onRefresh={getPersonsList}
              refreshing={loading}
            />
          ) : loading ? (
            <ActivityIndicator
              size='large'
              color={Colors.coSecondary}
              className='mt-[50%] self-center'
            />
          ) : (
            <Text
              className='text-2xl text-light-300 text-center mt-[50%]'
              style={{ fontFamily: 'outfit-bold' }}
            >
              No Persons Found
            </Text>
          )}
        </ScrollView>

        {/* Go back button */}
        <GoBackBtn />
      </LinearGradient>
    </View>
  );
};

export default PersonsListByCategory;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
