import React from 'react';
import { ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Text } from '../components';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>(); // Using any temporarily until navigation types are defined
  const { t } = useTranslation();

  const ProfileItem = ({ title, iconName, onPress, showArrow = true, textColor = '#1A1A1A', iconColor = '#666666' }: { 
    title: string; 
    iconName: string; 
    onPress?: () => void;
    showArrow?: boolean;
    textColor?: string;
    iconColor?: string;
  }) => (
    <TouchableOpacity onPress={onPress}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="l"
        paddingVertical="m"
        backgroundColor="white"
      >
        <Box flexDirection="row" alignItems="center">
          <Box
            width={24}
            height={24}
            justifyContent="center"
            alignItems="center"
            marginRight="m"
          >
            <Icon name={iconName} size={20} color={iconColor} />
          </Box>
          <Text style={{ fontSize: 16, color: textColor, fontWeight: '400' }}>
            {title}
          </Text>
        </Box>
        {showArrow && (
          <Icon name="chevron-right" size={20} color="#C7C7CC" />
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
      >
        <Box flexDirection="row" alignItems="center">
          <Box
            width={24}
            height={24}
            justifyContent="center"
            alignItems="center"
            marginRight="m"
          >
            <Icon name="web" size={20} color="#666666" />
          </Box>
          <Text style={{ fontSize: 16, color: '#1A1A1A', fontWeight: '400' }}>
            Idioma
          </Text>
        </Box>
        <Box flexDirection="row" alignItems="center">
          <Text style={{ fontSize: 16, color: '#666666', marginRight: 8 }}>
            Português
          </Text>
          <Icon name="chevron-right" size={20} color="#C7C7CC" />
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

  const CardItem = ({ children }: { children: React.ReactNode }) => (
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
      {children}
    </Box>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <ScrollView style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
        <Box style={{ paddingTop: 60 }}>
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
          <CardItem>
            <ProfileItem 
              title="Histórico de rotas" 
              iconName="map-marker-path" 
              onPress={() => navigation.navigate('RouteHistory')} 
            />
          </CardItem>
          <CardItem>
            <ProfileItem 
              title="Favoritos" 
              iconName="heart" 
              onPress={() => navigation.navigate('Favorites')} 
            />
          </CardItem>

          {/* Account Information Section */}
          <SectionHeader title="INFORMAÇÕES DA CONTA" />
          <CardItem>
            <ProfileItem 
              title="Informações pessoais" 
              iconName="account" 
              onPress={() => navigation.navigate('PersonalInfo')} 
            />
          </CardItem>

          {/* Security Section */}
          <SectionHeader title="SEGURANÇA" />
          <CardItem>
            <ProfileItem 
              title="Alterar senha" 
              iconName="lock" 
              onPress={() => navigation.navigate('ChangePassword')} 
            />
          </CardItem>

          {/* App Settings Section */}
          <SectionHeader title="CONFIGURAÇÕES DO APLICATIVO" />
          <CardItem>
            <TouchableOpacity onPress={() => navigation.navigate('Language')}>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal="l"
                paddingVertical="m"
                backgroundColor="white"
              >
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={24}
                    height={24}
                    justifyContent="center"
                    alignItems="center"
                    marginRight="m"
                  >
                    <Icon name="web" size={20} color="#666666" />
                  </Box>
                  <Text style={{ fontSize: 16, color: '#1A1A1A', fontWeight: '400' }}>
                    Idioma
                  </Text>
                </Box>
                <Box flexDirection="row" alignItems="center">
                  <Text style={{ fontSize: 16, color: '#666666', marginRight: 8 }}>
                    Português
                  </Text>
                  <Icon name="chevron-right" size={20} color="#C7C7CC" />
                </Box>
              </Box>
            </TouchableOpacity>
          </CardItem>
          <CardItem>
            <ProfileItem 
              title="Notificações" 
              iconName="bell" 
              onPress={() => navigation.navigate('Notifications')} 
            />
          </CardItem>
          <CardItem>
            <ProfileItem 
              title="Central de ajuda" 
              iconName="help-circle" 
              onPress={() => navigation.navigate('HelpCenter')} 
            />
          </CardItem>

          {/* Others Section */}
          <SectionHeader title="OUTROS" />
          <CardItem>
            <ProfileItem 
              title="Sair" 
              iconName="logout" 
              textColor="#FF3B30" 
              iconColor="#FF3B30"
              onPress={() => {
                // TODO: Implementar lógica de logout
                console.log('Logout pressed');
              }}
            />
          </CardItem>

          {/* Bottom spacing for tab bar */}
          <Box height={20} />
        </Box>
      </ScrollView>
    </>
  );
};

export default ProfileScreen;

