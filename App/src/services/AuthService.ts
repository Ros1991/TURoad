import { User } from "../types";
import { apiService, ApiResponse } from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('🔐 Starting login for:', email);
    
    const response = await apiService.post('/api/auth/login', {
      emailOrUsername: email,
      password: password
    }, false); // Don't include auth for login

    console.log('📡 Login response:', response);

    if (response.success && response.data) {
      const accessToken = (response.data as any).accessToken;
      const refreshToken = (response.data as any).refreshToken;
      
      console.log('🔑 Received tokens:', {
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
        refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null'
      });
      
      // Save tokens
      await apiService.saveAuthToken(accessToken);
      await apiService.saveRefreshToken(refreshToken);
      
      // Verify tokens were saved
      const savedAccessToken = await apiService.getAccessToken();
      const savedRefreshToken = await apiService.getRefreshToken();
      
      console.log('💾 Tokens saved verification:', {
        accessTokenSaved: savedAccessToken ? `${savedAccessToken.substring(0, 20)}...` : 'null',
        refreshTokenSaved: savedRefreshToken ? `${savedRefreshToken.substring(0, 20)}...` : 'null'
      });
      
      // Save user data
      const userData = (response.data as any).user;
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      console.log('✅ Login completed successfully');
      
      return {
        id: userData.userId.toString(),
        email: userData.email,
        name: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.firstName || userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin || false
      };
    }
    
    console.log('❌ Login failed - response not successful');
    return null;
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
};

export const register = async (
  email: string, 
  password: string
): Promise<{ success: true; user: User } | { success: false; message: string }> => {
  try {
    const response = await apiService.post('/api/auth/register', {
      email,
      password
    }, false); // Don't include auth for registration

    if (response.success && response.data) {
      // Save tokens
      await apiService.saveAuthToken((response.data as any).accessToken);
      await apiService.saveRefreshToken((response.data as any).refreshToken);
      
      // Save user data
      const userData = (response.data as any).user;
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      const user: User = {
        id: userData.userId.toString(),
        email: userData.email,
        name: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.firstName || userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin || false
      };
      
      return { success: true, user };
    }
    
    // If response has a message, use it; otherwise use default
    return { 
      success: false, 
      message: response.message || 'Erro no registro. Tente novamente.' 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: 'Erro no registro. Verifique sua conexão.' 
    };
  }
};

export const forgotPassword = async (email: string): Promise<boolean> => {
  try {
    // TODO: Implement forgot password endpoint when available
    console.log('Forgot password for:', email);
    return true;
  } catch (error) {
    console.error('Forgot password error:', error);
    return false;
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = await apiService.getRefreshToken();
    if (refreshToken) {
      await apiService.post('/api/auth/logout', { refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local data
    await apiService.clearAuthTokens();
    await AsyncStorage.removeItem('userData');
  }
};

// Get current user from storage
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Validate stored token and auto-login if valid
export const validateStoredToken = async (): Promise<{ isValid: boolean; user: User | null }> => {
  console.log('🔍 Starting token validation...');
  
  try {
    const accessToken = await apiService.getAccessToken();
    const userData = await AsyncStorage.getItem('userData');
    
    if (!accessToken || !userData) {
      console.log('❌ No access token or user data found');
      return { isValid: false, user: null };
    }

    console.log('🔑 Found access token, validating with backend...');
    
    // Try to make an authenticated request to verify token
    const response = await apiService.get('/api/users/me');
    
    if (response.success && response.data) {
      console.log('✅ Token is valid, user authenticated');
      
      // Token is valid, return user data
      const user: User = {
        id: (response.data as any).userId?.toString() || JSON.parse(userData).id,
        email: (response.data as any).email || JSON.parse(userData).email,
        name: (response.data as any).firstName && (response.data as any).lastName 
          ? `${(response.data as any).firstName} ${(response.data as any).lastName}` 
          : (response.data as any).firstName || (response.data as any).email,
        firstName: (response.data as any).firstName,
        lastName: (response.data as any).lastName,
        profileImage: (response.data as any).profilePictureUrl,
        isAdmin: (response.data as any).isAdmin || false
      };
      
      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      return { isValid: true, user };
    }
    
    console.log('❌ Token validation failed - response not successful');
    
    // Clear invalid tokens
    await apiService.clearAuthTokens();
    await AsyncStorage.removeItem('userData');
    
    return { isValid: false, user: null };
  } catch (error) {
    console.log('❌ Token validation error:', error);
    
    // If token is expired/invalid, try to refresh it ONLY if we have a refresh token
    const storedRefreshToken = await apiService.getRefreshToken();
    
    if (storedRefreshToken) {
      console.log('🔄 Attempting token refresh...');
      
      try {
        const refreshResult = await refreshToken();
        if (refreshResult.success && refreshResult.user) {
          console.log('✅ Token refreshed successfully');
          return { isValid: true, user: refreshResult.user };
        }
      } catch (refreshError) {
        console.log('❌ Token refresh failed:', refreshError);
      }
    } else {
      console.log('❌ No refresh token available');
    }
    
    // Token is invalid and refresh failed, clear all stored data
    console.log('🧹 Clearing all auth data');
    await apiService.clearAuthTokens();
    await AsyncStorage.removeItem('userData');
    
    return { isValid: false, user: null };
  }
};

// Refresh access token using refresh token
export const refreshToken = async (): Promise<{ success: boolean; user: User | null }> => {
  try {
    const storedRefreshToken = await apiService.getRefreshToken();
    
    if (!storedRefreshToken) {
      return { success: false, user: null };
    }

    const response = await apiService.post('/api/auth/refresh', {
      refreshToken: storedRefreshToken
    }, false);

    if (response.success && response.data) {
      // Save new tokens
      await apiService.saveAuthToken((response.data as any).accessToken);
      await apiService.saveRefreshToken((response.data as any).refreshToken);
      
      // Update user data
      const userData = (response.data as any).user;
      const user: User = {
        id: userData.userId.toString(),
        email: userData.email,
        name: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.firstName || userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImage: userData.profilePictureUrl,
        isAdmin: userData.isAdmin || false
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      return { success: true, user };
    }
    
    return { success: false, user: null };
  } catch (error) {
    console.error('Refresh token error:', error);
    return { success: false, user: null };
  }
};


