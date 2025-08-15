import { Type } from '@/entities/Type';
import { CreateTypeDto, UpdateTypeDto, TypeResponseDto } from '@/dtos/TypeDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class TypeMapper extends BaseMapper<Type> {
  static toEntity(createDto: CreateTypeDto): Type {
    const type = new Type();
    type.nameTextRefId = createDto.nameTextRefId;
    return type;
  }

  static toEntityFromUpdate(entity: Type, dto: UpdateTypeDto): void {
    if (dto.nameTextRefId !== undefined) entity.nameTextRefId = dto.nameTextRefId;
  }

  static toResponseDto(entity: Type): TypeResponseDto {
    return {
      id: entity.typeId,
      typeId: entity.typeId,
      nameTextRefId: entity.nameTextRefId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      isDeleted: entity.isDeleted
    };
  }
}
