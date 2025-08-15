import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsString, IsNumber, IsUrl } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateCityDto implements IDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @IsNotEmpty()
  @IsString()
  state!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  whatToObserve?: string;
}

// UPDATE
export class UpdateCityDto implements IDto {
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
  @IsString()
  state?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  whatToObserve?: string;
}

// RESPONSE
export class CityResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  cityId!: number;
  
  @IsString()
  name!: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsNumber()
  latitude!: number;
  
  @IsNumber()
  longitude!: number;
  
  @IsString()
  state!: string;
  
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
  
  @IsOptional()
  @IsString()
  whatToObserve?: string;
  
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
