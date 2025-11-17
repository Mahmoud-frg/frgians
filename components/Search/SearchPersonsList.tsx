import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import SearchPersonsListCard from './SearchPersonsListCard';
import { Colors } from '@/constants/Colors';

type Props = {
  persons: personsListType[];
  loading: boolean;
  searchQuery?: string;
};

// ✅ Memoized Item Renderer
const MemoizedPersonCard = React.memo(
  ({ person }: { person: personsListType }) => {
    return <SearchPersonsListCard person={person} />;
  }
);

const SearchPersonsList: React.FC<Props> = ({
  persons,
  loading,
  searchQuery,
}) => {
  const renderItem: ListRenderItem<personsListType> = useCallback(
    ({ item }) => <MemoizedPersonCard person={item} />,
    []
  );

  if (loading) {
    return (
      <ActivityIndicator
        size='large'
        color={Colors.coSecondary}
        className='mt-[50%] self-center'
      />
    );
  }

  if (!loading && persons.length === 0) {
    return (
      <Text
        className='text-2xl text-light-300 text-center mt-[50%]'
        style={{ fontFamily: 'outfit-bold' }}
      >
        {searchQuery?.trim() ? 'No persons found' : 'Search for persons'}
      </Text>
    );
  }

  return (
    <FlatList
      data={persons}
      keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
      renderItem={renderItem}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 200 }}
    />
  );
};

export default SearchPersonsList;
