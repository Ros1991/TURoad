import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import Text from './Text';
import { Theme } from '../themes/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  marginBottom?: keyof Theme['spacing'];
  marginTop?: keyof Theme['spacing'];
  margin?: keyof Theme['spacing'];
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  style,
  marginBottom,
  marginTop,
  margin,
  ...touchableOpacityProps
}) => {

  const getButtonStyle = (): ViewStyle => {
    const spacingMap = { s: 8, m: 16, l: 24, xl: 40 };
    
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    };

    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 24 },
      large: { paddingVertical: 16, paddingHorizontal: 32 },
    };

    const variantStyles = {
      primary: { backgroundColor: '#002043' },
      secondary: { backgroundColor: '#FFFFFF' },
      outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#002043' },
    };

    const spacingStyle: ViewStyle = {};
    if (marginBottom) spacingStyle.marginBottom = spacingMap[marginBottom] || spacingMap.m;
    if (marginTop) spacingStyle.marginTop = spacingMap[marginTop] || spacingMap.m;
    if (margin) {
      spacingStyle.margin = spacingMap[margin] || spacingMap.m;
    }

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...spacingStyle,
    };
  };

  return (
    <TouchableOpacity 
      style={[getButtonStyle(), style]} 
      {...touchableOpacityProps}
    >
      <Text 
        variant="button" 
        color={variant === 'outline' ? 'primary' : 'white'}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;

