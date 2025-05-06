import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import SearchPersonsListCard from './SearchPersonsListCard';
import PersonsListCard from '../PersonsList/PersonsListCard';

type Props = {
  persons: personsListType[];
  loading: boolean;
  searchQuery?: string;
};

const SearchPersonsList: React.FC<Props> = ({
  persons,
  loading,
  searchQuery,
}) => {
  return (
    <ScrollView>
      {persons?.length > 0 && loading == false ? (
        <FlatList
          data={persons}
          renderItem={({ item, index }) => (
            <SearchPersonsListCard key={index} person={item} />
          )}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          //   onRefresh={}
          refreshing={loading}
        />
      ) : loading ? (
        <ActivityIndicator
          size='large'
          color='#ff0031'
          className='mt-[50%] self-center'
        />
      ) : (
        <Text
          className='text-2xl text-light-300 text-center mt-[50%]'
          style={{ fontFamily: 'outfit-bold' }}
        >
          {searchQuery?.trim() ? 'No persons found' : 'Search for persons'}
        </Text>
      )}
    </ScrollView>
  );
};

export default SearchPersonsList;
