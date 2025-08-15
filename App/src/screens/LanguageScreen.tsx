import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Text } from '../components';

const LanguageScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('pt');

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'Inglês', flag: '🇺🇸' },
    { code: 'es', name: 'Espanhol', flag: '🇪🇸' },
  ];

  const LanguageOption = ({ language }: { language: any }) => (
    <TouchableOpacity onPress={() => setSelectedLanguage(language.code)}>
      <Box
        backgroundColor="white"
        paddingHorizontal="m"
        paddingVertical="m"
        marginBottom="s"
        borderRadius={8}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        style={{
          borderWidth: selectedLanguage === language.code ? 2 : 1,
          borderColor: selectedLanguage === language.code ? '#035A6E' : '#E5E5E5',
        }}
      >
        <Box flexDirection="row" alignItems="center">
          <Text style={{ fontSize: 20, marginRight: 12 }}>
            {language.flag}
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#1A1A1A',
            fontWeight: selectedLanguage === language.code ? '600' : '400',
          }}>
            {language.name}
          </Text>
        </Box>
        {selectedLanguage === language.code && (
          <Box
            width={20}
            height={20}
            borderRadius={10}
            backgroundColor="success"
            justifyContent="center"
            alignItems="center"
          >
            <Icon name="check" size={12} color="white" />
          </Box>
        )}
      </Box>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Box flex={1} backgroundColor="light">
        {/* Header */}
        <Box
          backgroundColor="white"
          paddingTop="l"
          paddingBottom="m"
          paddingHorizontal="m"
          flexDirection="row"
          alignItems="center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1A1A1A',
            marginLeft: 16,
          }}>
            Idioma
          </Text>
        </Box>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Box padding="m">
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1A1A1A',
              marginBottom: 8,
            }}>
              Selecione o idioma principal
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#666666',
              marginBottom: 24,
              lineHeight: 20,
            }}>
              Você poderá alterar o idioma sempre que precisar e também diretamente pelo player.
            </Text>

            {languages.map((language) => (
              <LanguageOption key={language.code} language={language} />
            ))}

            {/* Save Button */}
            <TouchableOpacity style={{ marginTop: 32 }}>
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
                  Salvar
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
    </>
  );
};

export default LanguageScreen;
