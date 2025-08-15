import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateCategoryDto implements IDto {
  @IsNotEmpty()
  @IsInt()
  nameTextRefId!: number;
}

// UPDATE
export class UpdateCategoryDto implements IDto {
  @IsOptional()
  @IsInt()
  nameTextRefId?: number;
}

// RESPONSE
export class CategoryResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  categoryId!: number;
  
  @IsInt()
  nameTextRefId!: number;
  
  @IsDateString()
  createdAt!: Date;
  
  @IsDateString()
  updatedAt!: Date;
  
  @IsOptional()
  @IsDateString()
  deletedAt?: Date | null;
  
  @IsBoolean()
  isDeleted!: boolean;
}
