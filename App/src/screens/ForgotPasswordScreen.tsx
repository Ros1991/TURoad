import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Box, Text, Button, Input, AuthHeader } from '../components';
import { forgotPassword } from '../services/AuthService';

type RootStackParamList = {
  ForgotPassword: undefined;
  Login: undefined;
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(t('alerts.error'), t('alerts.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const success = await forgotPassword(email);
      if (success) {
        Alert.alert(t('alerts.success'), t('alerts.passwordResetSent'), [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert(t('alerts.error'), t('alerts.passwordResetError'));
      }
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.passwordResetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="white">
      <AuthHeader />
      <ScrollView style={{ flex: 1 }}>
        <Box padding="l" paddingTop="l">
          <Text 
            style={{
              fontFamily: 'ASAP',
              fontWeight: 'bold',
              fontSize: 32,
              color: '#035A6E',
              marginBottom: 16
            }}
          >
            {t('forgotPassword.title')}
          </Text>

        <Text variant="body" color="textPrimary" marginBottom="xl">
          {t('forgotPassword.subtitle')}
        </Text>

        <Input
          label={t('forgotPassword.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder={t('forgotPassword.email')}
        />

        <Button
          title={loading ? t('common.loading') : t('forgotPassword.sendPassword')}
          variant="primary"
          marginBottom="xl"
          onPress={handleForgotPassword}
          disabled={loading}
        />

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text variant="body" color="primary" textAlign="center">
            {t('forgotPassword.rememberPassword')}
          </Text>
        </TouchableOpacity>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default ForgotPasswordScreen;

