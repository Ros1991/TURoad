import { PermissionsAndroid, Platform } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

class LocationService {
  private currentLocation: Coordinates | null = null;
  private isPermissionGranted: boolean = false;

  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // iOS permissions are handled automatically by react-native-permissions
        this.isPermissionGranted = true;
        console.log('✅ iOS location permission assumed granted');
        return true;
      }

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message: 'O TURoad precisa acessar sua localização para personalizar a experiência.',
            buttonNeutral: 'Perguntar depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Permitir',
          }
        );

        this.isPermissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        
        if (this.isPermissionGranted) {
          console.log('✅ Android location permission granted');
        } else {
          console.warn('❌ Android location permission denied');
        }
        
        return this.isPermissionGranted;
      }

      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(timeout: number = 10000): Promise<Coordinates | null> {
    try {
      // Always return mock coordinates for development (ignore permissions)
      console.log('🌍 Getting mock location for development...');
      
      this.currentLocation = {
        latitude: -10.9472, // Aracaju, SE coordinates
        longitude: -37.0731,
        accuracy: 100,
      };

      console.log('📍 Mock location (Aracaju):', this.currentLocation);
      return this.currentLocation;

    } catch (error) {
      console.warn('Error getting mock location:', error);
      return null;
    }
  }

  getCachedLocation(): Coordinates | null {
    return this.currentLocation;
  }

  async initializeLocation(): Promise<void> {
    await this.requestLocationPermission();
    await this.getCurrentLocation();
  }

  // Get location for POST requests (with timeout to not block UI)
  async getLocationForRequest(): Promise<Coordinates | null> {
    try {
      // Try to get cached location first
      if (this.currentLocation) {
        return this.currentLocation;
      }

      // Try to get fresh location with short timeout
      return await this.getCurrentLocation(5000);
    } catch (error) {
      console.warn('Could not get location for request:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();
