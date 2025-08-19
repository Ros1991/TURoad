import api from './api';

export interface UserPushSettings {
  userId: number;
  activeRouteNotifications: boolean;
  travelTipsNotifications: boolean;
  nearbyEventsNotifications: boolean;
  availableNarrativesNotifications: boolean;
  localOffersNotifications: boolean;
}

export interface UpdateUserPushSettingsDto {
  activeRouteNotifications?: boolean;
  travelTipsNotifications?: boolean;
  nearbyEventsNotifications?: boolean;
  availableNarrativesNotifications?: boolean;
  localOffersNotifications?: boolean;
}

class UserPushSettingsService {
  async getUserSettings(userId: number): Promise<UserPushSettings> {
    const response = await api.get(`/users/${userId}/push-settings`);
    return response.data.data;
  }

  async updateUserSettings(userId: number, settings: UpdateUserPushSettingsDto): Promise<UserPushSettings> {
    const response = await api.put(`/users/${userId}/push-settings`, settings);
    return response.data.data;
  }

  async createDefaultSettings(userId: number): Promise<UserPushSettings> {
    const response = await api.post(`/users/${userId}/push-settings`);
    return response.data.data;
  }
}

export default new UserPushSettingsService();
