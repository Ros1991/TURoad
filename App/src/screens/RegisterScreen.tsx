import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Box, Text, Button, Input, AuthHeader } from '../components';
import { register } from '../services/AuthService';
import { validateEmail, validatePassword, validatePasswordConfirmation } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
};

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError(''); // Clear previous errors

    // Client-side validation with translations
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(t(emailValidation.errorKey!));
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(t(passwordValidation.errorKey!));
      return;
    }

    const confirmPasswordValidation = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmPasswordValidation.isValid) {
      setError(t(confirmPasswordValidation.errorKey!));
      return;
    }

    setLoading(true);
    try {
      const result = await register(email, password);
      if (result.success) {
        // Update AuthContext with the registered user
        if (result.user) {
          setUser(result.user);
        }
        navigation.replace('MainTabs');
      } else {
        // Only show backend errors if client-side validation passes
        setError(result.message);
      }
    } catch (error) {
      setError(t('alerts.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="white">
      <AuthHeader withBackground={false} />
      <ScrollView style={{ flex: 1 }}>
        <Box padding="l" paddingTop="l" backgroundColor="white">
          <Text 
            style={{
              fontFamily: 'ASAP',
              fontWeight: 'bold',
              fontSize: 32,
              color: '#035A6E',
              marginBottom: 24
            }}
          >
            {t('register.title')}
          </Text>

        <Input
          label={t('register.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder={t('register.email')}
        />

        <Input
          label={t('register.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={t('register.password')}
        />

        <Input
          label={t('register.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder={t('register.confirmPassword')}
        />

        {error ? (
          <Box
            paddingVertical="m"
            paddingHorizontal="m"
            marginVertical="m"
            style={{
              backgroundColor: '#FFEAEA',
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: '#DC3545',
                fontSize: 14,
                fontFamily: 'ASAP',
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              {error}
            </Text>
          </Box>
        ) : null}

        <Button
          title={loading ? t('common.loading') : t('register.createAccount')}
          variant="primary"
          marginBottom="l"
          marginTop="l"
          onPress={handleRegister}
          disabled={loading}
          style={{ backgroundColor: '#002043', borderRadius: 8 }}
        />

        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          style={{ marginBottom: 24, paddingVertical: 8 }}
        >
          <Text style={{ textAlign: 'center', fontSize: 14, color: '#6C757D' }}>
            {t('register.alreadyHaveAccount')}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={{
            backgroundColor: '#1877F2',
            borderRadius: 8,
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}
        >
          <Text style={{ fontSize: 18, marginRight: 8, color: 'white' }}>📘</Text>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {t('register.createWithFacebook')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#F8F9FA',
            borderRadius: 8,
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E9ECEF'
          }}
        >
          <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
          <Text style={{ color: '#495057', fontSize: 16, fontWeight: '600' }}>
            {t('register.createWithGoogle')}
          </Text>
        </TouchableOpacity> */}
        </Box>
      </ScrollView>
    </Box>
  );
};

export default RegisterScreen;
