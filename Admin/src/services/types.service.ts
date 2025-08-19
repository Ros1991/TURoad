import { api, PaginatedRequest, PaginatedResponse } from './api';

export interface LocalizedText {
  language: string;
  text: string;
}

export interface Type {
  typeId: number;
  nameTextRefId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  isDeleted: boolean;
  // Localized fields
  name?: string;
  // Legacy support for translations
  nameTranslations?: LocalizedText[];
}

export interface CreateTypeDto {
  nameTextRefId: number;
}

export interface UpdateTypeDto {
  nameTextRefId?: number;
}

class TypesService {
  private basePath = '/types';

  /**
   * Get paginated list of types
   */
  async getTypes(params?: PaginatedRequest): Promise<PaginatedResponse<Type>> {
    return api.get<PaginatedResponse<Type>>(this.basePath, { params });
  }

  /**
   * Get all active types
   */
  async getActiveTypes(): Promise<Type[]> {
    return api.get<Type[]>(`${this.basePath}/active`);
  }

  /**
   * Get type by ID
   */
  async getTypeById(id: number): Promise<Type> {
    return api.get<Type>(`${this.basePath}/${id}`);
  }

  /**
   * Create new type
   */
  async createType(data: CreateTypeDto): Promise<Type> {
    return api.post<Type>(this.basePath, data);
  }

  /**
   * Update type
   */
  async updateType(id: number, data: UpdateTypeDto): Promise<Type> {
    return api.put<Type>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete type
   */
  async deleteType(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Toggle type status
   */
  async toggleTypeStatus(id: number): Promise<Type> {
    return api.patch<Type>(`${this.basePath}/${id}/toggle-status`);
  }

  /**
   * Get types with locations count
   */
  async getTypesWithStats(): Promise<any[]> {
    return api.get<any[]>(`${this.basePath}/stats`);
  }
}

export const typesService = new TypesService();
export default typesService;
