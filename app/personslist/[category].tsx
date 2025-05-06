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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import PersonsListCard from '@/components/PersonsList/PersonsListCard';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import GoBackBtn from '@/components/GoBackBtn';
import Logo from '@/components/Logo';

const PersonsListByCategory = () => {
  const navigation = useNavigation();
  const { category } = useLocalSearchParams();
  const [persons, setPersons] = useState<personsListType[]>([]);
  const [loading, setLoading] = useState(false);

  // Used to get persons list by category
  const getPersonsList = async () => {
    setLoading(true);
    setPersons([]);
    const q = query(
      collection(db, 'personsList'),
      where('department', '==', category)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as personsListType;
      setPersons((prev) => [...prev, { id: doc?.id, ...docdata }]);
    });
    setLoading(false);
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: category,
    });

    getPersonsList();
  }, []);

  return (
    <View className='bg-primary flex-1'>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Logo */}
        <View className='flex flex-row mx-5 justify-between items-center'>
          <Text
            className='color-title text-3xl'
            style={{ fontFamily: 'outfit-bold' }}
          >
            {category}
          </Text>

          <Logo />
        </View>
        {persons?.length > 0 && loading == false ? (
          <FlatList
            data={persons}
            renderItem={({ item, index }) => (
              <PersonsListCard key={index} person={item} />
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
            color='#ff0031'
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
