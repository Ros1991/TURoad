import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsString } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateCategoryDto implements IDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  nameTextRefId?: number;
}

// UPDATE
export class UpdateCategoryDto implements IDto {
  @IsOptional()
  @IsString()
  name?: string;

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
  
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  nameTextRefId?: number;
  
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
