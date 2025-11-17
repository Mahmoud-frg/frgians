import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { icons } from '@/constants/icons';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { orginAdmins, db } from '@/configs/FirebaseConfig';
import { Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/configs/FirebaseConfig';

type MenuItem = {
  id: number;
  name: string;
  icon: any;
  path: string;
  from: string;
};

const MenuList = () => {
  const [isOrginAdmin, setIsOrginAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [personDetails, setPersonDetails] = useState<personsListType | null>(
    null
  );

  const { user } = useUser();

  // useEffect(() => {
  //   if (
  //     user?.primaryEmailAddress?.emailAddress === 'mahmoud.gamal@frg-eg.com'
  //   ) {
  //     setIsOrginAdmin(true);
  //   }
  // }, []);

  useEffect(() => {
    if (
      orginAdmins.includes(user?.primaryEmailAddress?.emailAddress as string)
    ) {
      setIsOrginAdmin(true);
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

  // Used to get persons list by id
  const GetPersonDetailsById = async (
    personid: string,
    setPersonDetails: React.Dispatch<
      React.SetStateAction<personsListType | null>
    >
  ) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'personsList', personid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data() as personsListType;
        setPersonDetails(docData);
      } else {
        console.warn(`No document found with ID: ${personid}`);
        setPersonDetails(null);
      }
    } catch (error) {
      console.error('Error fetching person details:', error);
      setPersonDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      GetPersonDetailsById(code as string, setPersonDetails);
    }
  }, [code]);

  const menuList = [
    ...(isOrginAdmin || personDetails?.isAdmin
      ? [
          {
            id: 1,
            name: 'Add Person',
            icon: icons.add,
            path: '/persons/add-person',
            from: 'profile',
          },
          {
            id: 2,
            name: 'Update Person',
            icon: icons.update,
            path: '/search',
            from: 'profile',
          },
          {
            id: 3,
            name: 'Delete Person',
            icon: icons.dele,
            path: '/search',
            from: 'profile',
          },
          {
            id: 6,
            name: 'Add News',
            icon: icons.addNews,
            path: '/news/add-news',
            from: 'profile-add-news',
          },
          {
            id: 7,
            name: 'Delete News',
            icon: icons.deleNews,
            path: '/allnews/all-news-list',
            from: 'profile',
          },
        ]
      : []),
    {
      id: 4,
      name: 'Update My Info',
      icon: icons.updateInfo,
      path: code ? `/persondetails/${code}` : '/search',
      from: 'profile',
    },
    {
      id: 8,
      name: 'Delete Account',
      icon: icons.deleAcc,
      path: 'deleteAccount',
      from: 'profile',
    },
    {
      id: 5,
      name: 'Share App',
      icon: icons.share,
      path: 'share',
      from: 'profile',
    },
  ];

  const router = useRouter();

  const { signOut } = useAuth();

  const functions = getFunctions(app);

  const handleDeleteAccount = async () => {
    try {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to permanently delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              if (!user) return;
              setLoading(true);

              // Call Firebase Function
              const deleteClerkUser = httpsCallable(
                functions,
                'deleteClerkUser'
              );
              await deleteClerkUser({ userId: user.id });

              setLoading(false);
              // Sign out locally
              await signOut();

              Alert.alert(
                'Account Deleted',
                'Your account has been deleted successfully.'
              );
            },
          },
        ]
      );
    } catch (err) {
      console.error('Error deleting account:', err);
      Alert.alert('Error', 'Something went wrong while deleting your account.');
    }
  };

  const MenuListPressHandler = (item: MenuItem) => () => {
    // console.log('Current page:', currentRoute); // logs correct page at render time

    if (item.path === 'deleteAccount') {
      handleDeleteAccount();
      return;
    }

    if (item.path === 'share') {
      Share.share({
        message:
          'Download and install FRGians App by FRG | IT department , Download URL: https://drive.google.com/drive/folders/1M4odnEW11iTICymd0TEcpsGAqRY3rsqz?usp=drive_link',
      });
      return;
    }

    router.push({
      pathname: item.path as any,
      params: { from: 'profile' },
    });
  };

  if (!code || loading || !personDetails) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator
          size='large'
          color={Colors.coSecondary}
        />
      </View>
    );
  } else {
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
  }
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
    backgroundColor: '#F6F6F650',
    borderColor: '#F8CA37',
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
    color: Colors.primary,
  },
});
