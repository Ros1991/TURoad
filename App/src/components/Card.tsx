import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { 
  createRestyleComponent, 
  spacing, 
  backgroundColor, 
  layout,
  SpacingProps, 
  BackgroundColorProps, 
  LayoutProps 
} from '@shopify/restyle';
import { Theme } from '../themes/theme';

type RestyleProps = SpacingProps<Theme> & BackgroundColorProps<Theme> & LayoutProps<Theme>;

interface CardProps extends TouchableOpacityProps, RestyleProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

const BaseCard = createRestyleComponent<RestyleProps & TouchableOpacityProps, Theme>([
  spacing,
  backgroundColor,
  layout,
], TouchableOpacity);

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  style,
  ...rest 
}) => {
  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      padding: 16,
    };

    const variantStyles = {
      default: {},
      elevated: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      },
    };

    return [baseStyle, variantStyles[variant]];
  };

  return (
    <BaseCard 
      style={[getCardStyle(), style]} 
      {...rest}
    >
      {children}
    </BaseCard>
  );
};

export default Card;

