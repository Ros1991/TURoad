import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsString } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateTypeDto implements IDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
}

// UPDATE
export class UpdateTypeDto implements IDto {
  @IsOptional()
  @IsString()
  name?: string;
}

// RESPONSE
export class TypeResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  typeId!: number;
  
  @IsString()
  name!: string;
  
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
