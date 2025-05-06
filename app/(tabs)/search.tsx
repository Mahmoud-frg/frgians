import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Category from '@/components/Home/Category';
import Logo from '@/components/Logo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import SearchPersonsList from '@/components/Search/SearchPersonsList';
import { useNavigationState } from '@react-navigation/native';

const search = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [persons, setPersons] = useState<personsListType[]>([]);
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      // Focus input when screen comes into focus
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100); // slight delay helps avoid race conditions with screen transition
    }, [])
  );

  // Used to get persons list by name or code
  const searchPersonsByNameOrCode = async (searchText: string) => {
    setLoading(true);
    setPersons([]);

    try {
      const q = query(collection(db, 'personsList'));
      const querySnapshot = await getDocs(q);

      const results: personsListType[] = [];

      const lowerSearch = searchText.toLowerCase();

      querySnapshot.forEach((doc) => {
        const data = doc.data() as personsListType;

        const name = data.name?.toLowerCase() || '';
        const code = String(data.code);

        if (name.includes(lowerSearch) || code.includes(searchText)) {
          results.push({ id: doc.id, ...data });
        }
      });

      setPersons(results);
    } catch (error) {
      console.error('Search error:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim()) {
        searchPersonsByNameOrCode(searchQuery.trim());
      } else {
        setPersons([]); // or reset to full list if needed
      }
    }, 300); // debounce delay

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Used to get persons list by category
  const getPersonsListByCategory = async (category: string) => {
    setLoading(true);
    setSearchQuery('');
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
      headerShown: false,
      headerTitle: 'Search',
    });
  }, []);

  return (
    <View>
      {/* Logo */}
      <View className='flex flex-row mx-5 justify-between items-center'>
        <Text
          className='color-title text-3xl'
          style={{ fontFamily: 'outfit-bold' }}
        >
          Explore more
        </Text>

        <Logo />
      </View>
      {/* Search bar */}
      <View className='flex flex-row items-center w-[90%] mt-3 pl-3 gap-3 bg-white rounded-2xl self-center border-2 border-primary'>
        <Ionicons name='search' size={24} color={Colors.primary} />
        <TextInput
          ref={searchInputRef}
          placeholder='Search...'
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          className='text-lg w-full'
          style={{ fontFamily: 'outfit-regular' }}
        />
      </View>
      {/* Department category */}
      <Category
        search={true}
        onCategorySelect={(category) => {
          getPersonsListByCategory(category);
        }}
      />
      {/* PersonsList */}
      <SearchPersonsList
        persons={persons}
        loading={loading}
        searchQuery={searchQuery}
      />
    </View>
  );
};

export default search;
