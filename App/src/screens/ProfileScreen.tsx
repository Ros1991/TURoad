import React from 'react';
import { ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Box, Text } from '../components';

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();

  const ProfileItem = ({ title, icon, onPress, showArrow = true }: { 
    title: string; 
    icon: string; 
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity onPress={onPress}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="l"
        paddingVertical="m"
        backgroundColor="white"
        borderBottomWidth={0.5}
        borderBottomColor="light"
      >
        <Box flexDirection="row" alignItems="center">
          <Text marginRight="m" style={{ fontSize: 16 }}>{icon}</Text>
          <Text variant="body" color="textPrimary" style={{ fontSize: 16 }}>
            {title}
          </Text>
        </Box>
        {showArrow && (
          <Text color="secondary" style={{ fontSize: 16 }}>›</Text>
        )}
      </Box>
    </TouchableOpacity>
  );

  const LanguageItem = () => (
    <TouchableOpacity>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="l"
        paddingVertical="m"
        backgroundColor="white"
        borderBottomWidth={0.5}
        borderBottomColor="light"
      >
        <Box flexDirection="row" alignItems="center">
          <Text marginRight="m" style={{ fontSize: 16 }}>🌐</Text>
          <Text variant="body" color="textPrimary" style={{ fontSize: 16 }}>
            Idioma
          </Text>
        </Box>
        <Box flexDirection="row" alignItems="center">
          <Text variant="body" color="secondary" marginRight="s" style={{ fontSize: 16 }}>
            Português
          </Text>
          <Text color="secondary" style={{ fontSize: 16 }}>›</Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text 
      variant="body" 
      color="secondary" 
      marginTop="l" 
      marginBottom="s" 
      marginHorizontal="l"
      style={{ 
        fontSize: 13, 
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5
      }}
    >
      {title}
    </Text>
  );

  const SectionContainer = ({ children }: { children: React.ReactNode }) => (
    <Box marginBottom="l" backgroundColor="white" style={{ 
      borderRadius: 0,
      shadowColor: 'transparent',
      elevation: 0
    }}>
      {children}
    </Box>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <ScrollView style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
        <Box paddingTop="xl">
          {/* User Profile Header */}
          <Box 
            backgroundColor="white" 
            paddingHorizontal="l" 
            paddingVertical="l"
            marginBottom="l"
          >
            <Box flexDirection="row" alignItems="center">
              <Image
                source={{ uri: 'https://via.placeholder.com/70x70/4ECDC4/FFFFFF?text=AB' }}
                style={{ 
                  width: 70, 
                  height: 70, 
                  borderRadius: 35, 
                  marginRight: 16 
                }}
              />
              <Box>
                <Text 
                  variant="subheader" 
                  color="textPrimary"
                  style={{ fontSize: 22, fontWeight: '600', marginBottom: 4 }}
                >
                  Altair Bezerra
                </Text>
                <Text 
                  variant="body" 
                  color="secondary"
                  style={{ fontSize: 16 }}
                >
                  altair@gmail.com
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Navigation Section */}
          <SectionHeader title="NAVEGAÇÃO" />
          <SectionContainer>
            <ProfileItem title="Histórico de rotas" icon="🗺️" />
            <ProfileItem title="Favoritos" icon="🖤" />
          </SectionContainer>

          {/* Account Information Section */}
          <SectionHeader title="INFORMAÇÕES DA CONTA" />
          <SectionContainer>
            <ProfileItem title="Informações pessoais" icon="👤" />
          </SectionContainer>

          {/* Security Section */}
          <SectionHeader title="SEGURANÇA" />
          <SectionContainer>
            <ProfileItem title="Alterar senha" icon="🔒" />
          </SectionContainer>

          {/* App Settings Section */}
          <SectionHeader title="CONFIGURAÇÕES DO APLICATIVO" />
          <SectionContainer>
            <LanguageItem />
            <ProfileItem title="Notificações" icon="🔔" />
            <ProfileItem title="Central de ajuda" icon="❓" />
          </SectionContainer>

          {/* Others Section */}
          <SectionHeader title="OUTROS" />
          <SectionContainer>
            <TouchableOpacity>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal="l"
                paddingVertical="m"
                backgroundColor="white"
              >
                <Box flexDirection="row" alignItems="center">
                  <Text marginRight="m" style={{ fontSize: 16, color: '#FF3B30' }}>↗</Text>
                  <Text 
                    variant="body" 
                    style={{ fontSize: 16, color: '#FF3B30', fontWeight: '500' }}
                  >
                    Sair
                  </Text>
                </Box>
                <Text style={{ fontSize: 16, color: '#FF3B30' }}>›</Text>
              </Box>
            </TouchableOpacity>
          </SectionContainer>

          {/* Bottom spacing for tab bar */}
          <Box height={20} />
        </Box>
      </ScrollView>
    </>
  );
};

export default ProfileScreen;

