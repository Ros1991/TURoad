import { api, PaginatedRequest, PaginatedResponse } from './api';

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  isAdmin: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  isAdmin?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  isAdmin?: boolean;
  enabled?: boolean;
}

export interface PushSettings {
  notificationsEnabled: boolean;
  newRoutes: boolean;
  newLocations: boolean;
  routeUpdates: boolean;
  systemUpdates: boolean;
  promotions: boolean;
}

class UsersService {
  private basePath = '/users';

  /**
   * Get paginated list of users
   */
  async getUsers(params?: PaginatedRequest): Promise<PaginatedResponse<User>> {
    return api.get<PaginatedResponse<User>>(this.basePath, { params });
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    return api.get<User>(`${this.basePath}/${id}`);
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserDto): Promise<User> {
    return api.post<User>(this.basePath, data);
  }

  /**
   * Update user
   */
  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    return api.put<User>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Toggle user status (enable/disable)
   */
  async toggleUserStatus(id: number): Promise<User> {
    return api.patch<User>(`${this.basePath}/${id}/toggle-status`);
  }

  /**
   * Get user push settings
   */
  async getPushSettings(id: number): Promise<PushSettings> {
    return api.get<PushSettings>(`${this.basePath}/${id}/push-settings`);
  }

  /**
   * Update user push settings
   */
  async updatePushSettings(id: number, settings: Partial<PushSettings>): Promise<PushSettings> {
    return api.put<PushSettings>(`${this.basePath}/${id}/push-settings`, settings);
  }

  /**
   * Send test push notification
   */
  async sendTestPush(id: number, message: string): Promise<void> {
    return api.post<void>(`${this.basePath}/${id}/test-push`, { message });
  }

  /**
   * Revoke all user tokens
   */
  async revokeTokens(id: number): Promise<void> {
    return api.post<void>(`${this.basePath}/${id}/revoke-tokens`);
  }

  /**
   * Upload user profile picture
   */
  async uploadProfilePicture(id: number, file: File, onProgress?: (progress: number) => void): Promise<User> {
    return api.upload<User>(`${this.basePath}/${id}/profile-picture`, file, onProgress);
  }
}

export const usersService = new UsersService();
export default usersService;
