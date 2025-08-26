import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationService, Coordinates } from './LocationService';
import { config } from '../config/environment';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

class ApiService {
  private baseURL: string;

  constructor() {
    // Use API_URL from environment configuration
    // Falls back to Android emulator localhost if not configured
    this.baseURL = config.apiUrl;

  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('🔍 Getting auth token:', token ? `${token.substring(0, 20)}...` : 'null');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getCurrentLanguage(): Promise<string> {
    try {
      // ApiService agora usa a mesma chave que i18n.ts
      const language = await AsyncStorage.getItem('@TURoad:language');
      return language || 'pt';
    } catch (error) {
      console.error('Error getting language:', error);
      return 'pt';
    }
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add language header
    const language = await this.getCurrentLanguage();
    headers['Accept-Language'] = language;

    // Add location header if available (non-blocking with timeout)
    try {
      const locationPromise = locationService.getLocationForRequest();
      const location = await locationPromise;      
      
      if (location && location.latitude && location.longitude) {
        headers['X-User-Location'] = `${location.latitude},${location.longitude}`;
        if (location.accuracy) {
          headers['X-Location-Accuracy'] = location.accuracy.toString();
        }
      } else {
        console.log('❌ No valid location available for request');
      }
    } catch (error) {
      console.log('❌ Location header error:', error instanceof Error ? error.message : String(error));
      console.log('📍 Using request without location headers');
    }

    // Add auth token if requested and available
    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔒 Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
      } else {
        console.log('⚠️ No auth token available for request');
      }
    } else {
      console.log('📨 Request without authentication');
    }

    return headers;
  }

  async get<T>(endpoint: string, options?: { 
    params?: Record<string, any>; 
    headers?: Record<string, string>;
    includeAuth?: boolean;
  }): Promise<ApiResponse<T>> {
    try {
      const includeAuth = options?.includeAuth !== false;
      const baseHeaders = await this.getHeaders(includeAuth);
      const headers = { ...baseHeaders, ...options?.headers };
      
      // Build query string from params
      let url = `${this.baseURL}${endpoint}`;
      console.log('API URL:', this.baseURL);
      if (options?.params) {
        const queryString = new URLSearchParams(options.params).toString();
        url += `?${queryString}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API GET Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async post<T>(endpoint: string, body: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(includeAuth);
      console.log('API URL:', `${this.baseURL}${endpoint}`);
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API POST Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async put<T>(endpoint: string, body: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(includeAuth);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API PUT Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(includeAuth);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API DELETE Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Helper methods for auth token management
  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  async saveRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('refreshToken', token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  }

  async getAccessToken(): Promise<string | null> {
    return this.getAuthToken();
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async clearAuthTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
    }
  }
}

export const apiService = new ApiService();
