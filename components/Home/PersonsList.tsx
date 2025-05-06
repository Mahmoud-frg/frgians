import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import PersonCardItem from '../Person/PersonCardItem';
import { router } from 'expo-router';

const PersonsList = () => {
  const [persons, setPersons] = useState<personsListType[]>([]);
  const [loading, setLoading] = useState(false);

  const GetPersonsList = async () => {
    setLoading(true);

    setPersons([]);
    const q = query(collection(db, 'personsList'), limit(50));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as personsListType;
      setPersons((prev) => [...prev, docdata]);
    });
    setLoading(false);
  };

  useEffect(() => {
    GetPersonsList();
  }, []);

  const onViewAllHandler = () => {
    router.push(`/allpersons/all-persons-list`);
  };

  return (
    <>
      {persons ? (
        <View
          className='p-2 mt-5'
          style={styles.shadow}
        >
          <View className='flex flex-row justify-between p-1'>
            <Text
              className='text-2xl font-semibold color-title pl-4'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Our FRGians
            </Text>
            <TouchableOpacity
              onPress={() => onViewAllHandler()}
              className='mr-5'
            >
              <Text
                className='color-slate-600'
                style={{ fontFamily: 'outfit-medium' }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={persons}
            renderItem={({ item, index }) => (
              <PersonCardItem
                key={index}
                person={item}
                onPersonPress={(code, name) =>
                  router.push(`/persondetails/${code}`)
                }
              />
            )}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            className='ml-3 mt-2'
            onRefresh={GetPersonsList}
            refreshing={loading}
          />
        </View>
      ) : (
        <ActivityIndicator
          size='large'
          color='#ff0031'
          className='mt-[50%] self-center'
        />
      )}
    </>
  );
};

export default PersonsList;

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
