import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateTypeDto implements IDto {
  @IsNotEmpty()
  @IsInt()
  nameTextRefId!: number;
}

// UPDATE
export class UpdateTypeDto implements IDto {
  @IsOptional()
  @IsInt()
  nameTextRefId?: number;
}

// RESPONSE
export class TypeResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  typeId!: number;
  
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
