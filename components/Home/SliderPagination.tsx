import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SCREEN_WIDTH } from '../BrandsSlider/SliderBrandCard';

type Props = {
  items: BrandsType[];
  paginationIndex: number;
  scrollX: SharedValue<number>;
};

const SliderPagination = ({ items, paginationIndex, scrollX }: Props) => {
  return (
    <View className='flex flex-row h-4 justify-center items-center mt-5'>
      {items.map((_, index) => {
        const pgAnimationStyles = useAnimatedStyle(() => {
          const dotWidth = interpolate(
            scrollX.value,
            [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ],
            [8, 20, 8],
            Extrapolation.CLAMP
          );
          return {
            width: dotWidth,
          };
        });

        return (
          <Animated.View
            key={index}
            className='h-2 w-2 mx-1.5 rounded-full'
            style={[
              {
                backgroundColor: paginationIndex === index ? '#222' : '#aaa',
              },
              pgAnimationStyles,
            ]}
          />
        );
      })}
    </View>
  );
};

export default SliderPagination;

const styles = StyleSheet.create({});
