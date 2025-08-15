import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { LoginDto, RegisterDto } from '../services/auth.service';

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  isAdmin: boolean;
  emailVerified: boolean;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  phoneNumber?: string;
  createdAt?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            const profile = await authService.getProfile();
            setUser(profile);
            authService.storeUser(profile);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        authService.clearTokens();
        authService.clearUser();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (data: LoginDto) => {
    try {
      console.log('🔐 Attempting login with:', { email: data.emailOrUsername });
      const response: any = await authService.login(data);
      console.log('✅ Login successful:', response);
      
      // Extract actual data from wrapped response
      const loginData = response.data || response;
      console.log('📦 Login data:', loginData);
      
      if (loginData.user) {
        setUser(loginData.user);
        authService.storeUser(loginData.user);
        console.log('👤 User set:', loginData.user);
        
        // Check if tokens are saved
        const isAuth = authService.isAuthenticated();
        console.log('🔑 Is authenticated after login:', isAuth);
      }
      
      console.log('🏠 Navigating to dashboard...');
      navigate('/dashboard');
      
      console.log('🎯 Login process completed');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }, [navigate]);

  const register = useCallback(async (data: RegisterDto) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      authService.storeUser(response.user);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      authService.clearUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [navigate]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await authService.forgotPassword({ email });
    } catch (error) {
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      await authService.resetPassword({ token, newPassword: password });
    } catch (error) {
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      authService.storeUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    authService.storeUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;
