import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, logout as authLogout, validateStoredToken } from '../services/AuthService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const providerId = React.useRef(Math.random().toString(36).substr(2, 9));
  console.log(`🔐 AuthProvider: Component mounting - ID: ${providerId.current}`);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    return () => {
      console.log(`🗑️ AuthProvider: Component unmounting - ID: ${providerId.current}`);
    };
  }, []);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    console.log('🔐 AuthContext: checkAuthState started');
    try {
      // First try to validate stored token
      const tokenValidation = await validateStoredToken();
      console.log('🔐 AuthContext: tokenValidation result', tokenValidation);
      
      if (tokenValidation.isValid && tokenValidation.user) {
        console.log('🔐 AuthContext: Setting user (valid token)', tokenValidation.user.email);
        setUser(tokenValidation.user);
      } else {
        // Token is invalid or expired, clear user data
        console.log('🔐 AuthContext: Setting user to null (invalid token)');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      console.log('🔐 AuthContext: Setting user to null (error)');
      setUser(null);
    } finally {
      console.log('🔐 AuthContext: Setting loading to false');
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails on backend, clear local state
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
