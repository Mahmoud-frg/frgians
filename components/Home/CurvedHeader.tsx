import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { images } from '@/constants/images';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

type CurvedHeaderProps = {
  scrollY: Animated.Value; // pass down from parent
};

const Header = ({ scrollY }: CurvedHeaderProps) => {
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomUserImage = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        const q = query(
          collection(db, 'personsList'),
          where('frgMail', '==', user.primaryEmailAddress.emailAddress)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setImageUrl(userData.imageUrl || null);
        }
      } catch (err) {
        console.warn('❌ Failed to fetch user profile from Firestore', err);
      }
    };

    fetchCustomUserImage();
  }, [user?.primaryEmailAddress?.emailAddress]);

  const profileImage = imageUrl ? { uri: imageUrl } : images.FRGwhiteBG;

  // Animate the curve depth when scrolling
  const borderRadius = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [width * 0.5, width * 0.15], // deeper curve → flatter
    extrapolate: 'clamp',
  });

  // Animate horizontal stretch (scaleX)
  const scaleX = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1.5, 1.1], // wide arc → narrower arc
    extrapolate: 'clamp',
  });

  return (
    <View className='w-full h-auto'>
      <Animated.View
        style={[
          styles.container,
          {
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
            transform: [{ scaleX }], // smooth stretched curve
          },
        ]}
      >
        <LinearGradient
          colors={[
            '#001920', // deep navy black (bottom base)
            '#00181f', // dark desaturated blue
            '#093341', // mid-indigo layer
            '#1E4451', // soft vibrant blue
            '#2B505D', // light glow blue (top-right)
          ]}
          style={styles.gradient}
          locations={[0, 0.25, 0.5, 0.75, 1]} // smooth transitions
          start={{ x: 0, y: 1 }} // bottom left
          end={{ x: 1, y: 0 }} // top right
        ></LinearGradient>
      </Animated.View>

      <View className='absolute top-20 w-full z-10'>
        <View className='flex flex-row w-96 items-center self-center justify-between gap-5'>
          <View>
            <View className='flex flex-row items-center gap-1'>
              <Text
                className='text-xl color-secondary'
                style={{ fontFamily: 'outfit-regular' }}
              >
                Hi,
              </Text>
              <Text
                className='text-secondary text-xl'
                style={{ fontFamily: 'outfit-regular' }}
              >
                {user?.firstName}
              </Text>
            </View>

            <Text
              className='text-2xl color-secondary'
              style={{ fontFamily: 'outfit-semi-bold' }}
            >
              Welcome to FRG
            </Text>
          </View>

          <Image
            source={profileImage}
            className='w-16 h-16 rounded-full'
          />
        </View>

        <View
          className='flex flex-row items-center w-80 h-12 ml-10 mt-3 pl-3 gap-3 bg-secondary rounded-full'
          onTouchStart={() => router.push('/(tabs)/search')}
        >
          <Ionicons
            name='search'
            size={24}
            color='#393E46'
          />
          <TextInput
            placeholder='Search...'
            placeholderTextColor='#393E46'
            className='text-lg w-full color-title'
            style={{ fontFamily: 'outfit-regular' }}
          />
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    height: 220, // control header height
    // position: 'absolute',
    zIndex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    padding: 40,
  },
});
