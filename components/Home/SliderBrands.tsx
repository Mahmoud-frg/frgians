import {
  ActivityIndicator,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { images } from '@/constants/images';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import SliderBrandCard, { SCREEN_WIDTH } from '../BrandsSlider/SliderBrandCard';
import SliderPagination from './SliderPagination';

export type ImageSliderType = {
  id: number;
  title: string;
  image: ImageSourcePropType;
  description: string;
};

type Props = {
  itemList: ImageSliderType[];
};

export const ImageSlider = [
  {
    id: 1,
    title: 'SKECHERS',
    image: images.skx,
    description: 'The comfort technology company',
  },
  {
    id: 2,
    title: 'ANTA',
    image: images.anta,
    description: 'Anta sports brand',
  },
  {
    id: 3,
    title: 'UMBRO',
    image: images.umbro,
    description: 'Umbro sports brand',
  },
  {
    id: 4,
    title: 'ECCO',
    image: images.ecco,
    description: 'Shoes for life',
  },
  {
    id: 5,
    title: 'COLE HAAN',
    image: images.cole,
    description: 'Cole haan brand',
  },
];

const SliderBrands = ({ itemList }: Props) => {
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [data, setData] = useState<ImageSliderType[]>([]);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [loading, setLoading] = useState(false);

  const ref = useAnimatedRef<Animated.FlatList<any>>();
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollX = useSharedValue(0);
  const offset = useSharedValue(0);

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      // Duplicate data for smooth looping
      setData([...itemList, ...itemList, ...itemList]);
    }, 1000);

    setLoading(false);
  }, [itemList]);

  useEffect(() => {
    if (isAutoPlay) {
      interval.current = setInterval(() => {
        const nextOffset = offset.value + SCREEN_WIDTH;
        const maxOffset = SCREEN_WIDTH * (data.length - 1);

        if (nextOffset >= maxOffset) {
          offset.value = 0;
        } else {
          offset.value = nextOffset;
        }
      }, 4000);
    }

    return () => {
      clearInterval(interval.current ?? undefined);
    };
  }, [isAutoPlay, data.length]);

  useDerivedValue(() => {
    scrollTo(ref, offset.value, 0, true);
  });

  const onScrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
    onMomentumEnd: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (
      viewableItems.length > 0 &&
      viewableItems[0].index !== undefined &&
      viewableItems[0].index !== null
    ) {
      setPaginationIndex(viewableItems[0].index % itemList.length);
    }
  };

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig,
      onViewableItemsChanged,
    },
  ]);

  return (
    <>
      {data ? (
        <View className='mt-5'>
          <View className='flex flex-row justify-between p-2'>
            <Text
              className='text-2xl font-semibold color-title pl-4'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Our Brands
            </Text>
          </View>

          <Animated.FlatList
            data={data}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item, index }) => (
              <SliderBrandCard
                item={item}
                index={index}
                scrollX={scrollX}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            onScroll={onScrollHandler}
            scrollEventThrottle={16}
            decelerationRate='fast'
            bounces={false}
            viewabilityConfigCallbackPairs={
              viewabilityConfigCallbackPairs.current
            }
            ref={ref}
            onScrollBeginDrag={() => setIsAutoPlay(false)}
            onScrollEndDrag={() => setIsAutoPlay(true)}
            onMomentumScrollEnd={(e) => {
              const newOffset = e.nativeEvent.contentOffset.x;
              offset.value = newOffset; // update offset so autoplay continues from here
            }}
            onRefresh={() => setData([...itemList, ...itemList, ...itemList])}
            refreshing={loading}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />

          <SliderPagination
            items={itemList}
            scrollX={scrollX}
            paginationIndex={paginationIndex}
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

export default SliderBrands;

const styles = StyleSheet.create({});
