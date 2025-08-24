import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Box, Text, Input, Card } from '../components';
import { searchCities, getRecentSearches } from '../services/CityService';
import { City } from '../types';

type RootStackParamList = {
  SelectCity: undefined;
  City: { cityId: string };
};

type SelectCityScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SelectCity'>;

const SelectCityScreen: React.FC = () => {
  const navigation = useNavigation<SelectCityScreenNavigationProp>();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearching(true);
      performSearch();
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadRecentSearches = async () => {
    try {
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const performSearch = async () => {
    try {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching cities:', error);
    }
  };

  const handleCitySelect = (city: City) => {
    navigation.navigate('City', { cityId: city.id });
  };

  const renderSearchResult = ({ item }: { item: City }) => (
    <TouchableOpacity onPress={() => handleCitySelect(item)}>
      <Box
        flexDirection="row"
        alignItems="center"
        paddingVertical="m"
        paddingHorizontal="l"
        borderBottomWidth={1}
        borderBottomColor="light"
      >
        <Text marginRight="m">📍</Text>
        <Box>
          <Text variant="body" color="textPrimary">
            {item.name}, {item.state}
          </Text>
          <Text variant="body" color="secondary" fontSize={14}>
            {item.totalDistance}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => setSearchQuery(item)}>
      <Box
        flexDirection="row"
        alignItems="center"
        paddingVertical="m"
        paddingHorizontal="l"
        borderBottomWidth={1}
        borderBottomColor="light"
      >
        <Text marginRight="m">🕒</Text>
        <Text variant="body" color="textPrimary">
          {item}
        </Text>
      </Box>
    </TouchableOpacity>
  );

  return (
    <Box flex={1} backgroundColor="white">
      {/* Header */}
      <Box backgroundColor="primary" padding="l" paddingTop="xl">
        <Box flexDirection="row" alignItems="center" marginBottom="m">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Box
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="white"
              justifyContent="center"
              alignItems="center"
              marginRight="m"
            >
              <Text>←</Text>
            </Box>
          </TouchableOpacity>
          <Text variant="header" color="white" flex={1}>
            TURoad
          </Text>
          <TouchableOpacity>
            <Text color="white">✕</Text>
          </TouchableOpacity>
        </Box>

        <Input
          placeholder={t('selectCity.title')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ backgroundColor: 'white' }}
        />
      </Box>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        {isSearching ? (
          <Box>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `search-${index}-${item.id}`}
              scrollEnabled={false}
            />
          </Box>
        ) : (
          <Box padding="l">
            <Text variant="subheader" color="textPrimary" marginBottom="m">
              {t('selectCity.recentSearches')}
            </Text>
            <FlatList
              data={recentSearches}
              renderItem={renderRecentSearch}
              keyExtractor={(item, index) => `recent-${index}`}
              scrollEnabled={false}
            />
          </Box>
        )}
      </ScrollView>
    </Box>
  );
};

export default SelectCityScreen;

