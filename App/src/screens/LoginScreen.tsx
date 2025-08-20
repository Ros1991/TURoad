import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Box, Text, Button, Input, AuthHeader } from '../components';
import { login } from '../services/AuthService';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('alerts.error'), t('alerts.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        navigation.replace('MainTabs');
      } else {
        Alert.alert(t('alerts.error'), t('alerts.incorrectEmailOrPassword'));
      }
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.loginError'));
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
            {t('login.title')}
          </Text>

        <Input
          label={t('login.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder={t('login.email')}
        />

        <Input
          label={t('login.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={t('login.password')}
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text variant="body" color="primary" marginBottom="xl">
            {t('login.forgotPassword')}
          </Text>
        </TouchableOpacity>

        <Button
          title={loading ? t('common.loading') : t('login.login')}
          variant="primary"
          marginBottom="l"
          onPress={handleLogin}
          disabled={loading}
          style={{ backgroundColor: '#002043', borderRadius: 8 }}
        />

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')}
          style={{ marginBottom: 24, paddingVertical: 8 }}
        >
          <Text style={{ textAlign: 'center', fontSize: 14, color: '#6C757D' }}>
            {t('login.noAccount')}
          </Text>
        </TouchableOpacity>
{/* 
        <TouchableOpacity
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
            {t('login.loginWithFacebook')}
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
            {t('login.loginWithGoogle')}
          </Text> 
        </TouchableOpacity>*/}
        </Box>
      </ScrollView>
    </Box>
  );
};

export default LoginScreen;
