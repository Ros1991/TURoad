import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Text } from './index';

interface AuthHeaderProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ 
  showBackButton = true, 
  onBackPress 
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <Box style={styles.container}>
      <Box style={styles.content}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    height: 90, // 40px paddingTop + 50px height
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  backButton: {
    width: 44,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});

export default AuthHeader;
