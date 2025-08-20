import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';

const ContactScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [name, setName] = useState('Altair Bezerra');
  const [email, setEmail] = useState('altair@gmail.com');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categories = [
    'Problema técnico',
    'Sugestão de melhoria',
    'Dúvida sobre o app',
    'Reportar conteúdo',
    'Parceria/Negócios',
    'Outro',
  ];

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder,
    multiline = false,
    editable = true
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    editable?: boolean;
  }) => (
    <Box marginBottom="l">
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
      }}>
        {label}
      </Text>
      <Box
        backgroundColor="white"
        borderRadius={8}
        paddingHorizontal="m"
        paddingVertical={multiline ? "m" : "m"}
        style={{
          borderWidth: 1,
          borderColor: '#E5E5E5',
          minHeight: multiline ? 120 : 'auto',
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={{
            fontSize: 16,
            color: editable ? '#1A1A1A' : '#999999',
            padding: 0,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          multiline={multiline}
          editable={editable}
        />
      </Box>
    </Box>
  );

  const CategoryDropdown = () => (
    <Box marginBottom="l">
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
      }}>
        Categoria da mensagem
      </Text>
      <TouchableOpacity onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
        <Box
          backgroundColor="white"
          borderRadius={8}
          paddingHorizontal="m"
          paddingVertical="m"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          style={{
            borderWidth: 1,
            borderColor: '#E5E5E5',
          }}
        >
          <Text style={{
            fontSize: 16,
            color: category ? '#1A1A1A' : '#999999',
          }}>
            {category || 'Selecione'}
          </Text>
          <Icon 
            name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#666666" 
          />
        </Box>
      </TouchableOpacity>
      
      {showCategoryDropdown && (
        <Box
          backgroundColor="white"
          borderRadius={8}
          marginTop="s"
          style={{
            borderWidth: 1,
            borderColor: '#E5E5E5',
          }}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                setCategory(cat);
                setShowCategoryDropdown(false);
              }}
            >
              <Box
                paddingHorizontal="m"
                paddingVertical="m"
                style={{
                  borderBottomWidth: index < categories.length - 1 ? 1 : 0,
                  borderBottomColor: '#F0F0F0',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: '#1A1A1A',
                }}>
                  {cat}
                </Text>
              </Box>
            </TouchableOpacity>
          ))}
        </Box>
      )}
    </Box>
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
            <Icon name="arrow-left" as any size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1A1A1A',
            marginLeft: 16,
          }}>
            Fale com a equipe TURoad
          </Text>
        </Box>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Box padding="m">
            <InputField
              label="Nome"
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome"
            />

            <InputField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
            />

            <CategoryDropdown />

            <InputField
              label="Descrição"
              value={message}
              onChangeText={setMessage}
              placeholder="Digite aqui sua mensagem."
              multiline={true}
            />

            {/* Send Button */}
            <TouchableOpacity style={{ marginTop: 16 }}>
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
                  Enviar mensagem
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

export default ContactScreen;
