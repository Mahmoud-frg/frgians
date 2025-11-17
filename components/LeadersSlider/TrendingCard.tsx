import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { Link, router } from 'expo-router';
// import MaskedView from '@react-native-masked-view/masked-view';
import { images } from '@/constants/images';

const TrendingCard = ({
  person: { id, name, title, imageUrl },
  index,
}: TrendingCardProps) => {
  return (
    <TouchableOpacity
      className='w-auto relative pl-5 items-center'
      onPress={() => router.push(`/leaderdetails/${id}`)}
      activeOpacity={0.7}
    >
      <View className='w-40 h-40 p-1 border-0 border-leader rounded-full'>
        <Image
          source={{ uri: imageUrl }}
          // source={
          //   name === 'Ahmed Azzam'
          //     ? images.AA
          //     : name === 'Mohamed Hanafy'
          //     ? images.MH
          //     : images.WH
          // }
          className='w-36 h-36 rounded-full'
          resizeMode='cover'
        />
      </View>

      {/* <View className="absolute bottom-9 -left-3.5 px-2 py-1 rounded-full">
          <MaskedView
            maskElement={
              <Text className="font-bold text-secondary text-6xl">
                {index + 1}
              </Text>
            }
          >
            <Image
              source={images.rankingGradient}
              className="size-14"
              resizeMode="cover"
            ></Image>
          </MaskedView>
        </View> */}

      <Text
        className='mx-auto text-sm mt-2 text-title'
        numberOfLines={2}
        style={{ fontFamily: 'outfit-bold' }}
      >
        {name}
      </Text>
      <Text
        className='w-44 mx-auto text-center text-sm mt-2 text-leaderTitle'
        numberOfLines={2}
        style={{ fontFamily: 'outfit-regular' }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default TrendingCard;
