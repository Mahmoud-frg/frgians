import { View, Text, ScrollView, Image } from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import Header from '@/components/Home/Header';
import SliderPersons from '@/components/Home/SliderPersons';
import Category from '@/components/Home/Category';
import PersonsList from '@/components/Home/PersonsList';
import { images } from '@/constants/images';
import Logo from '@/components/Logo';
import SliderBrands, { ImageSlider } from '@/components/Home/SliderBrands';
import NewsList from '@/components/Home/News';

const home = () => {
  const { user } = useUser();

  return (
    <ScrollView>
      {/* Logo */}
      <Logo />
      {/* Header */}
      <Header />
      {/* SliderPersons */}
      <SliderPersons />
      {/* SliderBrands */}
      <SliderBrands itemList={ImageSlider} />
      {/* News */}
      <NewsList />
      {/* Category */}
      <Category />
      {/* List */}
      <PersonsList />
    </ScrollView>
  );
};

export default home;
