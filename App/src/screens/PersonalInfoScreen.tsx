import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text, Button } from '../components';

const PersonalInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('Altair');
  const [lastName, setLastName] = useState('Bezerra');

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
            {t('personalInfo.title')}
          </Text>
        </Box>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Box padding="m">
            {/* Email Section */}
            <Box marginBottom="l">
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1A1A1A',
                marginBottom: 8,
              }}>
                {t('personalInfo.yourEmail')}
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#999999',
                marginBottom: 16,
              }}>
                altair@gmail.com
              </Text>
            </Box>

            {/* Profile Photo Section */}
            <Box marginBottom="l">
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1A1A1A',
                marginBottom: 12,
              }}>
                {t('personalInfo.profilePhoto')}
              </Text>
              <Box flexDirection="row" alignItems="center">
                <Image
                  source={{ uri: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=AB' }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    marginRight: 12,
                  }}
                />
                <TouchableOpacity>
                  <Box
                    width={24}
                    height={24}
                    borderRadius={12}
                    backgroundColor="success"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon name="pencil" as any size={12} color="white" />
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box>

            {/* First Name */}
            <Box marginBottom="l">
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1A1A1A',
                marginBottom: 8,
              }}>
                {t('personalInfo.firstName')}
              </Text>
              <Box
                backgroundColor="white"
                borderRadius={8}
                paddingHorizontal="m"
                paddingVertical="m"
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                }}
              >
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  style={{
                    fontSize: 16,
                    color: '#1A1A1A',
                    padding: 0,
                  }}
                  placeholder={t('personalInfo.firstNamePlaceholder')}
                  placeholderTextColor="#999999"
                />
              </Box>
            </Box>

            {/* Last Name */}
            <Box marginBottom="xl">
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1A1A1A',
                marginBottom: 8,
              }}>
                {t('personalInfo.lastName')}
              </Text>
              <Box
                backgroundColor="white"
                borderRadius={8}
                paddingHorizontal="m"
                paddingVertical="m"
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                }}
              >
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  style={{
                    fontSize: 16,
                    color: '#1A1A1A',
                    padding: 0,
                  }}
                  placeholder={t('personalInfo.lastNamePlaceholder')}
                  placeholderTextColor="#999999"
                />
              </Box>
            </Box>

            {/* Save Button */}
            <TouchableOpacity>
              <Box
                backgroundColor="success"
                borderRadius={8}
                paddingVertical="m"
                justifyContent="center"
                alignItems="center"
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white',
                }}>
                  {t('personalInfo.saveInformation')}
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
  );
};

export default PersonalInfoScreen;
