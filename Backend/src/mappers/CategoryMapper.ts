import { Category } from '@/entities/Category';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '@/dtos/CategoryDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class CategoryMapper extends BaseMapper<Category> {
  static toEntity(createDto: CreateCategoryDto): Category {
    const category = new Category();
    if (createDto.nameTextRefId) {
      category.nameTextRefId = createDto.nameTextRefId;
    }
    if (createDto.descriptionTextRefId) {
      category.descriptionTextRefId = createDto.descriptionTextRefId;
    }
    if (createDto.imageUrl) {
      category.imageUrl = createDto.imageUrl;
    }
    return category;
  }

  static toEntityFromUpdate(entity: Category, dto: UpdateCategoryDto): void {
    if (dto.nameTextRefId !== undefined) entity.nameTextRefId = dto.nameTextRefId;
    if (dto.descriptionTextRefId !== undefined) entity.descriptionTextRefId = dto.descriptionTextRefId;
    if (dto.imageUrl !== undefined) entity.imageUrl = dto.imageUrl;
  }

  static toResponseDto(entity: Category): CategoryResponseDto {
    return {
      id: entity.categoryId,
      categoryId: entity.categoryId,
      name: '', // Will be populated by localized text system
      nameTextRefId: entity.nameTextRefId,
      description: '', // Will be populated by localized text system
      descriptionTextRefId: entity.descriptionTextRefId,
      imageUrl: entity.imageUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      isDeleted: entity.isDeleted
    };
  }
}
