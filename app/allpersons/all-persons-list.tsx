import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import GoBackBtn from '@/components/GoBackBtn';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import PersonsListCard from '@/components/PersonsList/PersonsListCard';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const AllPersonsList = () => {
  const [persons, setPersons] = useState<personsListType[]>([]);
  const [loading, setLoading] = useState(false);

  const GetAllPersonsList = async () => {
    setLoading(true);

    setPersons([]);
    const q = query(
      collection(db, 'personsList'),
      orderBy('arrangement', 'asc')
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as personsListType;
      setPersons((prev) => [...prev, docdata]);
    });
    setLoading(false);
  };

  useEffect(() => {
    GetAllPersonsList();
  }, []);

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
            All Persons List
          </Text>

          <Logo />
        </View>
        {persons?.length > 0 && loading == false ? (
          <>
            <View className='flex flex-row ml-5 mb-3'>
              <Text
                className='text-lg color-coTitle'
                style={{ fontFamily: 'outfit-medium' }}
              >
                There are
              </Text>
              <Text
                className='color-coSecondary text-xl mx-1'
                style={{ fontFamily: 'outfit-bold' }}
              >
                {persons?.length}
              </Text>
              <Text
                className='text-lg color-coTitle'
                style={{ fontFamily: 'outfit-medium' }}
              >
                persons in the list.
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
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
                onRefresh={GetAllPersonsList}
                refreshing={loading}
              />
            </ScrollView>
          </>
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

        {/* Go back button */}
        <GoBackBtn />
      </LinearGradient>
    </View>
  );
};

export default AllPersonsList;

const styles = StyleSheet.create({});
