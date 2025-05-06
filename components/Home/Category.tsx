import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { db } from '@/configs/FirebaseConfig';
import { collection, getDocs, query } from 'firebase/firestore';
import CategoryItem from '../Category/CategoryItem';
import { useRouter } from 'expo-router';
import { useNavigationState } from '@react-navigation/native';

type CategoryProps = {
  search?: boolean;
  onCategorySelect?: (name: string) => void;
};

const Category: React.FC<CategoryProps> = ({
  search = false,
  onCategorySelect,
}) => {
  const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  const GetCategory = async () => {
    setLoading(true);
    setCategoryList([]);
    const q = query(collection(db, 'category'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as CategoryType;
      setCategoryList((prev) => [...prev, docdata]);
    });
    setLoading(false);
  };

  useEffect(() => {
    GetCategory();
  }, []);

  const onCategoryPressHandler = (name: string) => {
    if (!search) {
      router.push(`/personslist/${name}`);
      // console.log('Current page:', currentRoute);
    }
    if (search && onCategorySelect) {
      onCategorySelect(name);
      // console.log('Current page:', currentRoute);
    }
  };

  return (
    <>
      {!loading && categoryList.length === 0 && (
        <Text className='text-center mt-10 text-gray-500'>
          No Categories Found
        </Text>
      )}
      {categoryList.length > 0 ? (
        <View className='p-2 mt-5'>
          {!search && (
            <View className='flex flex-row justify-between p-1'>
              <Text
                className='text-2xl font-semibold color-title pl-4'
                style={{ fontFamily: 'outfit-bold' }}
              >
                Our Departments
              </Text>
              {/* <Text
              className='color-slate-600'
              style={{ fontFamily: 'outfit-medium' }}
            >
              View All
            </Text> */}
            </View>
          )}
          <FlatList
            data={categoryList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <CategoryItem
                key={index}
                category={item}
                onCategoryPress={(id, name) => onCategoryPressHandler(name)}
              />
            )}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            className='ml-3 mt-2'
            onRefresh={GetCategory}
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

export default Category;

const styles = StyleSheet.create({});
