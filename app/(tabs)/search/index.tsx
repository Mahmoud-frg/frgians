import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
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
import {
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  limit,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import SearchPersonsList from '@/components/Search/SearchPersonsList';
import { useNavigationState } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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
  // const searchPersonsByNameOrCode = async (searchText: string) => {
  //   setLoading(true);
  //   setPersons([]);

  //   try {
  //     const q = query(collection(db, 'personsList'));
  //     const querySnapshot = await getDocs(q);

  //     const results: personsListType[] = [];

  //     const lowerSearch = searchText.toLowerCase();

  //     querySnapshot.forEach((doc) => {
  //       const data = doc.data() as personsListType;

  //       const name = data.name?.toLowerCase() || '';
  //       const code = String(data.code);

  //       if (name.includes(lowerSearch) || code.includes(searchText)) {
  //         results.push({ id: doc.id, ...data });
  //       }
  //     });

  //     // Now, sort the array by 'arrangement' in ascending order
  //     const sortedPersons = results.sort(
  //       (a, b) => Number(a.arrangement) - Number(b.arrangement)
  //     );

  //     // Update the state with the sorted array
  //     setPersons(sortedPersons);

  //     // setPersons(results);
  //   } catch (error) {
  //     console.error('Search error:', error);
  //   }

  //   setLoading(false);
  // };

  // Used to get persons list by name or code
  let searchTimeout: ReturnType<typeof setTimeout>;

  const searchPersonsByNameOrCode = async (searchText: string) => {
    // ✅ debounce - prevents spamming Firestore
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      if (!searchText.trim()) {
        setPersons([]);
        return;
      }

      setLoading(true);

      try {
        const lowerSearch = searchText.toLowerCase();

        let q;

        // ✅ Search by CODE (starts with)
        if (!isNaN(Number(searchText))) {
          q = query(
            collection(db, 'personsList'),
            orderBy('code_str'),
            startAt(searchText),
            endAt(searchText + '\uf8ff'),
            limit(30)
          );
        }

        // ✅ Search by NAME
        else {
          q = query(
            collection(db, 'personsList'),
            orderBy('name_lower'),
            startAt(lowerSearch),
            endAt(lowerSearch + '\uf8ff'),
            limit(30)
          );
        }

        const snapshot = await getDocs(q);

        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as personsListType),
        }));

        // ✅ Final safety sort
        results.sort((a, b) =>
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
        );

        setPersons(results);
      } catch (error) {
        console.error('Search error:', error);
      }

      setLoading(false);
    }, 400); // 400ms debounce
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

    // Store the fetched persons in a temporary array
    const fetchedPersons: personsListType[] = [];

    querySnapshot.forEach((doc) => {
      const docdata = doc.data() as personsListType;
      fetchedPersons.push({ id: doc.id, ...docdata });
    });

    // // Now, sort the array by 'code' in ascending order
    // const sortedPersons = fetchedPersons.sort((a, b) => a.code - b.code);

    // Now, sort the array by 'arrangement' in ascending order
    const sortedPersons = fetchedPersons.sort(
      (a, b) => Number(a.arrangement) - Number(b.arrangement)
    );

    // Update the state with the sorted array
    setPersons(sortedPersons);

    setLoading(false);
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      headerTitle: 'Search',
    });
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <View className='w-full h-full bg-secondary'>
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
                Explore more
              </Text>

              <Logo />
            </View>
            <View className='w-full h-auto'>
              {/* Search bar */}
              <View className='flex flex-row items-center w-[90%] h-14 mt-3 px-3 gap-3 bg-search rounded-2xl self-center'>
                <Ionicons
                  name='search'
                  size={24}
                  color={Colors.coSecondary}
                />
                <TextInput
                  ref={searchInputRef}
                  placeholder='Search...'
                  placeholderTextColor='#FFFFFF'
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
                  className='text-lg w-[90%] color-title'
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
            </View>
            {/* PersonsList */}
            <SearchPersonsList
              persons={persons}
              loading={loading}
              searchQuery={searchQuery}
            />
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default search;
