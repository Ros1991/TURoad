import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { Theme } from '../themes/theme';
import Box from './Box';
import Text from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  marginBottom?: keyof Theme['spacing'];
  marginTop?: keyof Theme['spacing'];
  margin?: keyof Theme['spacing'];
  leftIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  style,
  marginBottom,
  marginTop,
  margin,
  leftIcon,
  ...textInputProps 
}) => {

  return (
    <Box marginBottom={marginBottom || "m"}>
      {label && (
        <Text variant="body" color="textPrimary" marginBottom="s">
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithIcon : null, style]}
          placeholderTextColor="#999"
          {...textInputProps}
        />
      </View>
      {error && (
        <Text variant="body" color="danger" marginTop="s">
          {error}
        </Text>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  iconContainer: {
    paddingLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Input;

