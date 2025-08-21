import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';

const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const HelpItem = ({ title, description, onPress }: {
    title: string;
    description: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity onPress={onPress}>
      <Box
        backgroundColor="white"
        paddingHorizontal="m"
        paddingVertical="m"
        marginBottom="s"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box flex={1}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1A1A1A',
            marginBottom: 4,
          }}>
            {title}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#666666',
            lineHeight: 18,
          }}>
            {description}
          </Text>
        </Box>
        <Icon name="chevron-right" as any size={20} color="#C7C7CC" />
      </Box>
    </TouchableOpacity>
  );

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
            {t('helpCenter.title')}
          </Text>
        </Box>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Box paddingTop="m">
            <Box 
              backgroundColor="white" 
              marginHorizontal="m"
              marginBottom="s"
              borderRadius={12}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <HelpItem
                title={t('helpCenter.contactTeam')}
                description={t('helpCenter.contactDescription')}
                onPress={() => {
                  (navigation as any).navigate('Contact');
                }}
              />
            </Box>

            <Box 
              backgroundColor="white" 
              marginHorizontal="m"
              marginBottom="s"
              borderRadius={12}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <HelpItem
                title={t('helpCenter.accessFAQ')}
                description={t('helpCenter.faqDescription')}
                onPress={() => {
                  (navigation as any).navigate('FAQ');
                }}
              />
            </Box>
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
  );
};

export default HelpCenterScreen;
