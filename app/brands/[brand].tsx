import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import Logo from '@/components/Logo';

import GoBackBtn from '@/components/GoBackBtn';
import BranchesListCard from '@/components/Branches/BranchesListCard';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const Brand = () => {
  const { brand } = useLocalSearchParams();

  const [branches, setBranches] = useState<branchesListType[]>([]);
  const [loading, setLoading] = useState(false);

  const GetAllBranches = async () => {
    setLoading(true);

    setBranches([]);
    const q = query(collection(db, 'branches'), where('brand', '==', brand));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as branchesListType;
      setBranches((prev) => [...prev, docdata]);
    });
    setLoading(false);
  };

  useEffect(() => {
    GetAllBranches();
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
            {brand}
          </Text>

          <Logo />
        </View>
        {branches?.length > 0 && loading == false ? (
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
                {branches?.length}
              </Text>
              {/* <Text
              className='color-coTitle text-xl mx-1'
              style={{ fontFamily: 'outfit-bold' }}
            >
              {brand}
            </Text> */}
              <Text
                className='text-lg color-coTitle'
                style={{ fontFamily: 'outfit-medium' }}
              >
                stores in the list.
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
              <FlatList
                data={branches}
                renderItem={({ item }) => <BranchesListCard branch={item} />}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                columnWrapperStyle={{
                  justifyContent: 'space-between',
                  paddingHorizontal: 8,
                }}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                onRefresh={GetAllBranches}
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
            className='text-2xl text-coTitle text-center mt-[50%]'
            style={{ fontFamily: 'outfit-bold' }}
          >
            No branches Found
          </Text>
        )}

        {/* Go back button */}
        <GoBackBtn />
      </LinearGradient>
    </View>
  );
};

export default Brand;

const styles = StyleSheet.create({});
