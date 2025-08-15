import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsNumber, IsString, IsUrl } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateLocationDto implements IDto {
  @IsNotEmpty()
  @IsInt()
  cityId!: number;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsInt()
  typeId?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

// UPDATE
export class UpdateLocationDto implements IDto {
  @IsOptional()
  @IsInt()
  cityId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsInt()
  typeId?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

// RESPONSE
export class LocationResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  locationId!: number;
  
  @IsInt()
  cityId!: number;
  
  @IsString()
  name!: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsNumber()
  latitude?: number;
  
  @IsOptional()
  @IsNumber()
  longitude?: number;
  
  @IsOptional()
  @IsInt()
  typeId?: number;
  
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
  
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
