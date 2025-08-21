import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const PasswordInput = ({ 
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
                  {t('changePassword.changePasswordButton')}
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
  );
};

export default ChangePasswordScreen;
