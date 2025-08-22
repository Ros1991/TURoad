export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  phoneNumber?: string;
  profilePicture?: string;
  pushNotificationEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  phoneNumber?: string;
  pushNotificationEnabled?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
