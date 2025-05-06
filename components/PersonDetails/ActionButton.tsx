import {
  Alert,
  FlatList,
  Image,
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { images } from '@/constants/images';

type ActionButtonProps = {
  personDetails: personsListType | null;
};

const ActionButton: React.FC<ActionButtonProps> = ({ personDetails }) => {
  if (!personDetails) return null;

  const actionBtnMenu = [
    {
      id: 1,
      name: 'Call',
      icon: images.Call,
      url: `tel:${personDetails?.contact}`,
    },
    {
      id: 2,
      name: 'Mail',
      icon: images.Mail,
      url: `mailto:${personDetails?.frgMail}`,
    },
    {
      id: 3,
      name: 'Location',
      icon: images.Location,
      url: `https://www.google.com/maps/search/?api=1&query=${personDetails?.address}`,
    },
    {
      id: 4,
      name: 'Website',
      icon: images.Website,
      url: 'https://frgholding.com/',
    },
    {
      id: 5,
      name: 'Store',
      icon: images.Store,
      url: 'https://frg.store/',
    },
    {
      id: 6,
      name: 'Share',
      icon: images.Share,
      url: personDetails?.frgMail,
    },
  ];

  const OnPressHandler = async (item: { name: string; url: string }) => {
    if (!item.url) {
      Alert.alert('Invalid action', 'This action does not have a valid URL.');
      return;
    }

    if (item.name === 'Share') {
      Share.share({
        message: `${personDetails?.name} \n Joined @ ${personDetails?.joinDate} \n Code: ${personDetails?.code} \n Mail: ${personDetails?.frgMail} \n Report to: ${personDetails?.reportTo} \n Phone: ${personDetails?.contact} \n About: ${personDetails?.about}`,
      });
      return;
    }

    // const canOpen = await Linking.canOpenURL(item.url);
    // if (canOpen) {
    Linking.openURL(item.url);
    // } else {
    //   Alert.alert('Cannot open link', 'Please try again later.');
    // }
  };

  return (
    <View className='bg-white rounded-b-3xl p-5 mb-5'>
      <FlatList
        data={actionBtnMenu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className='items-center ml-2 mr-5'
            onPress={() => OnPressHandler(item)}
          >
            <Image source={item.icon} className='w-16 h-16' />
            <Text
              className='text-sm mt-2'
              style={{ fontFamily: 'outfit-regular' }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default ActionButton;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
