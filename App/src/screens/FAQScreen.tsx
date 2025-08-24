import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';
import FAQService, { FAQ } from '../services/FAQService';
import { useLanguageRefresh } from '../hooks/useDataRefresh';

const FAQScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [faqData, setFaqData] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load FAQs from backend
  const loadFAQs = async () => {
    try {
      setError(null);
      const data = await FAQService.getFAQs();
      setFaqData(data);
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load FAQs on mount and when language changes
  useEffect(() => {
    loadFAQs();
  }, []);

  // Refresh data when language changes
  useLanguageRefresh(() => {
    loadFAQs();
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadFAQs();
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const FAQItem = ({ item }: { item: FAQ }) => {
    const isExpanded = expandedItems[item.id.toString()];

    return (
      <TouchableOpacity onPress={() => toggleExpanded(item.id.toString())}>
        <Box
          backgroundColor="white"
          marginBottom="s"
          borderRadius={8}
          paddingHorizontal="m"
          paddingVertical="m"
        >
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1A1A1A',
              flex: 1,
              marginRight: 12,
            }}>
              {item.question}
            </Text>
            <Icon 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666666" 
            />
          </Box>
          {isExpanded && (
            <Box marginTop="m">
              <Text style={{
                fontSize: 14,
                color: '#666666',
                lineHeight: 20,
              }}>
                {item.answer}
              </Text>
            </Box>
          )}
        </Box>
      </TouchableOpacity>
    );
  };

  return (
      <Box flex={1} backgroundColor="light">
        {/* Header */}
        <Box
          backgroundColor="white"
          paddingBottom="m"
          paddingHorizontal="m"
          flexDirection="row"
          alignItems="center"
          style={{
            paddingTop: 80,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1A1A1A',
            marginLeft: 16,
          }}>
            Perguntas frequentes
          </Text>
        </Box>

        {/* Content */}
        {loading ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#035A6E" />
          </Box>
        ) : error ? (
          <Box flex={1} justifyContent="center" alignItems="center" padding="m">
            <Text style={{ color: '#666666', textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity onPress={loadFAQs} style={{ marginTop: 16 }}>
              <Text style={{ color: '#035A6E', fontWeight: '600' }}>Try Again</Text>
            </TouchableOpacity>
          </Box>
        ) : (
          <ScrollView 
            style={{ flex: 1 }} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Box padding="m">
              {faqData.length === 0 ? (
                <Box padding="xl" alignItems="center">
                  <Text style={{ color: '#666666', textAlign: 'center' }}>No FAQs available</Text>
                </Box>
              ) : (
                faqData.map((item) => (
                  <FAQItem key={item.id.toString()} item={item} />
                ))
              )}
            </Box>
            <Box height={20} />
          </ScrollView>
        )}
      </Box>
  );
};

export default FAQScreen;
