import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { images } from '@/constants/images';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import TiledBackground from '@/components/Auth/TiledBackground';
import Svg, { Pattern, Rect, Image as SvgImage } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

type CurvedHeaderProps = {
  scrollY: Animated.Value; // pass down from parent
};

const Header = ({ scrollY }: CurvedHeaderProps) => {
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [cardSize, setCardSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const fetchCustomUserImage = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        const q = query(
          collection(db, 'personsList'), // 👈 change if your collection is named differently
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

  const profileImage = imageUrl ? { uri: imageUrl } : images.FRGwhiteBG; // fallback to asset

  // interpolate curve radius
  const borderRadius = scrollY.interpolate({
    inputRange: [0, 200], // adjust scroll distance
    outputRange: [200, 20], // large curve → small curve
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        width: '100%',
        overflow: 'hidden',
        borderBottomLeftRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
      }}
    >
      {/* <View className='p-10 bg-darkest rounded-3xl mx-2'> */}
      {/* <View className='p-10 mx-2 rounded-3xl bg-news overflow-hidden relative'> */}
      {/* <ImageBackground
          source={images.darkBG3} // a large image with the pattern repeated manually
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          tintColor='#000000'
        /> */}

      <LinearGradient
        colors={[
          '#4a6878', // light glow blue (top-right)
          '#395a69', // soft vibrant blue
          '#395664', // mid-indigo layer
          '#093341', // dark desaturated blue
          '#00181f', // deep navy black (bottom base)
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]} // smooth transitions
        start={{ x: 0, y: 0 }} // bottom left
        end={{ x: 1, y: 1 }} // top right
        style={{
          // flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 50,
          paddingTop: 80,
          paddingBottom: 20,
          overflow: 'hidden',
          position: 'relative',
          // borderBottomRightRadius: '40%',
          // borderBottomLeftRadius: '40%',
        }}
      >
        <View className='flex flex-row w-full items-center justify-between gap-5'>
          <View className='flex flex-row items-center gap-1'>
            <View className=''>
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
          </View>
          <Image
            source={profileImage}
            className='w-16 h-16 rounded-full'
          />
        </View>
        {/* Search bar */}
        <View
          className='flex flex-row items-center h-12 mt-3 pl-3 gap-3 bg-secondary rounded-full'
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
      </LinearGradient>
      {/* </View> */}
      {/* </View> */}
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({});
