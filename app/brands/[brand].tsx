import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

const Brand = () => {
  const { brand } = useLocalSearchParams();

  return (
    <View>
      <Text>{brand}</Text>
    </View>
  );
};

export default Brand;

const styles = StyleSheet.create({});
