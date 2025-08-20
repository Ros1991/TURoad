import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Box, Text, Button, Input, AuthHeader } from '../components';
import { register } from '../services/AuthService';

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
};

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('alerts.error'), t('alerts.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('alerts.error'), t('alerts.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const user = await register(email, password);
      if (user) {
        navigation.replace('MainTabs');
      } else {
        Alert.alert(t('alerts.error'), t('alerts.registerError'));
      }
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.registerError'));
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

        <Button
          title={loading ? t('common.loading') : t('register.createAccount')}
          variant="primary"
          marginBottom="l"
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
