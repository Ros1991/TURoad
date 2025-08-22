import React from 'react';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Box, Text } from '../components';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>(); // Using any temporarily until navigation types are defined
  const { t } = useTranslation();
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // User will be redirected by navigation logic based on auth state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLoginRedirect = () => {
    navigation.navigate('Welcome');
  };

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
            <Icon name={iconName as any} size={20} color={iconColor} />
          </Box>
          <Text style={{ fontSize: 16, color: textColor, fontWeight: '400' }}>
            {title}
          </Text>
        </Box>
        {showArrow && (
          <Icon name="chevron-right" as any size={20} color="#C7C7CC" />
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
            <Icon name="web" as any size={20} color="#666666" />
          </Box>
          <Text style={{ fontSize: 16, color: '#1A1A1A', fontWeight: '400' }}>
            Idioma
          </Text>
        </Box>
        <Box flexDirection="row" alignItems="center">
          <Text style={{ fontSize: 16, color: '#666666', marginRight: 8 }}>
            Português
          </Text>
          <Icon name="chevron-right" as any size={20} color="#C7C7CC" />
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
              {/* Only show profile image for authenticated users with profile image */}
              {isAuthenticated && user?.profileImage && (
                <Image
                  source={{ uri: user.profileImage }}
                  style={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: 35, 
                    marginRight: 16 
                  }}
                />
              )}
              <Box flex={1}>
                <Text 
                  variant="subheader" 
                  color="textPrimary"
                  style={{ fontSize: 22, fontWeight: '600', marginBottom: 4 }}
                >
                  {isAuthenticated ? (user?.name || 'Usuário') : 'Convidado'}
                </Text>
                <Text 
                  variant="body" 
                  color="secondary"
                  style={{ fontSize: 16 }}
                >
                  {isAuthenticated ? (user?.name == user?.email ? '' : (user?.email || '')) : 'Faça login para acessar recursos completos'}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Navigation Section - Only for authenticated users */}
          {isAuthenticated && (
            <>
              <SectionHeader title={t('profile.navigation')} />
              <CardItem>
                <ProfileItem 
                  title={t('profile.routeHistory')} 
                  iconName="map-marker-path" 
                  onPress={() => navigation.navigate('RouteHistory')} 
                />
              </CardItem>
              <CardItem>
                <ProfileItem 
                  title={t('profile.favorites')} 
                  iconName="heart" 
                  onPress={() => navigation.navigate('Favorites')} 
                />
              </CardItem>

              {/* Account Information Section */}
              <SectionHeader title={t('profile.accountInfo')} />
              <CardItem>
                <ProfileItem 
                  title={t('profile.personalInfo')} 
                  iconName="account" 
                  onPress={() => navigation.navigate('PersonalInfo')} 
                />
              </CardItem>

              {/* Security Section */}
              <SectionHeader title={t('profile.security')} />
              <CardItem>
                <ProfileItem 
                  title={t('profile.changePassword')} 
                  iconName="lock" 
                  onPress={() => navigation.navigate('ChangePassword')} 
                />
              </CardItem>
            </>
          )}

          {/* App Settings Section */}
          <SectionHeader title={t('profile.appSettings')} />
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
                    <Icon name="web" as any size={20} color="#666666" />
                  </Box>
                  <Text style={{ fontSize: 16, color: '#1A1A1A', fontWeight: '400' }}>
                    {t('profile.language')}
                  </Text>
                </Box>
                <Box flexDirection="row" alignItems="center">
                  <Text style={{ fontSize: 16, color: '#666666', marginRight: 8 }}>
                    {availableLanguages.find(lang => lang.code === currentLanguage)?.name || 'Português'}
                  </Text>
                  <Icon name="chevron-right" as any size={20} color="#C7C7CC" />
                </Box>
              </Box>
            </TouchableOpacity>
          </CardItem>
          {/* Notifications - Only for authenticated users */}
          {isAuthenticated && (
            <CardItem>
              <ProfileItem 
                title={t('profile.notifications')} 
                iconName="bell" 
                onPress={() => navigation.navigate('Notifications')} 
              />
            </CardItem>
          )}
          <CardItem>
            <ProfileItem 
              title={t('profile.helpCenter')} 
              iconName="help-circle" 
              onPress={() => navigation.navigate('HelpCenter')} 
            />
          </CardItem>

          {/* Others Section */}
          <SectionHeader title={t('profile.others')} />
          <CardItem>
            {isAuthenticated ? (
              <ProfileItem 
                title={t('profile.logout')} 
                iconName="logout" 
                textColor="#FF3B30" 
                iconColor="#FF3B30"
                onPress={handleLogout}
              />
            ) : (
              <ProfileItem 
                title={t('profile.login')} 
                iconName="login" 
                textColor="#007AFF" 
                iconColor="#007AFF"
                onPress={handleLoginRedirect}
              />
            )}
          </CardItem>

          {/* Bottom spacing for tab bar */}
          <Box height={20} />
        </Box>
    </ScrollView>
  );
};

export default ProfileScreen;

