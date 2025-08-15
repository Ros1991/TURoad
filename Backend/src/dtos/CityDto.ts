import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsString, IsNumber, IsUrl } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateCityDto implements IDto {
  @IsNotEmpty()
  @IsInt()
  nameTextRefId!: number;

  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;

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
  @IsInt()
  whatToObserveTextRefId?: number;
}

// UPDATE
export class UpdateCityDto implements IDto {
  @IsOptional()
  @IsInt()
  nameTextRefId?: number;

  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;

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
  @IsInt()
  whatToObserveTextRefId?: number;
}

// RESPONSE
export class CityResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  cityId!: number;
  
  @IsInt()
  nameTextRefId!: number;
  
  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;
  
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
  @IsInt()
  whatToObserveTextRefId?: number;
  
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
