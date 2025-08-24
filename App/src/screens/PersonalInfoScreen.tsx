import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/ApiService';
import { useToast } from '../contexts/ToastContext';

const PersonalInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const response = await apiService.put(
        `/api/users/${user.id}`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }
      );

      if (response.success) {
        // Update user in context
        const updatedUser = {
          ...user,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`.trim() || email,
        };
        setUser(updatedUser);
        
        // Update stored user data
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        showToast({
          type: 'success',
          title: t('personalInfo.success'),
          message: t('personalInfo.successMessage'),
        });
      } else {
        showToast({
          type: 'error',
          title: t('personalInfo.error'),
          message: response.message || t('personalInfo.errorMessage'),
        });
      }
    } catch (error) {
      console.error('Error saving user info:', error);
      showToast({
        type: 'error',
        title: t('personalInfo.error'),
        message: t('personalInfo.errorMessage'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const response = await apiService.post(
        `/api/users/${user.id}/upload-profile-image`,
        {}
      );

      if (response.success && response.data) {
        const newProfileImage = (response.data as any).profileImage;
        
        // Update user context with new profile image
        const updatedUser = { ...user, profileImage: newProfileImage };
        setUser(updatedUser);
        
        // Update AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update local state
        setProfileImage(newProfileImage);
        
        showToast({
          type: 'success',
          title: t('profile.success'),
          message: 'Imagem de perfil atualizada com sucesso!',
        });
      } else {
        showToast({
          type: 'error',
          title: t('profile.error'),
          message: response.message || 'Erro ao atualizar imagem de perfil. Tente novamente.',
        });
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      showToast({
        type: 'error',
        title: t('profile.error'),
        message: 'Erro ao atualizar imagem de perfil. Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
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
              {email || 'user@example.com'}
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
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: '#F5F5F5',
                  }}
                />
              ) : (
                <Image
                  source={{ 
                    uri: `https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=${firstName.charAt(0)}${lastName.charAt(0)}` 
                  }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    marginRight: 12,
                  }}
                />
              )}
              <TouchableOpacity 
                onPress={handleProfileImageUpload}
                style={{ marginTop: 12 }}
                disabled={saving}
              >
                <Box
                  backgroundColor="white"
                  borderRadius={8}
                  paddingHorizontal="m"
                  paddingVertical="s"
                  flexDirection="row"
                  alignItems="center"
                  style={{
                    borderWidth: 1,
                    borderColor: saving ? '#999999' : '#035A6E',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#035A6E" />
                  ) : (
                    <Icon name="camera" size={20} color="#035A6E" />
                  )}
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: saving ? '#999999' : '#035A6E',
                    marginLeft: 8,
                  }}>
                    {saving ? 'Atualizando...' : 'Alterar foto'}
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
          </Box>

          {/* Name Fields */}
          <Box marginBottom="l">
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1A1A1A',
              marginBottom: 12,
            }}>
              {t('personalInfo.firstName')}
            </Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('personalInfo.firstNamePlaceholder')}
              style={{
                backgroundColor: 'white',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#1A1A1A',
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
            />
          </Box>

          <Box marginBottom="l">
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1A1A1A',
              marginBottom: 12,
            }}>
              {t('personalInfo.lastName')}
            </Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('personalInfo.lastNamePlaceholder')}
              style={{
                backgroundColor: 'white',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#1A1A1A',
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
            />
          </Box>

          {/* Save Button */}
          <Box marginTop="xl">
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
            >
              <Box
                backgroundColor="success"
                borderRadius={8}
                paddingVertical="m"
                justifyContent="center"
                alignItems="center"
                opacity={saving ? 0.6 : 1}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: 'white',
                  }}>
                    {t('personalInfo.saveInformation')}
                  </Text>
                )}
              </Box>
            </TouchableOpacity>
          </Box>
          <Box height={20} />
        </Box>
      </ScrollView>
    </Box>
  );
};

export default PersonalInfoScreen;
