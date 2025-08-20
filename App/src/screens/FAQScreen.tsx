import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';

const FAQScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const faqData = [
    {
      id: '1',
      question: 'Como funciona o modo "Rota ativa"?',
      answer: 'O app acompanha sua localização em tempo real e exibe conteúdos (áudios, imagens e textos) automaticamente conforme você se aproxima dos pontos turísticos da rota.',
    },
    {
      id: '2', 
      question: 'Posso usar o TURoad sem internet?',
      answer: 'Sim! Você pode baixar as rotas e conteúdos para usar offline. Apenas certifique-se de fazer o download enquanto estiver conectado à internet.',
    },
    {
      id: '3',
      question: 'Como escolher uma rota para começar?',
      answer: 'Na tela inicial, navegue pelas rotas disponíveis e toque em "Iniciar Rota". Você também pode filtrar por localização, duração ou interesse.',
    },
    {
      id: '4',
      question: 'O que são as sugestões baseadas na minha localização?',
      answer: 'Com base em onde você está, o app sugere rotas próximas, pontos de interesse e experiências culturais relevantes para sua região.',
    },
    {
      id: '5',
      question: 'Como salvo meus pontos favoritos?', 
      answer: 'Toque no ícone de coração em qualquer ponto turístico, cidade ou rota. Todos os favoritos ficam salvos na seção "Favoritos" do seu perfil.',
    },
    {
      id: '6',
      question: 'Como altero meu idioma no app?',
      answer: 'Vá em Perfil > Configurações > Idioma. Você também pode alterar o idioma específico dos áudios diretamente no player.',
    },
    {
      id: '7',
      question: 'Posso usar o app como visitante?',
      answer: 'Sim! É possível explorar o conteúdo sem criar uma conta, mas para salvar favoritos e personalizar sua experiência, recomendamos fazer login.',
    },
    {
      id: '8',
      question: 'Como o TURoad protege meus dados?',
      answer: 'Seus dados são protegidos com criptografia e seguimos as melhores práticas de segurança. Não compartilhamos informações pessoais com terceiros.',
    },
  ];

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const FAQItem = ({ item }: { item: any }) => {
    const isExpanded = expandedItems[item.id];

    return (
      <TouchableOpacity onPress={() => toggleExpanded(item.id)}>
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
            Perguntas frequentes
          </Text>
        </Box>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Box padding="m">
            {faqData.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
    </>
  );
};

export default FAQScreen;
