import React, { useState, useCallback } from 'react';
import { ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/ApiService';
import { useToast } from '../contexts/ToastContext';
import { validatePassword, validatePasswordConfirmation } from '../utils/validation';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    // Validation - current password
    if (!currentPassword || currentPassword.trim() === '') {
      showToast({
        type: 'error',
        title: t('changePassword.error'),
        message: t('changePassword.currentPasswordRequired'),
      });
      return;
    }

    // Validation - new password using same rules as registration
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      showToast({
        type: 'error',
        title: t('changePassword.error'),
        message: t(passwordValidation.errorKey!),
      });
      return;
    }

    // Validation - confirm password
    const confirmPasswordValidation = validatePasswordConfirmation(newPassword, confirmPassword);
    if (!confirmPasswordValidation.isValid) {
      showToast({
        type: 'error',
        title: t('changePassword.error'),
        message: t(confirmPasswordValidation.errorKey!),
      });
      return;
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      showToast({
        type: 'error',
        title: t('changePassword.error'),
        message: t('changePassword.samePassword'),
      });
      return;
    }

    setSaving(true);
    try {
      const response = await apiService.post(
        '/api/auth/change-password',
        {
          currentPassword,
          newPassword,
        }
      );

      if (response.success) {
        showToast({
          type: 'success',
          title: t('changePassword.success'),
          message: t('changePassword.successMessage'),
        });
        
        // Clear form and go back after a short delay
        setTimeout(() => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          navigation.goBack();
        }, 1500);
      } else {
        showToast({
          type: 'error',
          title: t('changePassword.error'),
          message: response.message || t('changePassword.errorMessage'),
        });
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      showToast({
        type: 'error',
        title: t('changePassword.error'),
        message: t('changePassword.errorMessage'),
      });
    } finally {
      setSaving(false);
    }
  };

  // Move PasswordInput outside to prevent re-renders and focus loss
  const PasswordInput = useCallback(({ 
    label, 
    value, 
    onChangeText, 
    showPassword, 
    onToggleShow 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    showPassword: boolean;
    onToggleShow: () => void;
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
        paddingVertical="m"
        flexDirection="row"
        alignItems="center"
        style={{
          borderWidth: 1,
          borderColor: '#E5E5E5',
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          style={{
            fontSize: 16,
            color: '#1A1A1A',
            padding: 0,
            flex: 1,
          }}
          placeholder="••••••••"
          placeholderTextColor="#999999"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleShow}>
          <Icon 
            name={showPassword ? 'eye-off' : 'eye'} 
            size={20} 
            color="#666666" 
          />
        </TouchableOpacity>
      </Box>
    </Box>
  ), []);

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
            {t('changePassword.title')}
          </Text>
        </Box>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Box padding="m">
            <PasswordInput
              label={t('changePassword.currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              showPassword={showCurrentPassword}
              onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            />

            <PasswordInput
              label={t('changePassword.newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              showPassword={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
            />

            <PasswordInput
              label={t('changePassword.confirmNewPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              showPassword={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Change Password Button */}
            <TouchableOpacity 
              style={{ marginTop: 16 }}
              onPress={handleChangePassword}
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
                    {t('changePassword.changePasswordButton')}
                  </Text>
                )}
              </Box>
            </TouchableOpacity>
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
  );
};

export default ChangePasswordScreen;
