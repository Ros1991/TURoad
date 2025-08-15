import { api, setTokens, clearTokens } from './api';

export interface LoginDto {
  emailOrUsername: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    isAdmin: boolean;
    emailVerified: boolean;
  };
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  /**
   * Login user
   */
  async login(data: LoginDto): Promise<any> {
    const response: any = await api.post('/auth/login', data);
    console.log('🔐 Auth service received:', response);
    
    // Handle wrapped response format
    const authData = response.data || response;
    console.log('🔑 Auth data extracted:', authData);
    
    if (authData.accessToken && authData.refreshToken) {
      setTokens(authData.accessToken, authData.refreshToken);
      console.log('💾 Tokens saved successfully');
    } else {
      console.warn('⚠️ No tokens found in response:', authData);
    }
    
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if request fails
      console.error('Logout request failed:', error);
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<any> {
    return api.get('/auth/me');
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    await api.post('/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    await api.post('/auth/reset-password', data);
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordDto): Promise<void> {
    await api.post('/auth/change-password', data);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await api.get(`/auth/verify-email/${token}`);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get stored user data
   */
  getStoredUser(): any {
    try {
      const userData = localStorage.getItem('user');
      if (!userData || userData === 'undefined' || userData === 'null') {
        return null;
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  }

  /**
   * Store user data
   */
  storeUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear user data
   */
  clearUser(): void {
    localStorage.removeItem('user');
  }

  /**
   * Clear tokens
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: any): Promise<any> {
    return api.put('/auth/profile', data);
  }
}

export const authService = new AuthService();
export default authService;
