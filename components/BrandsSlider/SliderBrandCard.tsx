import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { memo } from 'react';
import { ImageSliderType } from '../Home/SliderBrands';
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
  item: ImageSliderType;
  index: number;
  scrollX: SharedValue<number>;
};

export const { width: SCREEN_WIDTH } = Dimensions.get('screen');
export const CARD_WIDTH = SCREEN_WIDTH * 0.8;

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

  const onPressBrandHandler = (item: ImageSliderType) => {
    // router.push({
    //   pathname: '/brands/[brand]',
    //   params: { brand: item.id },
    // });

    console.log(item.title);
  };

  return (
    <Animated.View
      style={[{ width: SCREEN_WIDTH }, animatedStyle]}
      className='items-center justify-center'
    >
      <View
        style={{ width: CARD_WIDTH, height: 200 }}
        className='rounded-3xl bg-white p-12'
      >
        <Image
          source={item.image}
          className='w-full h-full rounded-3xl'
          resizeMode='contain'
        />
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)']}
        style={{ width: CARD_WIDTH, height: 200, borderRadius: 20 }}
        className='absolute p-5 justify-between'
      >
        <View className='items-end'>
          <TouchableOpacity
            className='rounded-full p-4 w-16 h-16'
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            onPress={() => onPressBrandHandler(item)}
          >
            <Ionicons
              name='open'
              size={28}
              color={Colors.light.background}
            />
          </TouchableOpacity>
        </View>
        {/* <View>
          <Text
            className='text-2xl color-white'
            style={{ fontFamily: 'outfit-semi-bold' }}
          >
            {item.title}
          </Text>
        </View> */}
      </LinearGradient>
    </Animated.View>
  );
};

export default memo(SliderBrandCard); // 🧠 Memoized to avoid re-renders

const styles = StyleSheet.create({});
