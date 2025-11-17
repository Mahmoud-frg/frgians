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
import { Colors } from '@/constants/Colors';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';

// export type BrandsType = {
//   id: number;
//   name: string;
//   founded: string;
//   imageUrl: ImageSourcePropType;
//   motto: string;
// };

type Props = {
  itemList: BrandsType[];
};

export const BrandsList = [
  {
    id: 1,
    name: 'SKECHERS',
    founded: '1992',
    imageUrl: images.skx,
    motto: 'The comfort technology company',
  },
  {
    id: 2,
    name: 'ANTA',
    founded: '1994',
    imageUrl: images.anta,
    motto: 'Anta sports brand',
  },
  {
    id: 3,
    name: 'ECCO',
    founded: '1963',
    imageUrl: images.ecco,
    motto: 'Shoes for life',
  },
  {
    id: 4,
    name: 'UMBRO',
    founded: '1924',
    imageUrl: images.umbro,
    motto: 'Umbro sports brand',
  },
  {
    id: 5,
    name: 'COLE HAAN',
    founded: '1928',
    imageUrl: images.cole,
    motto: 'Cole haan brand',
  },
];

const SliderBrands = ({ itemList }: Props) => {
  const [brandsList, setBrandsList] = useState<BrandsType[]>([]);

  const [paginationIndex, setPaginationIndex] = useState(0);
  const [data, setData] = useState<BrandsType[]>([]);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [loading, setLoading] = useState(false);

  const ref = useAnimatedRef<Animated.FlatList<any>>();
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollX = useSharedValue(0);
  const offset = useSharedValue(0);

  // ✅ Get brands from Firestore and set as constant-like array
  const GetBrandsList = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'brands'));
      const querySnapshot = await getDocs(q);
      const fetchedBrands: BrandsType[] = [];
      querySnapshot.forEach((doc) => {
        fetchedBrands.push(doc.data() as BrandsType);
      });

      // Treat it as a "constant array" after fetching
      setBrandsList(fetchedBrands);
      setData([...fetchedBrands, ...fetchedBrands, ...fetchedBrands]);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetBrandsList();
  }, []);

  // useEffect(() => {
  //   setLoading(true);

  //   setTimeout(() => {
  //     // Duplicate data for smooth looping
  //     setData([...itemList, ...itemList, ...itemList]);
  //   }, 500);

  //   setLoading(false);
  // }, [itemList]);

  // ✅ Auto scroll animation
  useEffect(() => {
    if (isAutoPlay && data.length > 0) {
      interval.current = setInterval(() => {
        const nextOffset = offset.value + SCREEN_WIDTH;
        const maxOffset = SCREEN_WIDTH * (data.length - 1);

        offset.value = nextOffset >= maxOffset ? 0 : nextOffset;
      }, 4000);
    }
    return () => clearInterval(interval.current ?? undefined);
  }, [isAutoPlay, data.length]);

  useDerivedValue(() => {
    scrollTo(ref, offset.value, 0, true);
  });

  // useEffect(() => {
  //   if (isAutoPlay) {
  //     interval.current = setInterval(() => {
  //       const nextOffset = offset.value + SCREEN_WIDTH;
  //       const maxOffset = SCREEN_WIDTH * (data.length - 1);

  //       if (nextOffset >= maxOffset) {
  //         offset.value = 0;
  //       } else {
  //         offset.value = nextOffset;
  //       }
  //     }, 4000);
  //   }

  //   return () => {
  //     clearInterval(interval.current ?? undefined);
  //   };
  // }, [isAutoPlay, data.length]);

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
    <View className='w-full h-auto py-4 mt-1'>
      {data ? (
        <View className=''>
          <View className='flex flex-row justify-between p-2'>
            <Text
              className='text-2xl font-semibold color-title pl-4'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Brands
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
          color={Colors.coSecondary}
          className='mt-[50%] self-center'
        />
      )}
    </View>
  );
};

export default SliderBrands;

const styles = StyleSheet.create({});
