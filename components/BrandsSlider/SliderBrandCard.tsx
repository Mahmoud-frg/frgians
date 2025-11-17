import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { memo } from 'react';
// import { BrandsType } from '../Home/SliderBrands';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { router } from 'expo-router';

type Props = {
  item: BrandsType;
  index: number;
  scrollX: SharedValue<number>;
};

export const { width: SCREEN_WIDTH } = Dimensions.get('screen');
export const CARD_WIDTH = SCREEN_WIDTH * 0.7;

const SliderBrandCard = ({ item, index, scrollX }: Props) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ],
            [-SCREEN_WIDTH * 0.25, 0, SCREEN_WIDTH * 0.25],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollX.value,
            [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ],
            [0.7, 1, 0.7],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const onPressBrandHandler = (item: BrandsType) => {
    console.log(item.name);

    router.push({
      pathname: '/brands/[brand]',
      params: { brand: item.name },
    });
  };

  return (
    <View className='items-center'>
      <Animated.View
        style={[{ width: SCREEN_WIDTH }, animatedStyle]}
        className='items-center justify-center relative'
      >
        <View
          className='w-auto h-auto p-3 mb-5 items-center rounded-3xl bg-brands'
          style={styles.shadow}
        >
          <View
            style={{ width: CARD_WIDTH, height: 350 }}
            className='rounded-2xl bg-white items-center justify-center overflow-hidden'
          >
            <Image
              source={{ uri: item.imageUrl }}
              // source={item.imageUrl}
              className='w-full h-full rounded-2xl'
              resizeMode='cover'
            />
          </View>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)']}
            style={{
              width: CARD_WIDTH,
              height: 350,
              borderRadius: 14,
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 10,
              padding: 20,
              margin: 10.5,
              justifyContent: 'space-between',
            }}
            className='absolute p-5 justify-between'
          >
            <View className='items-end'>
              <TouchableOpacity
                className='rounded-full p-4 w-16 h-16'
                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                onPress={() => onPressBrandHandler(item)}
              >
                <Ionicons
                  name='open'
                  size={28}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View>
            <Text
              className='text-2xl color-title'
              style={{ fontFamily: 'outfit-bold' }}
            >
              {item.name}
            </Text>
          </View>
          <View>
            <Text
              className='text-xl color-leaderTitle'
              style={{ fontFamily: 'outfit-slim' }}
            >
              Since {item.founded}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default memo(SliderBrandCard); // 🧠 Memoized to avoid re-renders

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
