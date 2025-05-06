import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Share,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { icons } from '@/constants/icons';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';

type MenuItem = {
  id: number;
  name: string;
  icon: any;
  path: string;
};

const MenuList = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const { user } = useUser();

  useEffect(() => {
    if (
      user?.primaryEmailAddress?.emailAddress === 'mahmoud.gamal@frg-eg.com'
    ) {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    const fetchCode = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const userEmail = user.primaryEmailAddress.emailAddress;

      const personsRef = collection(db, 'personsList');
      const q = query(personsRef, where('frgMail', '==', userEmail));

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setCode(doc.id); // document ID is the code
      }
    };

    fetchCode();
  }, [user]);

  const menuList = [
    ...(isAdmin
      ? [
          {
            id: 1,
            name: 'Add Person',
            icon: icons.add,
            path: '/persons/add-person',
          },
          {
            id: 2,
            name: 'Update Person',
            icon: icons.update,
            path: '/search',
          },
          { id: 3, name: 'Delete Person', icon: icons.dele, path: '/search' },
          {
            id: 6,
            name: 'Add News',
            icon: icons.addNews,
            path: '/news/add-news',
          },
          {
            id: 7,
            name: 'Delete News',
            icon: icons.deleNews,
            path: '/allnews/all-news-list',
          },
        ]
      : []),
    {
      id: 4,
      name: 'Update My Info',
      icon: icons.updateInfo,
      path: code ? `/persondetails/${code}` : '/search',
    },
    { id: 5, name: 'Share App', icon: icons.share, path: 'share' },
  ];

  const router = useRouter();

  const MenuListPressHandler = (item: MenuItem) => () => {
    // console.log('Current page:', currentRoute); // logs correct page at render time
    if (item.path === 'share') {
      Share.share({
        message:
          'Download FRGians App by FRG | IT department , Download URL: https://frgholding.com/',
      });
      return;
    }
    router.push({
      pathname: item.path as any,
      params: { from: 'profile' },
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={menuList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={MenuListPressHandler(item)}
          >
            <Image
              source={item.icon}
              style={styles.icon}
            />
            <Text style={styles.text}>{item.name}</Text>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
        numColumns={2}
      />
    </View>
  );
};

export default MenuList;

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    paddingHorizontal: 16,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    margin: 10,
    backgroundColor: 'white',
    borderColor: Colors.primary,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'outfit-medium',
  },
});
