import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from './index';

export interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

interface CustomToastProps extends ToastConfig {
  visible: boolean;
  onHide: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({
  type,
  title,
  message,
  duration = 3000,
  visible,
  onHide,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'success',
          iconName: 'check-circle',
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          backgroundColor: 'danger',
          iconName: 'alert-circle',
          iconColor: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: 'warning',
          iconName: 'alert',
          iconColor: '#FFFFFF',
        };
      case 'info':
        return {
          backgroundColor: 'info',
          iconName: 'information',
          iconColor: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: 'secondary',
          iconName: 'information',
          iconColor: '#FFFFFF',
        };
    }
  };

  const typeConfig = getTypeConfig();

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
      onClose?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 100,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
      >
        <Box
          backgroundColor="white"
          borderRadius={12}
          padding="m"
          flexDirection="row"
          alignItems="center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            borderLeftWidth: 4,
            borderLeftColor: typeConfig.backgroundColor as any,
            ...(type === 'error' && {
              borderRightWidth: 4,
              borderRightColor: typeConfig.backgroundColor as any,
            }),
          }}
        >
          {/* Icon */}
          <Box
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={typeConfig.backgroundColor as any}
            justifyContent="center"
            alignItems="center"
            marginRight="m"
          >
            <Icon 
              name={typeConfig.iconName as any} 
              size={20} 
              color={typeConfig.iconColor} 
            />
          </Box>

          {/* Content */}
          <Box flex={1} marginRight="s">
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: message ? 2 : 0,
              }}
            >
              {title}
            </Text>
            {message && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  lineHeight: 18,
                }}
              >
                {message}
              </Text>
            )}
          </Box>

          {/* Close button */}
          <TouchableOpacity onPress={hideToast}>
            <Box
              width={24}
              height={24}
              justifyContent="center"
              alignItems="center"
            >
              <Icon name="close" size={18} color="#9CA3AF" />
            </Box>
          </TouchableOpacity>
        </Box>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CustomToast;
