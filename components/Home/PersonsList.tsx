import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import PersonCardItem from '../Person/PersonCardItem';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

const PersonsList = () => {
  const [persons, setPersons] = useState<personsListType[]>([]);
  const [loading, setLoading] = useState(false);

  const GetPersonsList = async () => {
    setLoading(true);

    setPersons([]);
    const q = query(
      collection(db, 'personsList'),
      orderBy('arrangement', 'asc'),
      limit(50)
    );
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
    <View className='w-full h-auto py-4 mt-1'>
      {persons ? (
        <View
          className='mb-2 pt-2'
          style={styles.shadow}
        >
          <View className='flex flex-row justify-between pl-2'>
            <Text
              className='text-2xl font-semibold color-title pl-4'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Our FRGians
            </Text>
            <TouchableOpacity
              onPress={() => onViewAllHandler()}
              className='mr-5 bg-seeAll rounded-full items-center justify-center px-3 py-1'
            >
              <Text
                className='color-darker'
                style={{ fontFamily: 'outfit-medium' }}
              >
                See all
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
            className='mt-2'
            // onRefresh={GetPersonsList}
            refreshing={loading}
          />
        </View>
      ) : (
        <ActivityIndicator
          size='large'
          color={Colors.coSecondary}
          className='mt-[50%] self-center'
        />
      )}
    </View>
  );
};

export default PersonsList;

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
