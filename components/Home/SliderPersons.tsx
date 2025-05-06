import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { db } from '@/configs/FirebaseConfig';
import { collection, getDocs, query } from 'firebase/firestore';
import TrendingCard from '../LeadersSlider/TrendingCard';

const SliderPersons = () => {
  const [sliderList, setSliderList] = useState<SliderType[]>([]);
  const [loading, setLoading] = useState(false);

  const GetSliderList = async () => {
    setLoading(true);
    setSliderList([]);
    const q = query(collection(db, 'slider'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as SliderType;
      setSliderList((prev) => [...prev, docdata]);
    });
    setLoading(false);
  };

  useEffect(() => {
    GetSliderList();
  }, []);

  return (
    <>
      {sliderList ? (
        <View className='p-2 mt-5'>
          <Text
            className='text-2xl font-semibold color-title pl-4'
            style={{ fontFamily: 'outfit-bold' }}
          >
            # Our Leaders
          </Text>
          {/* <FlatList
      data={sliderList}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      style={{ padding: 20 }}
      renderItem={({ item, index }) => (
        <Image
          source={{ uri: item.imageUrl }}
          className='w-40 h-40 mr-4 rounded-full'
          resizeMode='cover'
        />
      )}
    /> */}
          <FlatList
            className='mb-2 mt-2'
            data={sliderList}
            renderItem={({ item, index }) => (
              <TrendingCard
                person={item}
                index={index}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className='w-auto' />}
            onRefresh={GetSliderList}
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

export default SliderPersons;

const styles = StyleSheet.create({});
