import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { icons } from "@/constants/icons";

const PersonCard = ({
  player_id,
  player_name,
  player_number,
  player_image,
  player_type,
  player_rating,
}: Person) => {
  return (
    <Link href={`/employees/${player_id}`} asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{
            uri: player_image
              ? `${player_image}`
              : "https://placehold.co/600x400/1a1a1a/ffffff.png",
          }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />
        <Text
          className="text-sm font-bold text-secondary mt-2"
          numberOfLines={1}
        >
          {player_number}⚽{player_name}
        </Text>

        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4" />
          <Text className="text-xs text-secondary font-bold uppercase">
            {player_rating}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-zinc-700 font-medium mt-1">
            {player_type}
          </Text>
          <Text className="text-xs font-medium text-zinc-700 uppercase">
            FRG
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default PersonCard;
