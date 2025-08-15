import { Category } from '@/entities/Category';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '@/dtos/CategoryDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class CategoryMapper extends BaseMapper<Category> {
  static toEntity(createDto: CreateCategoryDto): Category {
    const category = new Category();
    category.nameTextRefId = createDto.nameTextRefId;
    return category;
  }

  static toEntityFromUpdate(entity: Category, dto: UpdateCategoryDto): void {
    if (dto.nameTextRefId !== undefined) entity.nameTextRefId = dto.nameTextRefId;
  }

  static toResponseDto(entity: Category): CategoryResponseDto {
    return {
      id: entity.categoryId,
      categoryId: entity.categoryId,
      nameTextRefId: entity.nameTextRefId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      isDeleted: entity.isDeleted
    };
  }
}
